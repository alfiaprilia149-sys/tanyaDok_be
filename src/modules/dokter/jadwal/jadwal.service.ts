import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateJadwalDto } from '../dto/create-jadwal.dto';
import { UpdateJadwalDto } from '../dto/update-jadwal.dto';

@Injectable()
export class JadwalService {
  constructor(private prisma: PrismaService) {}

  // Kolom @db.Time di Postgres tetap butuh objek Date utuh saat ditulis lewat Prisma;
  // tanggalnya (1970-01-01) diabaikan, cuma jam:menit yang benar-benar disimpan.
  private toTimeDate(time: string): Date {
    return new Date(`1970-01-01T${time}:00.000Z`);
  }

  async create(dokterId: string, dto: CreateJadwalDto) {
    const dokter = await this.prisma.dokter.findUnique({
      where: { id: dokterId },
    });
    if (!dokter) {
      throw new NotFoundException('Dokter tidak ditemukan');
    }

    const jamMulai = this.toTimeDate(dto.jamMulai);
    const jamSelesai = this.toTimeDate(dto.jamSelesai);

    if (jamSelesai <= jamMulai) {
      throw new BadRequestException(
        'jamSelesai harus lebih besar dari jamMulai',
      );
    }

    try {
      return await this.prisma.jadwalDokter.create({
        data: {
          dokterId,
          tanggal: new Date(dto.tanggal),
          jamMulai,
          jamSelesai,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Jadwal di tanggal & jam mulai yang sama sudah ada untuk dokter ini',
        );
      }
      throw error;
    }
  }

  findAllByDokter(dokterId: string) {
    return this.prisma.jadwalDokter.findMany({
      where: { dokterId },
      orderBy: [{ tanggal: 'asc' }, { jamMulai: 'asc' }],
    });
  }

  private async findOneOrThrow(id: string) {
    const jadwal = await this.prisma.jadwalDokter.findUnique({
      where: { id },
    });
    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }
    return jadwal;
  }

  async update(id: string, dto: UpdateJadwalDto) {
    await this.findOneOrThrow(id);

    return this.prisma.jadwalDokter.update({
      where: { id },
      data: {
        tanggal: dto.tanggal ? new Date(dto.tanggal) : undefined,
        jamMulai: dto.jamMulai ? this.toTimeDate(dto.jamMulai) : undefined,
        jamSelesai: dto.jamSelesai
          ? this.toTimeDate(dto.jamSelesai)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    const jadwal = await this.prisma.jadwalDokter.findUnique({
      where: { id },
      include: { sesiKonsultasi: { select: { id: true }, take: 1 } },
    });

    if (!jadwal) {
      throw new NotFoundException('Jadwal tidak ditemukan');
    }

    if (jadwal.sesiKonsultasi.length > 0) {
      // Jangan hapus jadwal yang sudah punya booking customer di dalamnya —
      // akan merusak riwayat SesiKonsultasi yang mengacu ke jadwal ini.
      throw new ConflictException(
        'Jadwal tidak bisa dihapus karena sudah ada customer yang booking di slot ini',
      );
    }

    return this.prisma.jadwalDokter.delete({ where: { id } });
  }
}