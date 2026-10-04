import { prisma } from './config.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Seeding initial data...');

  const passwordHash = await bcrypt.hash('000000', 10);

  // 1. Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { name: 'Admin One', password: passwordHash },
    create: {
      name: 'Admin One',
      email: 'admin@gmail.com',
      password: passwordHash,
      address: '742 Evergreen Terrace, Springfield Sector 4',
      role: 'ADMIN'
    }
  });

  // 2. Store Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@storerating.com' },
    update: { name: 'Owner One', password: passwordHash },
    create: {
      name: 'Owner One',
      email: 'owner@storerating.com',
      password: passwordHash,
      address: '100 Commercial Boulevard, Financial District',
      role: 'STORE_OWNER'
    }
  });

  // 3. Normal User
  const user = await prisma.user.upsert({
    where: { email: 'user@storerating.com' },
    update: { name: 'User One', password: passwordHash },
    create: {
      name: 'User One',
      email: 'user@storerating.com',
      password: passwordHash,
      address: '42 Wallaby Way, Sydney Metro District',
      role: 'USER'
    }
  });

  // 4. Stores
  const store1 = await prisma.store.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: { name: 'Store One', email: 'contact@storeone.com' },
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Store One',
      email: 'contact@storeone.com',
      address: 'Suite 200, Silicon Avenue, Tech City',
      ownerId: owner.id
    }
  });

  const store2 = await prisma.store.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: { name: 'Store Two' },
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Store Two',
      email: 'info@greenharvestmarket.com',
      address: '88 Farmhouse Lane, Countryside Valley',
      ownerId: owner.id
    }
  });

  const store3 = await prisma.store.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: { name: 'Store Three', email: 'support@storethree.com' },
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      name: 'Store Three',
      email: 'support@storethree.com',
      address: '502 Fifth Avenue, Downtown Fashion Square',
      ownerId: null
    }
  });

  // 5. Ratings
  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user.id, storeId: store1.id } },
    update: {},
    create: {
      userId: user.id,
      storeId: store1.id,
      rating: 5
    }
  });

  await prisma.rating.upsert({
    where: { userId_storeId: { userId: user.id, storeId: store2.id } },
    update: {},
    create: {
      userId: user.id,
      storeId: store2.id,
      rating: 4
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
