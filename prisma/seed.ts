import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { adminUsers, partners, siteSettings, teamMembers } from './seed-data';

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }) });

// Create only, so running this again never overwrites what the team has edited.
async function main() {
  await prisma.adminUser.createMany({ data: adminUsers, skipDuplicates: true });
  await prisma.siteSettings.createMany({ data: [siteSettings], skipDuplicates: true });
  await prisma.teamMember.createMany({ data: teamMembers, skipDuplicates: true });
  await prisma.partner.createMany({ data: partners, skipDuplicates: true });
  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
