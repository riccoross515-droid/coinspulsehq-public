import prisma from '../lib/prisma'

async function main() {
  console.log('Start seeding...')

  // 1. Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@cryptopulse.com' },
    update: {},
    create: {
      email: 'admin@cryptopulse.com',
      name: 'System Admin',
      password: 'admin', // In a real app, hash this!
      role: 'ADMIN',
      balance: 10000000.00,
    },
  })
  console.log({ admin })

  // Demo user creation removed as per user request.

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
