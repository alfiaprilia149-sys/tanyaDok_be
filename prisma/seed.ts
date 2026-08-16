import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@tanyadok.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123';
const SALT_ROUNDS = 10;

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log(`Admin (${ADMIN_EMAIL}) sudah ada, skip seeding.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  await prisma.user.create({
    data: {
      nama: 'Admin TanyaDok',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Akun admin berhasil dibuat: ${ADMIN_EMAIL}`);
  console.log(
    'PENTING: ganti password default ini setelah login pertama kali!',
  );
}

main()
  .catch((error) => {
    console.error('Seeding gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });