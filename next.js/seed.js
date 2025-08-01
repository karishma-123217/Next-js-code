import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const freeUser = await prisma.user.create({
    data: {
      name: 'Free User',
      email: 'free@example.com',
      tier: 'Free',
    },
  });

  const silverUser = await prisma.user.create({
    data: {
      name: 'Silver User',
      email: 'silver@example.com',
      tier: 'Silver',
    },
  });

  const goldUser = await prisma.user.create({
    data: {
      name: 'Gold User',
      email: 'gold@example.com',
      tier: 'Gold',
    },
  });

  const platinumUser = await prisma.user.create({
    data: {
      name: 'Platinum User',
      email: 'platinum@example.com',
      tier: 'Platinum',
    },
  });

  // Create events
  const events = [
    {
      title: 'Community Meetup',
      description: 'Monthly networking event for all members',
      date: new Date('2023-06-15'),
      location: 'Virtual',
      tier: 'Free',
    },
    {
      title: 'Silver Workshop',
      description: 'Advanced techniques for Silver members',
      date: new Date('2023-06-20'),
      location: 'Conference Room A',
      tier: 'Silver',
    },
    {
      title: 'Gold Masterclass',
      description: 'Exclusive training for Gold members',
      date: new Date('2023-06-25'),
      location: 'Grand Ballroom',
      tier: 'Gold',
    },
    {
      title: 'Platinum Gala',
      description: 'Annual VIP event for Platinum members',
      date: new Date('2023-07-01'),
      location: 'Luxury Hotel',
      tier: 'Platinum',
    },
    {
      title: 'Tech Conference',
      description: 'Industry conference for all paid members',
      date: new Date('2023-07-10'),
      location: 'Convention Center',
      tier: 'Silver',
    },
    {
      title: 'Free Webinar',
      description: 'Introduction to our platform',
      date: new Date('2023-07-15'),
      location: 'Online',
      tier: 'Free',
    },
    {
      title: 'Gold Networking',
      description: 'Exclusive networking for Gold members',
      date: new Date('2023-07-20'),
      location: 'Rooftop Lounge',
      tier: 'Gold',
    },
    {
      title: 'Platinum Retreat',
      description: 'Weekend retreat for Platinum members',
      date: new Date('2023-08-01'),
      location: 'Mountain Resort',
      tier: 'Platinum',
    },
  ];

  for (const event of events) {
    await prisma.event.create({
      data: event,
    });
  }

  console.log('Database seeded successfully!');
  console.log('Created users:', { freeUser, silverUser, goldUser, platinumUser });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });