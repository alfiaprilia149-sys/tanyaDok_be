import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDokterDto } from './dto/create-dokter.dto';
import { UpdateDokterDto } from './dto/update-dokter.dto';

const SALT_ROUNDS = 10;

const USER_SELECT = {
  id: true,
  nama: true,
  email: true,
  noHp: true,
  foto: true,
} as const;

@Injectable()
export class DokterService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDokterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email sudah terdaftar');
    }

    if (dto.noSip) {
      const existingSip = await this.prisma.dokter.findUnique({
        where: { noSip: dto.noSip },
      });
      if (existingSip) {
        throw new ConflictException('No. SIP sudah terdaftar');
      }
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS);

    // User + Dokter dibuat dalam 1 transaction: kalau salah satu gagal, dua-duanya di-rollback.
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          nama: dto.nama,
          email: dto.email,
          password: hashedPassword,
          role: Role.DOKTER,
          noHp: dto.noHp,
        },
      });

      return tx.dokter.create({
        data: {
          userId: user.id,
          spesialisasi: dto.spesialisasi,
          noSip: dto.noSip,
          tarifKonsultasi: dto.tarifKonsultasi,
        },
        include: { user: { select: USER_SELECT } },
      });
    });
  }

  findAll(onlyActive = true) {
    return this.prisma.dokter.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      include: { user: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const dokter = await this.prisma.dokter.findUnique({
      where: { id },
      include: { user: { select: USER_SELECT } },
    });

    if (!dokter) {
      throw new NotFoundException('Dokter tidak ditemukan');
    }

    return dokter;
  }

  async update(id: string, dto: UpdateDokterDto) {
    const dokter = await this.findOne(id);

    if (dto.noSip) {
      const existingSip = await this.prisma.dokter.findFirst({
        where: { noSip: dto.noSip, NOT: { id } },
      });
      if (existingSip) {
        throw new ConflictException('No. SIP sudah dipakai dokter lain');
      }
    }

    const { nama, noHp, ...dokterFields } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (nama !== undefined || noHp !== undefined) {
        await tx.user.update({
          where: { id: dokter.userId },
          data: { nama, noHp },
        });
      }

      return tx.dokter.update({
        where: { id },
        data: dokterFields,
        include: { user: { select: USER_SELECT } },
      });
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete: riwayat konsultasi/jadwal dokter ini tetap utuh di database.
    return this.prisma.dokter.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async setStatusOnline(userId: string, statusOnline: boolean) {
    const dokter = await this.prisma.dokter.findUnique({ where: { userId } });

    if (!dokter) {
      throw new NotFoundException('Profil dokter tidak ditemukan');
    }

    return this.prisma.dokter.update({
      where: { id: dokter.id },
      data: { statusOnline },
    });
  }
}