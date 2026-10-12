import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@tanyadok.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin1223';
const SALT_ROUNDS = 10;

async function main() {
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { password: hashedPassword }, // admin sudah ada: password disamakan lagi
    create: {
      nama: 'Admin TanyaDok',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log(`Akun admin siap dipakai: ${ADMIN_EMAIL}`);
}

main()
  .catch((error) => {
    console.error('Seeding gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });