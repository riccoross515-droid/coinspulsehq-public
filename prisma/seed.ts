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

  // 2. Create Demo User
  const demoUser = await prisma.user.upsert({
    where: { email: 'user@demo.com' },
    update: {},
    create: {
      email: 'user@demo.com',
      name: 'Alex Morgan',
      password: 'usertest',
      role: 'USER',
      balance: 12450.00,
      transactions: {
        create: [
          {
            type: 'DEPOSIT',
            amount: 5000.00,
            currency: 'USDT',
            network: 'TRC20',
            status: 'COMPLETED',
            address: 'T9yX8jZ7cpPhL7k3kL2m1n5x9jZ7cpPhL7'
          },
          {
            type: 'WITHDRAWAL',
            amount: 200.00,
            currency: 'USDT',
            network: 'ERC20',
            status: 'PENDING',
            address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
          }
        ]
      },
      investments: {
        create: [
             {
                 planId: 'growth',
                 amount: 1000.00,
                 status: 'ACTIVE'
             }
        ]
      }
    },
  })
  console.log({ demoUser })

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
