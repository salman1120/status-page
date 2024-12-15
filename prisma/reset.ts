const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Delete all records in reverse order of dependencies
  console.log('Deleting all records...')
  
  await prisma.incidentUpdate.deleteMany()
  console.log('Deleted all incident updates')
  
  await prisma.serviceMetric.deleteMany()
  console.log('Deleted all service metrics')
  
  await prisma.incident.deleteMany()
  console.log('Deleted all incidents')
  
  await prisma.service.deleteMany()
  console.log('Deleted all services')
  
  await prisma.user.deleteMany()
  console.log('Deleted all users')
  
  await prisma.organization.deleteMany()
  console.log('Deleted all organizations')
  
  console.log('Database reset complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
