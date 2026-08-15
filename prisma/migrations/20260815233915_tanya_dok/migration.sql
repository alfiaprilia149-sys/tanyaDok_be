-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'DOKTER', 'CUSTOMER') NOT NULL,
    `noHp` VARCHAR(191) NULL,
    `alamat` VARCHAR(191) NULL,
    `foto` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dokters` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `spesialisasi` VARCHAR(191) NOT NULL,
    `noSip` VARCHAR(191) NULL,
    `tarifKonsultasi` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `statusOnline` BOOLEAN NOT NULL DEFAULT false,
    `rating` DOUBLE NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dokters_userId_key`(`userId`),
    UNIQUE INDEX `dokters_noSip_key`(`noSip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jadwal_dokters` (
    `id` VARCHAR(191) NOT NULL,
    `dokterId` VARCHAR(191) NOT NULL,
    `tanggal` DATE NOT NULL,
    `jamMulai` TIME NOT NULL,
    `jamSelesai` TIME NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jadwal_dokters_dokterId_tanggal_jamMulai_key`(`dokterId`, `tanggal`, `jamMulai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sesi_konsultasis` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `dokterId` VARCHAR(191) NOT NULL,
    `jadwalId` VARCHAR(191) NOT NULL,
    `status` ENUM('MENUNGGU_PERSETUJUAN', 'DITOLAK', 'DISETUJUI', 'SELESAI', 'DIBATALKAN') NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN',
    `alasanPenolakan` VARCHAR(191) NULL,
    `waktuDisetujui` DATETIME(3) NULL,
    `waktuSelesai` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `sesi_konsultasis_customerId_idx`(`customerId`),
    INDEX `sesi_konsultasis_dokterId_status_idx`(`dokterId`, `status`),
    INDEX `sesi_konsultasis_jadwalId_idx`(`jadwalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pesan_chats` (
    `id` VARCHAR(191) NOT NULL,
    `sesiId` VARCHAR(191) NOT NULL,
    `pengirimId` VARCHAR(191) NOT NULL,
    `isiPesan` VARCHAR(191) NOT NULL,
    `tipe` ENUM('TEXT', 'IMAGE') NOT NULL DEFAULT 'TEXT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pesan_chats_sesiId_createdAt_idx`(`sesiId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembayarans` (
    `id` VARCHAR(191) NOT NULL,
    `sesiId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'BERHASIL', 'GAGAL', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `jumlah` INTEGER NOT NULL,
    `metode` VARCHAR(191) NULL,
    `waktuBayar` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pembayarans_sesiId_key`(`sesiId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `dokters` ADD CONSTRAINT `dokters_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jadwal_dokters` ADD CONSTRAINT `jadwal_dokters_dokterId_fkey` FOREIGN KEY (`dokterId`) REFERENCES `dokters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesi_konsultasis` ADD CONSTRAINT `sesi_konsultasis_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesi_konsultasis` ADD CONSTRAINT `sesi_konsultasis_dokterId_fkey` FOREIGN KEY (`dokterId`) REFERENCES `dokters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sesi_konsultasis` ADD CONSTRAINT `sesi_konsultasis_jadwalId_fkey` FOREIGN KEY (`jadwalId`) REFERENCES `jadwal_dokters`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesan_chats` ADD CONSTRAINT `pesan_chats_sesiId_fkey` FOREIGN KEY (`sesiId`) REFERENCES `sesi_konsultasis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pesan_chats` ADD CONSTRAINT `pesan_chats_pengirimId_fkey` FOREIGN KEY (`pengirimId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayarans` ADD CONSTRAINT `pembayarans_sesiId_fkey` FOREIGN KEY (`sesiId`) REFERENCES `sesi_konsultasis`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
