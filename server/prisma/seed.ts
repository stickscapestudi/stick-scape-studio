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
    stock: 40,
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
    stock: 50,
    isActive: true,
  },
  {
    id: 'prod-03',
    name: 'Yuvan Shankar Raja — U1 Musical Nostalgia Poster',
    slug: 'yuvan-shankar-raja-u1-poster',
    description: 'The soul of Tamil youth culture. From 7G Rainbow Colony to Paiyaa and Mankatha, celebrate the signature BGM king.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/Yuvan.jpg',
    stock: 45,
    isActive: true,
  },
  {
    id: 'prod-04',
    name: 'Vinnaithaandi Varuvaayaa (VTV) — Vintage Arthouse Poster',
    slug: 'vtv-vinnaithaandi-varuvaayaa-poster',
    description: 'Karthik, Jessie, the Alappuzha church, and Central Park memories. Clean editorial typography on 300 GSM cotton rag.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/vtv.jpeg',
    stock: 45,
    isActive: true,
  },
  {
    id: 'prod-05',
    name: 'Harris Jayaraj — Lo-Fi Musical Memories Poster',
    slug: 'harris-jayaraj-poster',
    description: 'Cassettes, synthesizers, Minnale studio mixing consoles, and the evergreen melodies that defined our youth.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/harris.jpeg',
    stock: 50,
    isActive: true,
  },
  {
    id: 'prod-06',
    name: 'Kaatru Veliyidai — Ethereal Blue Horizon Poster',
    slug: 'kaatru-veliyidai-poster',
    description: 'Mani Ratnam and Ravi Varman visual storytelling with deep indigo skies and snowy peaks.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/kaatru veliyidai.jpeg',
    stock: 35,
    isActive: true,
  },
  {
    id: 'prod-07',
    name: 'Lionel Messi — The World Champion 10 Poster',
    slug: 'messi-world-champion-poster',
    description: 'The golden moment of glory. High-definition dramatic sports photography with championship gold accents.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/messi.jpeg',
    stock: 50,
    isActive: true,
  },
  {
    id: 'prod-08',
    name: 'Cristiano Ronaldo — CR7 Legacy Wall Poster',
    slug: 'cristiano-ronaldo-cr7-poster',
    description: 'Relentless dedication and supreme athletic power. Premium monochrome contrast with electric crimson highlights.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/ronaldo.jpeg',
    stock: 48,
    isActive: true,
  },
  {
    id: 'prod-09',
    name: 'Unnale Unnale — Vintage Cinema Wall Poster',
    slug: 'unnale-unnale-poster',
    description: 'Classic Melbourne coffee shops, candid autumn walks, and 2000s analog film warmth.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/unnale unnale.jpeg',
    stock: 60,
    isActive: true,
  },
  {
    id: 'prod-10',
    name: 'Sai Abhyankar — Fresh Wave Melodies Poster',
    slug: 'sai-abhyankar-poster',
    description: 'The sensational new wave of South Indian indie music with high-energy vibrant portrait.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/Sai Abhyankar.jpg',
    stock: 40,
    isActive: true,
  },
  {
    id: 'prod-11',
    name: 'PR — Studio Sound & Stage Energy Poster',
    slug: 'pr-studio-energy-poster',
    description: 'Raw studio creative energy, electric guitars, synth racks, and behind-the-scenes recording vibes.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/PR.jpg',
    stock: 32,
    isActive: true,
  },
  {
    id: 'prod-12',
    name: 'Isai & Vinith — Acoustic Studio Jam Poster',
    slug: 'isai-vinith-acoustic-poster',
    description: 'Candid jam sessions, acoustic guitars, headphone moments, and intimate indie music recording vibe.',
    category: 'posters',
    price: 60.00,
    imageUrl: '/Isai Abhyankkar _ vinith.jpg',
    stock: 36,
    isActive: true,
  },
  {
    id: 'prod-13',
    name: 'The Aesthetic Room Glow Mega Bundle',
    slug: 'aesthetic-room-glow-bundle',
    description: 'The complete aesthetic bedroom transformation set: 3 Posters + 36 Polaroids + Fairy Lights & Pegs.',
    category: 'bundles',
    price: 150.00,
    imageUrl: '/aesthetic.jpeg',
    stock: 25,
    isActive: true,
  },
  {
    id: 'prod-14',
    name: 'Kollywood Musical Titans Triptych (ARR + U1 + Harris)',
    slug: 'musical-titans-triptych-bundle',
    description: 'The holy trinity of Tamil music. A harmonized 3-poster gallery wall set featuring ARR, U1, and Harris.',
    category: 'bundles',
    price: 150.00,
    imageUrl: '/A.R. Rahman.jpg',
    stock: 20,
    isActive: true,
  },
  {
    id: 'prod-15',
    name: 'Football Legends GOAT Duo Pack (Messi & Ronaldo)',
    slug: 'football-legends-duo-bundle',
    description: 'Both legends in one iconic pair. Two large statement prints (Messi & Ronaldo) printed on archival rag.',
    category: 'bundles',
    price: 100.00,
    imageUrl: '/messi.jpeg',
    stock: 30,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Seeding Stick Scape Studio complete product catalog and admin user...');

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
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@stickscape.com').toLowerCase().trim();
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
  console.log('✅ Database seeding completed successfully with all 15 products!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
