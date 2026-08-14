import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusSesiKonsultasi, TipePesan } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BookKonsultasiDto } from './dto/book-konsultasi.dto';
import { KirimPesanDto } from './dto/kirim-pesan.dto';
import { TolakKonsultasiDto } from './dto/tolak-konsultasi.dto';

const DOKTER_SELECT = {
  id: true,
  spesialisasi: true,
  tarifKonsultasi: true,
  statusOnline: true,
  user: { select: { id: true, nama: true, foto: true } },
} as const;

@Injectable()
export class KonsultasiService {
  constructor(private prisma: PrismaService) {}

  // ==========================================
  // JADWAL TERSEDIA (publik, buat customer pilih slot)
  // ==========================================

  findJadwalTersedia(dokterId?: string, tanggal?: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return this.prisma.jadwalDokter.findMany({
      where: {
        dokterId,
        tanggal: tanggal ? new Date(tanggal) : { gte: startOfToday },
        dokter: { isActive: true },
      },
      include: { dokter: { select: DOKTER_SELECT } },
      orderBy: [{ tanggal: 'asc' }, { jamMulai: 'asc' }],
    });
  }

  // ==========================================
  // BOOKING (customer)
  // ==========================================

  async book(customerId: string, dto: BookKonsultasiDto) {
    const jadwal = await this.prisma.jadwalDokter.findUnique({
      where: { id: dto.jadwalId },
      include: { dokter: true },
    });

    if (!jadwal || jadwal.dokterId !== dto.dokterId) {
      throw new NotFoundException('Jadwal tidak ditemukan untuk dokter ini');
    }

    if (!jadwal.dokter.isActive) {
      throw new BadRequestException('Dokter tidak lagi aktif melayani konsultasi');
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (jadwal.tanggal < startOfToday) {
      throw new BadRequestException('Jadwal ini sudah lewat, tidak bisa dibooking');
    }

    const existingBooking = await this.prisma.sesiKonsultasi.findFirst({
      where: {
        customerId,
        jadwalId: dto.jadwalId,
        status: {
          in: [
            StatusSesiKonsultasi.MENUNGGU_PERSETUJUAN,
            StatusSesiKonsultasi.DISETUJUI,
          ],
        },
      },
    });
    if (existingBooking) {
      throw new ConflictException(
        'Kamu sudah punya booking aktif di jadwal ini',
      );
    }

    return this.prisma.sesiKonsultasi.create({
      data: {
        customerId,
        dokterId: dto.dokterId,
        jadwalId: dto.jadwalId,
        status: StatusSesiKonsultasi.MENUNGGU_PERSETUJUAN,
      },
      include: { dokter: { select: DOKTER_SELECT }, jadwal: true },
    });
  }

  async cancel(id: string, customerId: string) {
    const sesi = await this.findByIdOrThrow(id);

    if (sesi.customerId !== customerId) {
      throw new ForbiddenException('Ini bukan sesi konsultasi kamu');
    }
    if (sesi.status !== StatusSesiKonsultasi.MENUNGGU_PERSETUJUAN) {
      throw new BadRequestException(
        'Hanya sesi yang masih menunggu persetujuan yang bisa dibatalkan',
      );
    }

    return this.prisma.sesiKonsultasi.update({
      where: { id },
      data: { status: StatusSesiKonsultasi.DIBATALKAN },
    });
  }

  // ==========================================
  // APPROVE / TOLAK (dokter)
  // ==========================================

  async approve(id: string, dokterUserId: string) {
    const sesi = await this.findByIdWithDokterOrThrow(id);
    this.pastikanPemilikDokter(sesi, dokterUserId);

    if (sesi.status !== StatusSesiKonsultasi.MENUNGGU_PERSETUJUAN) {
      throw new BadRequestException(
        'Sesi ini sudah diproses sebelumnya, tidak bisa di-approve lagi',
      );
    }

    return this.prisma.sesiKonsultasi.update({
      where: { id },
      data: {
        status: StatusSesiKonsultasi.DISETUJUI,
        waktuDisetujui: new Date(),
      },
    });
  }

  async tolak(id: string, dokterUserId: string, dto: TolakKonsultasiDto) {
    const sesi = await this.findByIdWithDokterOrThrow(id);
    this.pastikanPemilikDokter(sesi, dokterUserId);

    if (sesi.status !== StatusSesiKonsultasi.MENUNGGU_PERSETUJUAN) {
      throw new BadRequestException(
        'Sesi ini sudah diproses sebelumnya, tidak bisa ditolak',
      );
    }

    return this.prisma.sesiKonsultasi.update({
      where: { id },
      data: {
        status: StatusSesiKonsultasi.DITOLAK,
        alasanPenolakan: dto.alasanPenolakan,
      },
    });
  }

  // ==========================================
  // SELESAIKAN SESI (dokter/customer) -> trigger pembayaran
  // ==========================================

  async selesaikan(id: string, currentUser: { userId: string }) {
    const sesi = await this.findByIdWithDokterOrThrow(id);

    const isCustomer = sesi.customerId === currentUser.userId;
    const isDokter = sesi.dokter.user.id === currentUser.userId;
    if (!isCustomer && !isDokter) {
      throw new ForbiddenException('Ini bukan sesi konsultasi kamu');
    }

    if (sesi.status !== StatusSesiKonsultasi.DISETUJUI) {
      throw new BadRequestException(
        'Hanya sesi yang sedang berlangsung yang bisa diselesaikan',
      );
    }

    // Update status sesi + buat tagihan pembayaran dalam 1 transaction.
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sesiKonsultasi.update({
        where: { id },
        data: {
          status: StatusSesiKonsultasi.SELESAI,
          waktuSelesai: new Date(),
        },
      });

      await tx.pembayaran.create({
        data: {
          sesiId: id,
          jumlah: sesi.dokter.tarifKonsultasi, // snapshot tarif saat sesi selesai
        },
      });

      return updated;
    });
  }

  // ==========================================
  // LISTING
  // ==========================================

  findMySessions(customerId: string) {
    return this.prisma.sesiKonsultasi.findMany({
      where: { customerId },
      include: {
        dokter: { select: DOKTER_SELECT },
        jadwal: true,
        pembayaran: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // "jadwal pasien" milik dokter
  async findPasienDokter(
    dokterUserId: string,
    status?: StatusSesiKonsultasi,
  ) {
    const dokter = await this.prisma.dokter.findUnique({
      where: { userId: dokterUserId },
    });
    if (!dokter) {
      throw new NotFoundException('Profil dokter tidak ditemukan');
    }

    return this.prisma.sesiKonsultasi.findMany({
      where: { dokterId: dokter.id, status },
      include: {
        customer: { select: { id: true, nama: true, foto: true, noHp: true } },
        jadwal: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, currentUser: { userId: string }) {
    const sesi = await this.findByIdWithDokterOrThrow(id);
    this.pastikanTerlibatDalamSesi(sesi, currentUser.userId);
    return sesi;
  }

  // ==========================================
  // CHAT (REST polling)
  // ==========================================

  async kirimPesan(
    id: string,
    currentUser: { userId: string },
    dto: KirimPesanDto,
  ) {
    const sesi = await this.findByIdWithDokterOrThrow(id);
    this.pastikanTerlibatDalamSesi(sesi, currentUser.userId);

    if (sesi.status !== StatusSesiKonsultasi.DISETUJUI) {
      throw new BadRequestException(
        'Chat hanya bisa dipakai selama sesi berstatus DISETUJUI',
      );
    }

    return this.prisma.pesanChat.create({
      data: {
        sesiId: id,
        pengirimId: currentUser.userId,
        isiPesan: dto.isiPesan,
        tipe: dto.tipe ?? TipePesan.TEXT,
      },
    });
  }

  async getPesan(id: string, currentUser: { userId: string }, sejakId?: string) {
    const sesi = await this.findByIdWithDokterOrThrow(id);
    this.pastikanTerlibatDalamSesi(sesi, currentUser.userId);

    // sejakId dipakai untuk polling incremental: cuma ambil pesan baru
    // setelah pesan dengan id tertentu, biar client gak fetch ulang semua history.
    let cursorDate: Date | undefined;
    if (sejakId) {
      const cursorMsg = await this.prisma.pesanChat.findUnique({
        where: { id: sejakId },
      });
      cursorDate = cursorMsg?.createdAt;
    }

    return this.prisma.pesanChat.findMany({
      where: {
        sesiId: id,
        createdAt: cursorDate ? { gt: cursorDate } : undefined,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ==========================================
  // HELPER PRIVATE
  // ==========================================

  private async findByIdOrThrow(id: string) {
    const sesi = await this.prisma.sesiKonsultasi.findUnique({
      where: { id },
    });
    if (!sesi) {
      throw new NotFoundException('Sesi konsultasi tidak ditemukan');
    }
    return sesi;
  }

  private async findByIdWithDokterOrThrow(id: string) {
    const sesi = await this.prisma.sesiKonsultasi.findUnique({
      where: { id },
      include: { dokter: { include: { user: true } } },
    });
    if (!sesi) {
      throw new NotFoundException('Sesi konsultasi tidak ditemukan');
    }
    return sesi;
  }

  private pastikanPemilikDokter(
    sesi: { dokter: { user: { id: string } } },
    dokterUserId: string,
  ) {
    if (sesi.dokter.user.id !== dokterUserId) {
      throw new ForbiddenException('Ini bukan sesi konsultasi milikmu');
    }
  }

  private pastikanTerlibatDalamSesi(
    sesi: { customerId: string; dokter: { user: { id: string } } },
    userId: string,
  ) {
    const terlibat =
      sesi.customerId === userId || sesi.dokter.user.id === userId;
    if (!terlibat) {
      throw new ForbiddenException('Kamu tidak terlibat dalam sesi ini');
    }
  }
}