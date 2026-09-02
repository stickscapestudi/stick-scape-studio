import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_PRODUCTS = [
  {
    id: 'prod-01',
    name: 'Vaaranam Aayiram — Nostalgic Cinema Art',
    slug: 'varanam-ayiram-cinema-poster',
    description: 'Surya, Meghna, and the unforgettable musical journey across California and Chennai. Printed on heavy 300 GSM textured archival paper.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/varanam ayiram.jpeg',
    stock: 50,
    isActive: true,
  },
  {
    id: 'prod-02',
    name: 'A.R. Rahman — The Mozart of Madras Iconic Poster',
    slug: 'ar-rahman-mozart-of-madras-poster',
    description: 'Celebrating the sonic visionary behind Roja, Dil Se, Rockstar, and Ponniyin Selvan.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/A.R. Rahman.jpg',
    stock: 45,
    isActive: true,
  },
  {
    id: 'prod-03',
    name: 'Vinnaithaandi Varuvaayaa — Retro Romance Poster',
    slug: 'vtv-retro-romance-poster',
    description: 'Jessie and Karthik in vintage film tones. Archival matte print with timeless romantic typography.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/vtv.jpeg',
    stock: 60,
    isActive: true,
  },
  {
    id: 'prod-04',
    name: 'Aesthetic Bedroom Glow Pack — 24 Vintage Polaroids',
    slug: 'aesthetic-bedroom-glow-polaroids',
    description: 'Collector set of 24 aesthetic mini polaroid photo cards with clips and fairy lights.',
    category: 'polaroids',
    price: 349.00,
    imageUrl: '/aesthetic.jpeg',
    stock: 30,
    isActive: true,
  },
  {
    id: 'prod-05',
    name: 'Kaatru Veliyidai — High Altitude Romance Print',
    slug: 'kaatru-veliyidai-romance-print',
    description: 'Visual tribute to Mani Ratnam visual storytelling and snow-capped mountain palette.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/kaatru veliyidai.jpeg',
    stock: 40,
    isActive: true,
  },
  {
    id: 'prod-06',
    name: 'Lionel Messi — World Cup Champion Poster',
    slug: 'messi-world-cup-champion-poster',
    description: 'Commemorating the legendary 2022 triumph in Lusail. High contrast sports photography art.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/messi.jpeg',
    stock: 50,
    isActive: true,
  },
  {
    id: 'prod-07',
    name: 'Cristiano Ronaldo — CR7 Celebration Poster',
    slug: 'ronaldo-cr7-celebration-poster',
    description: 'Iconic Siuu celebration poster printed on premium archival velvet paper.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/ronaldo.jpeg',
    stock: 50,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Seeding Stick Scape Studio products and admin user...');

  // 1. Seed Products
  for (const prod of SAMPLE_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        category: prod.category,
        price: prod.price,
        imageUrl: prod.imageUrl,
        stock: prod.stock,
        isActive: prod.isActive,
      },
      create: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        category: prod.category,
        price: prod.price,
        imageUrl: prod.imageUrl,
        stock: prod.stock,
        isActive: prod.isActive,
      },
    });
  }

  // 2. Seed Development Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@stickscape.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      name: 'Stick Scape Master Admin',
      role: 'ADMIN',
      isActive: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      name: 'Stick Scape Master Admin',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log(`👤 Admin User seeded successfully: ${admin.email}`);
  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
