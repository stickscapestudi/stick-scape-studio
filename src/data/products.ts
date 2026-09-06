import type { Product, ProductSize, ProductFinish, CustomerReview } from '../types';

export interface PromoCodeData {
  code: string;
  discountPercent: number;
  description: string;
}

/* =========================================================================
   STICK SCAPE STUDIO — PRODUCT CATALOG & CONFIGURATION DATA (INR / ₹)
   ========================================================================= */

/* ✏️ SIZES FOR POSTERS */
export const POSTER_SIZES: ProductSize[] = [
  { id: 'size-a6', name: 'A6 Mini Print', dimensions: '10.5 × 14.8 cm (4.1 × 5.8 in)', priceMultiplier: 0.5, inStock: true },
  { id: 'size-a4', name: 'A4 Compact Print', dimensions: '21.0 × 29.7 cm (8.3 × 11.7 in)', priceMultiplier: 1.0, inStock: true },
];

/* ✏️ SIZES FOR POLAROID PACKS */
export const POLAROID_PACK_SIZES: ProductSize[] = [
  { id: 'pack-1', name: 'Pack of 1 (Single Photo Print)', dimensions: '8.8 × 10.7 cm (Classic 3.5 × 4.2 in)', priceMultiplier: 1.0, inStock: true },
  { id: 'pack-16', name: 'Pack of 16 (16 Photo Prints)', dimensions: '8.8 × 10.7 cm (Classic 3.5 × 4.2 in)', priceMultiplier: 120 / 50, inStock: true },
  { id: 'pack-32', name: 'Pack of 32 (32 Prints + Wooden Clips & Twine)', dimensions: '8.8 × 10.7 cm (Classic 3.5 × 4.2 in)', priceMultiplier: 250 / 50, inStock: true },
];

/* ✏️ SIZES FOR ROOM BUNDLES */
export const BUNDLE_SIZES: ProductSize[] = [
  { id: 'bundle-standard', name: 'Standard Room Bundle (2 A3 Posters + 16 Polaroids)', dimensions: 'Mixed Gallery Scale', priceMultiplier: 1.0, inStock: true },
  { id: 'bundle-deluxe', name: 'Deluxe Makeover (3 A2 Posters + 32 Polaroids + Lights)', dimensions: 'Full Bedroom Gallery', priceMultiplier: 1.5, inStock: true },
];

/* ✏️ SIZES FOR HANDMADE BOUQUETS */
export const BOUQUET_SIZES: ProductSize[] = [
  { id: 'standard', name: 'Standard Bouquet', dimensions: 'Standard Arrangement', priceMultiplier: 1.0, inStock: true },
];

/* ✏️ FRAMING & FINISH OPTIONS FOR POSTERS (IN RUPEES) */
export const POSTER_FINISHES: ProductFinish[] = [
  { id: 'unframed-matte', name: 'Unframed Archival Matte (300 GSM)', priceAdd: 0, description: 'Velvety heavy cotton rag that hangs crisp without glare.' },
  { id: 'framed-black-oak', name: 'Sleek Black Aluminum Frame', priceAdd: 299, description: 'Minimalist 8mm ultra-thin black metal frame with shatterproof acrylic glass.' },
  { id: 'framed-natural-oak', name: 'Natural Scandinavian Light Oak', priceAdd: 349, description: 'Solid natural timber with warm organic wood grain texture.' },
  { id: 'framed-gallery-white', name: 'White Gallery Box Frame', priceAdd: 299, description: 'Modern clean white frame with depth and spacer mount.' },
];

/* ✏️ BORDER & FINISH OPTIONS FOR POLAROIDS (IN RUPEES) */
export const POLAROID_FINISHES: ProductFinish[] = [
  { id: 'finish-classic-white', name: 'Classic Polaroid White Border', priceAdd: 0, description: 'Iconic wide bottom border with subtle vintage cream warmth.' },
  { id: 'finish-film-vintage', name: 'Aged 35mm Warm Tone Border', priceAdd: 49, description: 'Warm sepia-tinted borders with subtle analog edge markings.' },
  { id: 'finish-matte-black', name: 'Midnight Noir Black Border', priceAdd: 69, description: 'Deep dark photo borders for bold cyberpunk and mood shots.' },
];

