import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusPembayaran } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { BayarDto } from './dto/bayar.dto';

@Injectable()
export class PembayaranService {
  constructor(private prisma: PrismaService) {}

  private async findByIdOrThrow(id: string) {
    const pembayaran = await this.prisma.pembayaran.findUnique({
      where: { id },
      include: {
        sesi: {
          include: {
            dokter: { select: { spesialisasi: true, user: { select: { nama: true } } } },
          },
        },
      },
    });

    if (!pembayaran) {
      throw new NotFoundException('Pembayaran tidak ditemukan');
    }
    return pembayaran;
  }

  // Riwayat pembayaran milik customer yang sedang login
  findMyPembayaran(customerId: string) {
    return this.prisma.pembayaran.findMany({
      where: { sesi: { customerId } },
      include: {
        sesi: {
          include: {
            dokter: { select: { spesialisasi: true, user: { select: { nama: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, customerId: string) {
    const pembayaran = await this.findByIdOrThrow(id);

    if (pembayaran.sesi.customerId !== customerId) {
      throw new ForbiddenException('Ini bukan tagihan pembayaran kamu');
    }

    return pembayaran;
  }

  // Simulasi bayar: langsung tandai BERHASIL, tanpa cek ke gateway manapun.
  async bayar(id: string, customerId: string, dto: BayarDto) {
    const pembayaran = await this.findByIdOrThrow(id);

    if (pembayaran.sesi.customerId !== customerId) {
      throw new ForbiddenException('Ini bukan tagihan pembayaran kamu');
    }

    if (pembayaran.status !== StatusPembayaran.PENDING) {
      throw new BadRequestException(
        `Pembayaran ini sudah berstatus ${pembayaran.status}, tidak bisa dibayar lagi`,
      );
    }

    return this.prisma.pembayaran.update({
      where: { id },
      data: {
        status: StatusPembayaran.BERHASIL,
        metode: dto.metode,
        waktuBayar: new Date(),
      },
    });
  }
}