/* ✏️ RIBBON & WRAP OPTIONS FOR BOUQUETS (IN RUPEES) */
export const BOUQUET_FINISHES: ProductFinish[] = [
  { id: 'finish-satin-champagne', name: 'Champagne Gold Satin Bow', priceAdd: 0, description: 'Lustrous soft gold silk ribbon tied in classic studio loop.' },
  { id: 'finish-velvet-noir', name: 'Midnight Velvet Noir Bow', priceAdd: 29, description: 'Dramatic deep black velvet ribbon for contrast and moody elegance.' },
  { id: 'finish-blush-rose', name: 'Blush Rose Petal Silk Bow', priceAdd: 29, description: 'Romantic double-tied soft pastel pink ribbon.' },
  { id: 'finish-emerald-velvet', name: 'Forest Emerald Velvet Bow', priceAdd: 49, description: 'Vintage rich dark emerald velvet for a luxury botanical look.' },
];

/* ✏️ MAIN PRODUCT LIST — Configured with Rupees (₹) Amounts */
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    name: 'Vaaranam Aayiram — Nostalgic Cinema Art',
    slug: 'varanam-ayiram-cinema-poster',
    category: 'posters',
    theme: 'Cinematic & Movie',
    price: 60.00,
    tags: ['Bestseller', 'Staff Pick', 'Cult Classic'],
    description: 'Surya, Meghna, and the unforgettable musical journey across California and Chennai. Printed on heavy 300 GSM textured archival paper with rich cinematic colors and iconic frame details.',
    shortDescription: 'Iconic Vaaranam Aayiram aesthetic film poster on archival cotton rag.',
    images: [
      '/varanam ayiram.jpeg',
    ],
    mockupImages: {
      flat: '/varanam ayiram.jpeg',
      wall: '/varanam ayiram.jpeg',
      detail: '/varanam ayiram.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Archival Acid-Free Fine Art Matte Paper, 12-Color Pigment Inks',
    inventoryCount: 40,
  },
  {
    id: 'prod-02',
    name: 'A.R. Rahman — The Mozart of Madras Iconic Poster',
    slug: 'ar-rahman-mozart-of-madras-poster',
    category: 'posters',
    theme: 'Vintage Music',
    price: 60.00,
    tags: ['Legend', 'Musical Maestro', 'Oscar Winner'],
    description: 'Celebrating the sonic visionary behind Roja, Dil Se, Rockstar, and Ponniyin Selvan. Captures timeless studio energy printed on 300 GSM velvety fine art cotton rag.',
    shortDescription: 'Tribute poster celebrating the musical genius of A.R. Rahman.',
    images: [
      '/A.R. Rahman.jpg',
    ],
    mockupImages: {
      flat: '/A.R. Rahman.jpg',
      wall: '/A.R. Rahman.jpg',
      detail: '/A.R. Rahman.jpg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Velvet Fine Art Matte Rag, Japanese Pigment Inks',
    inventoryCount: 50,
  },
  {
    id: 'prod-03',
    name: 'Yuvan Shankar Raja — U1 Musical Nostalgia Poster',
    slug: 'yuvan-shankar-raja-u1-poster',
    category: 'posters',
    theme: 'Vintage Music',
    price: 60.00,
    tags: ['U1 Drug', 'Youth Anthem', 'Bestseller'],
    description: 'The soul of Tamil youth culture. From 7G Rainbow Colony to Paiyaa and Mankatha, celebrate the signature BGM king on heavy gallery-grade archival paper.',
    shortDescription: 'Iconic Yuvan Shankar Raja tribute statement wall poster.',
    images: [
      '/Yuvan.jpg',
    ],
    mockupImages: {
      flat: '/Yuvan.jpg',
      wall: '/Yuvan.jpg',
      detail: '/Yuvan.jpg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Heavy Archival Cotton Rag Paper with Matte Finish',
    inventoryCount: 45,
  },
  {
    id: 'prod-04',
    name: 'Vinnaithaandi Varuvaayaa (VTV) — Vintage Arthouse Poster',
    slug: 'vtv-vinnaithaandi-varuvaayaa-poster',
    category: 'posters',
    theme: 'Cinematic & Movie',
    price: 60.00,
    tags: ['Cult Classic', 'Romance', 'Iconic'],
    description: 'Karthik, Jessie, the Alappuzha church, and Central Park memories. Clean editorial typography combined with high-resolution frame restoration on 300 GSM cotton rag.',
    shortDescription: 'The defining romantic cinema aesthetic of a generation in fine art format.',
    images: [
      '/vtv.jpeg',
    ],
    mockupImages: {
      flat: '/vtv.jpeg',
      wall: '/vtv.jpeg',
      detail: '/vtv.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Archival Matte Silk Paper, Fade-Resistant UltraChrome HD Inks',
    inventoryCount: 45,
  },
  {
    id: 'prod-05',
    name: 'Harris Jayaraj — Lo-Fi Musical Memories Poster',
    slug: 'harris-jayaraj-poster',
    category: 'posters',
    theme: 'Vintage Music',
    price: 60.00,
    tags: ['Music Vibe', 'Lo-Fi Chill', 'Collector Item'],
    description: 'Cassettes, synthesizers, Minnale studio mixing consoles, and the evergreen melodies that defined our youth. Printed on heavy 300 GSM textured archival paper.',
    shortDescription: 'Melodic nostalgic moments in archival fine art poster format.',
    images: [
      '/harris.jpeg',
    ],
    mockupImages: {
      flat: '/harris.jpeg',
      wall: '/harris.jpeg',
      detail: '/harris.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 4.9,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Velvet Fine Art Matte Rag Paper, Japanese Pigment Inks',
    inventoryCount: 50,
  },
  {
    id: 'prod-06',
    name: 'Kaatru Veliyidai — Ethereal Blue Horizon Poster',
    slug: 'kaatru-veliyidai-poster',
    category: 'posters',
    theme: 'Botanical & Nature',
    price: 60.00,
    tags: ['Trending', 'Cinematic', 'Snow & Mountains'],
    description: 'Mani Ratnam and Ravi Varman’s breathtaking Leh-Ladakh visuals captured on museum-grade rag. Features deep indigo skies, snowy peaks, and timeless poetic framing.',
    shortDescription: 'Stunning mountain landscape aesthetic from Kaatru Veliyidai.',
    images: [
      '/kaatru veliyidai.jpeg',
    ],
    mockupImages: {
      flat: '/kaatru veliyidai.jpeg',
      wall: '/kaatru veliyidai.jpeg',
      detail: '/kaatru veliyidai.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 4.9,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM FSC-Certified Textured Cotton Rag, Soy-Based Vegan Inks',
    inventoryCount: 35,
  },
  {
    id: 'prod-07',
    name: 'Lionel Messi — The World Champion 10 Poster',
    slug: 'messi-world-champion-poster',
    category: 'posters',
    theme: 'Cyberpunk & Neon',
    price: 60.00,
    tags: ['GOAT', 'Football Art', 'Legend'],
    description: 'The golden moment of glory. High-definition dramatic sports photography with championship gold accents printed on heavy 300 GSM velvet archival rag.',
    shortDescription: 'Iconic Lionel Messi championship celebration statement wall poster.',
    images: [
      '/messi.jpeg',
    ],
    mockupImages: {
      flat: '/messi.jpeg',
      wall: '/messi.jpeg',
      detail: '/messi.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 340,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Heavyweight German Etching Rag with Textured Finish',
    inventoryCount: 50,
  },
  {
    id: 'prod-08',
    name: 'Cristiano Ronaldo — CR7 Legacy Wall Poster',
    slug: 'cristiano-ronaldo-cr7-poster',
    category: 'posters',
    theme: 'Cyberpunk & Neon',
    price: 60.00,
    tags: ['CR7', 'Siuuu', 'Football Legend'],
    description: 'Relentless dedication and supreme athletic power. Premium monochrome contrast with electric crimson highlights on archival cotton paper.',
    shortDescription: 'Cristiano Ronaldo CR7 iconic matchwinner poster on 300 GSM paper.',
    images: [
      '/ronaldo.jpeg',
    ],
    mockupImages: {
      flat: '/ronaldo.jpeg',
      wall: '/ronaldo.jpeg',
      detail: '/ronaldo.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 318,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Heavy Archival Cotton Rag Paper with Matte Finish',
    inventoryCount: 48,
  },
  {
    id: 'prod-09',
    name: 'Unnale Unnale — Vintage Cinema Wall Poster',
    slug: 'unnale-unnale-poster',
    category: 'posters',
    theme: 'Retro Film',
    price: 60.00,
    tags: ['Bestseller', 'Cinema Poster', 'Melody Nostalgia'],
    description: 'Classic Melbourne coffee shops, candid autumn walks, and 2000s analog film warmth. Printed on heavy 300 GSM textured archival cotton rag.',
    shortDescription: 'Vintage 2000s cinema nostalgia aesthetic wall poster.',
    images: [
      '/unnale unnale.jpeg',
    ],
    mockupImages: {
      flat: '/unnale unnale.jpeg',
      wall: '/unnale unnale.jpeg',
      detail: '/unnale unnale.jpeg',
    },
    sizes: POSTER_SIZES,
    rating: 5.0,
    reviewCount: 11,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Heavy Archival Cotton Rag Paper with Matte Finish',
    inventoryCount: 60,
  },
  {
    id: 'prod-10',
    name: 'Sai Abhyankar — Fresh Wave Melodies Poster',
    slug: 'sai-abhyankar-poster',
    category: 'posters',
    theme: 'Vintage Music',
    price: 60.00,
    tags: ['Viral Beats', 'Katchi Sera', 'Aasa Kooda'],
    description: 'The sensational new wave of South Indian indie music. High-energy vibrant portrait printed on 300 GSM archival fine art rag.',
    shortDescription: 'Sai Abhyankar viral musical aesthetic statement wall poster.',
    images: [
      '/Sai Abhyankar.jpg',
    ],
    mockupImages: {
      flat: '/Sai Abhyankar.jpg',
      wall: '/Sai Abhyankar.jpg',
      detail: '/Sai Abhyankar.jpg',
    },
    sizes: POSTER_SIZES,
    rating: 4.9,
    reviewCount: 12,
    isBestSeller: true,
    isFeatured: true,
    paperSpecs: '300 GSM Velvet Fine Art Matte Rag, Japanese Pigment Inks',
    inventoryCount: 40,
  },
  {
    id: 'prod-11',
    name: 'PR — Studio Sound & Stage Energy Poster',
    slug: 'pr-studio-energy-poster',
    category: 'posters',
    theme: 'Vintage Music',
    price: 60.00,
    tags: ['Studio Vibe', 'Music Session', 'New Drop'],
    description: 'Raw studio creative energy, electric guitars, synth racks, and behind-the-scenes recording vibes printed on heavy textured cotton paper.',
    shortDescription: 'Dynamic studio music performance poster with rich tones.',
    images: [
      '/PR.jpg',
    ],
    mockupImages: {
      flat: '/PR.jpg',
      wall: '/PR.jpg',
      detail: '/PR.jpg',
    },
    sizes: POSTER_SIZES,
    rating: 4.8,
    reviewCount: 79,
    isBestSeller: false,
    isFeatured: true,
    paperSpecs: '300 GSM Archival Fine Art Matte Rag Paper',
    inventoryCount: 32,
  },
  {
    id: 'prod-12',
    name: 'Isai & Vinith — Acoustic Studio Jam Poster',
    slug: 'isai-vinith-acoustic-poster',
    category: 'posters',
    theme: 'Vintage Music',
    price: 60.00,
    tags: ['Studio Jams', 'Acoustic Duo', 'Poster'],
    description: 'Candid jam sessions, acoustic guitars, headphone moments, and intimate indie music recording vibe printed on 300 GSM textured cotton rag.',
    shortDescription: 'Acoustic studio live jam session statement wall poster.',
    images: [
      '/Isai Abhyankkar _ vinith.jpg',
    ],
    mockupImages: {
      flat: '/Isai Abhyankkar _ vinith.jpg',
      wall: '/Isai Abhyankkar _ vinith.jpg',
      detail: '/Isai Abhyankkar _ vinith.jpg',
    },
    sizes: POSTER_SIZES,
    rating: 4.9,
    reviewCount: 94,
    isBestSeller: false,
    isFeatured: true,
    paperSpecs: '300 GSM Heavy Archival Cotton Rag Paper with Matte Finish',
    inventoryCount: 36,
  },
  {
    id: 'prod-13',
    name: 'The Aesthetic Room Glow Mega Bundle',
    slug: 'aesthetic-room-glow-bundle',
    category: 'bundles',
    theme: 'Retro Film',
    price: 150.00,
    tags: ['Best Value', 'Full Kit', 'Gift Favorite'],
    description: 'The complete aesthetic bedroom transformation set. Includes 3 Large Statement Posters (A3), 36 Curated Polaroid Photo Prints, 20 Warm LED Copper Wire Fairy Lights, 36 Mini Wooden Clothespins, and 50 Removable Wall-Safe Glue Dots.',
    shortDescription: 'Complete wall transformation bundle: 3 Posters + 36 Polaroids + Fairy Lights & Pegs.',
    images: [
      '/aesthetic.jpeg',
      '/varanam ayiram.jpeg',
      '/A.R. Rahman.jpg',
    ],
    mockupImages: {
      flat: '/aesthetic.jpeg',
      wall: '/aesthetic.jpeg',
      detail: '/aesthetic.jpeg',
    },
    sizes: BUNDLE_SIZES,
    rating: 5.0,
    reviewCount: 312,
    isBestSeller: true,
    isFeatured: true,
    bundleItemsCount: 42,
    paperSpecs: 'Mixed Media: 300 GSM Archival Matte Posters + 350 GSM Gloss Polaroid Prints',
    inventoryCount: 25,
  },
  {
    id: 'prod-14',
    name: 'Kollywood Musical Titans Triptych (ARR + U1 + Harris)',
    slug: 'musical-titans-triptych-bundle',
    category: 'bundles',
    theme: 'Vintage Music',
    price: 150.00,
    tags: ['3-Piece Bundle', 'Legendary Trio', 'Best Gift'],
    description: 'The holy trinity of Tamil music. A harmonized 3-poster gallery wall set featuring A.R. Rahman, Yuvan Shankar Raja, and Harris Jayaraj on archival cotton rag.',
    shortDescription: 'Matching 3-poster gallery triptych celebrating the 3 greatest music directors.',
    images: [
      '/A.R. Rahman.jpg',
      '/Yuvan.jpg',
      '/harris.jpeg',
    ],
    mockupImages: {
      flat: '/A.R. Rahman.jpg',
      wall: '/Yuvan.jpg',
      detail: '/harris.jpeg',
    },
    sizes: BUNDLE_SIZES,
    rating: 5.0,
    reviewCount: 198,
    isBestSeller: true,
    isFeatured: true,
    bundleItemsCount: 3,
    paperSpecs: '300 GSM Heavy Archival Cotton Rag Paper with Matte Finish',
    inventoryCount: 20,
  },
  {
    id: 'prod-15',
    name: 'Football Legends GOAT Duo Pack (Messi & Ronaldo)',
    slug: 'football-legends-duo-bundle',
    category: 'bundles',
    theme: 'Cyberpunk & Neon',
    price: 100.00,
    tags: ['Messi & Ronaldo', 'Sports Art', 'Duo Set'],
    description: 'Both legends in one iconic pair. Two large statement prints (Messi & Ronaldo) printed on 300 GSM archival rag.',
    shortDescription: 'The ultimate Messi & Ronaldo dual poster collector bundle.',
    images: [
      '/messi.jpeg',
      '/ronaldo.jpeg',
    ],
    mockupImages: {
      flat: '/messi.jpeg',
      wall: '/ronaldo.jpeg',
      detail: '/messi.jpeg',
    },
    sizes: BUNDLE_SIZES,
    rating: 5.0,
    reviewCount: 220,
    isBestSeller: true,
    isFeatured: true,
    bundleItemsCount: 2,
    paperSpecs: '300 GSM Archival Fine Art Rag Paper',
    inventoryCount: 30,
  },
  {
    id: 'prod-bq-01',
    name: 'Kit Kat And Love Rose Bouquet',
    slug: 'kit-kat-and-love-rose-bouquet',
    category: 'bouquets',
    theme: 'Handmade Florals',
    price: 150.00,
    tags: ['Handmade', 'Chocolate Bouquet', 'Rose Gift', 'Bestseller'],
    description: '',
    shortDescription: 'Romantic Kit Kat chocolate and red rose keepsake gift bouquet.',
    images: [
      '/kitkat-rose-bouquet.jpg',
    ],
    mockupImages: {
      flat: '/kitkat-rose-bouquet.jpg',
      wall: '/kitkat-rose-bouquet.jpg',
      detail: '/kitkat-rose-bouquet.jpg',
    },
    sizes: [
      { id: 'standard', name: 'Standard Bouquet', dimensions: 'Standard Arrangement', priceMultiplier: 1.0, inStock: true },
    ],
    rating: 5.0,
    reviewCount: 47,
    isBestSeller: true,
    isFeatured: true,
    bouquetSpecs: 'Kit Kat Chocolate Bars, Handcrafted Red Rose, Golden Elegant Floral Wrap with Red Ribbon Bow',
    inventoryCount: 25,
  },
  {
    id: 'prod-bq-02',
    name: 'Love of Ferrero Rocher',
    slug: 'love-of-ferrero-rocher',
    category: 'bouquets',
    theme: 'Handmade Florals',
    price: 150.00,
    tags: ['Ferrero Rocher', 'Chocolate Bouquet', 'Handmade Gift', 'Bestseller'],
    description: '',
    shortDescription: 'Handcrafted Ferrero Rocher chocolate with delicate white florals and rustic kraft wrap.',
    images: [
      '/ferrero-rocher-bouquet.jpg',
    ],
    mockupImages: {
      flat: '/ferrero-rocher-bouquet.jpg',
      wall: '/ferrero-rocher-bouquet.jpg',
      detail: '/ferrero-rocher-bouquet.jpg',
    },
    sizes: BOUQUET_SIZES,
    rating: 4.9,
    reviewCount: 38,
    isBestSeller: true,
    isFeatured: true,
    bouquetSpecs: 'Ferrero Rocher Hazelnut Chocolate, Delicate Dried White Florals, Rustic Kraft Wrap with Jute Twine',
    inventoryCount: 20,
  },
  {
    id: 'prod-bq-03',
    name: 'Love Of Choco',
    slug: 'love-of-choco',
    category: 'bouquets',
    theme: 'Handmade Florals',
    price: 150.00,
    tags: ['Chocolates', 'Kit Kat & Dairy Milk', 'Gift Ready', 'Bestseller'],
    description: '',
    shortDescription: 'Assorted Kit Kat & Cadbury Dairy Milk chocolate arrangement with satin bow.',
    images: [
      '/love-of-choco-bouquet.jpg',
    ],
    mockupImages: {
      flat: '/love-of-choco-bouquet.jpg',
      wall: '/love-of-choco-bouquet.jpg',
      detail: '/love-of-choco-bouquet.jpg',
    },
    sizes: BOUQUET_SIZES,
    rating: 5.0,
    reviewCount: 62,
    isBestSeller: true,
    isFeatured: true,
    bouquetSpecs: 'Kit Kat Chocolate Bars, Cadbury Dairy Milk, Translucent Floral Wrap with Gold-Trimmed Red Ribbon Bow',
    inventoryCount: 30,
  },
  {
    id: 'prod-bq-04',
    name: 'Love of Kinder',
    slug: 'love-of-kinder',
    category: 'bouquets',
    theme: 'Handmade Florals',
    price: 180.00,
    tags: ['Kinder Joy', 'Surprise Gift', 'Chocolate Bouquet', 'Bestseller'],
    description: '',
    shortDescription: 'Delightful Kinder Joy eggs presented in elegant gold-trimmed white wrap with ribbon.',
    images: [
      '/love-of-kinder-bouquet.jpg',
    ],
    mockupImages: {
      flat: '/love-of-kinder-bouquet.jpg',
      wall: '/love-of-kinder-bouquet.jpg',
      detail: '/love-of-kinder-bouquet.jpg',
    },
    sizes: BOUQUET_SIZES,
    rating: 4.8,
    reviewCount: 29,
    isBestSeller: false,
    isFeatured: true,
    bouquetSpecs: '2x Kinder Joy Eggs, Gold-Trimmed Frosted Wrap, White Satin Ribbon Bow',
    inventoryCount: 18,
  }
];

/* ✏️ SAMPLE CUSTOMER REVIEWS */
export const SAMPLE_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-01',
    author: 'Sri Nikesh .T',
    rating: 5,
    date: '6 days ago',
    comment: 'Nice Work Awesome fantastic and marvelous paper quality ',
    productTitle: 'Customized Wall poster',
    verified: true,
    location: 'Chennai, India',
    avatar: '',
  },
  {
    id: 'rev-02',
    author: 'Arima Arutkho',
    rating: 5,
    date: '1 week ago',
    comment: 'Its very good bro , i Love it !! , Thank you ',
    productTitle: 'Customized polaroids',
    verified: true,
    location: 'Puducherry, India',
    avatar: '',
  },
  {
    id: 'rev-03',
    author: 'Pranishk',
    rating: 5,
    date: '5 weeks ago',
    comment: 'The Photosheet is very nice and good looking , thank you !!',
    productTitle: 'Customized Polaroids ',
    verified: true,
    location: 'Puducherry, India',
    avatar: '',
  },
  {
    id: 'rev-04',
    author: 'Kiran Kumar',
    rating: 5,
    date: '6 weeks ago',
    comment: 'Awesome work and worth for cost ',
    productTitle: 'Customized Wallposter',
    verified: true,
    location: 'Chennai, India',
    avatar: '',
  }
];

/* ✏️ PROMO / COUPON CODES CONFIGURATION */
export const PROMO_CODES: Record<string, PromoCodeData> = {
  'STICK10': { code: 'STICK10', discountPercent: 10, description: '10% OFF Studio Welcome Discount' },
  'ROOMGLOW': { code: 'ROOMGLOW', discountPercent: 15, description: '15% OFF Room Makeover Bundles' },
  'FREESHIP': { code: 'FREESHIP', discountPercent: 0, description: 'Free Express Shipping on Any Order' },
};

/* ✏️ FAQ DATA */
export const FAQ_DATA = [
  {
    q: 'What paper material and ink do you use?',
    a: 'All our posters are printed on museum-grade 300 GSM heavyweight cotton rag paper with textured matte finish using Japanese 12-color archival pigment inks. Polaroids are printed on 350 GSM resin-coated glossy cardstock with authentic proportions.'
  },
  {
    q: 'How are the posters and Polaroid packs packaged?',
    a: 'We use 100% plastic-free packaging. Large posters are rolled in silk glassine tissue and secured inside 3mm thick rigid kraft tubes. Polaroid sets come in embossed slide gift boxes nestled inside padded eco-mailers with wooden clips and twine.'
  },
  {
    q: 'How fast is shipping across India?',
    a: 'Orders are cured, quality inspected, and dispatched within 24–48 hours. Express domestic delivery takes 2–4 business days. All orders above ₹499 qualify for Free Shipping.'
  },
  {
    q: 'What if my print arrives bent or damaged?',
    a: 'We offer a 100% Damage-Free Guarantee. Simply snap a quick photo and send it to hello@stickscapestudio.com, and we will reprint and reship your entire order free of charge immediately.'
  }
];
