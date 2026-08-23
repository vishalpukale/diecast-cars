require('dotenv').config();
const { pool } = require('../config/database');

const brands = [
  { name: 'Hot Wheels', slug: 'hot-wheels', sort: 1 },
  { name: 'Mini GT', slug: 'mini-gt', sort: 2 },
  { name: 'Tomica', slug: 'tomica', sort: 3 },
  { name: 'Majorette', slug: 'majorette', sort: 4 },
  { name: 'Bburago', slug: 'bburago', sort: 5 },
  { name: 'Greenlight', slug: 'greenlight', sort: 6 },
  { name: 'AutoArt', slug: 'autoart', sort: 7 },
  { name: 'Siku', slug: 'siku', sort: 8 },
];

const categories = [
  { name: '1:64 Scale', slug: '1-64-scale', sort: 1, description: 'Pocket-friendly collector scale' },
  { name: '1:43 Scale', slug: '1-43-scale', sort: 2, description: 'Display-ready mid scale' },
  { name: '1:18 Scale', slug: '1-18-scale', sort: 3, description: 'Premium large diecast' },
  { name: 'Premium / Chase', slug: 'premium-chase', sort: 4, description: 'Limited and chase editions' },
];

/** Diecast / miniature toy shots only (local uploads). Max 5 images per product. */
const DIECAST_POOL = [
  '/uploads/products/dc-01.jpg',
  '/uploads/products/dc-02.jpg',
  '/uploads/products/dc-03.jpg',
  '/uploads/products/dc-04.jpg',
  '/uploads/products/dc-05.jpg',
  '/uploads/products/dc-06.jpg',
  '/uploads/products/dc-07.jpg',
  '/uploads/products/dc-08.jpg',
  '/uploads/products/dc-09.jpg',
  '/uploads/products/dc-11.jpg',
  '/uploads/products/dc-13.jpg',
  '/uploads/products/dc-15.jpg',
];

const buildImages = (name, startIndex, count = 4) => {
  const images = [];
  for (let i = 0; i < Math.min(5, count); i += 1) {
    const url = DIECAST_POOL[(startIndex + i) % DIECAST_POOL.length];
    images.push({ url, alt: `${name} view ${i + 1}`, sort: i });
  }
  return images;
};

const productSeeds = [
  {
    brand: 'hot-wheels',
    category: '1-64-scale',
    sku: 'HW-RB-001',
    name: 'Hot Wheels Redline Racer',
    slug: 'hot-wheels-redline-racer',
    price: 499,
    compareAtPrice: 599,
    stock: 40,
    scale: '1:64',
    featured: true,
    justArrived: true,
    shortDescription: 'Classic Hot Wheels redline vibe with glossy finish.',
    description:
      'A crowd-favourite 1:64 Hot Wheels casting with crisp tampo and free-rolling wheels.',
    imageStart: 0,
  },
  {
    brand: 'hot-wheels',
    category: 'premium-chase',
    sku: 'HW-PR-014',
    name: 'Hot Wheels Premium Nissan Skyline GT-R',
    slug: 'hot-wheels-premium-nissan-skyline-gtr',
    price: 1299,
    compareAtPrice: 1499,
    stock: 18,
    scale: '1:64',
    featured: true,
    justArrived: true,
    shortDescription: 'Premium Real Riders Skyline for JDM fans.',
    description:
      'Premium series Skyline with Real Riders rubber tires and metal/metal construction.',
    imageStart: 1,
  },
  {
    brand: 'mini-gt',
    category: '1-64-scale',
    sku: 'MGT-204',
    name: 'Mini GT Porsche 911 GT3 RS',
    slug: 'mini-gt-porsche-911-gt3-rs',
    price: 1899,
    stock: 22,
    scale: '1:64',
    featured: true,
    justArrived: true,
    shortDescription: 'Highly detailed Mini GT Porsche for collectors.',
    description: 'True-to-scale Mini GT Porsche with precise liveries and collector packaging.',
    imageStart: 2,
  },
  {
    brand: 'mini-gt',
    category: '1-64-scale',
    sku: 'MGT-311',
    name: 'Mini GT Lamborghini Countach LPI 800-4',
    slug: 'mini-gt-lamborghini-countach-lpi-800-4',
    price: 1999,
    stock: 15,
    scale: '1:64',
    featured: true,
    justArrived: false,
    shortDescription: 'Iconic wedge Countach in Mini GT execution.',
    description: 'Sharp panel lines and authentic paint for supercar collectors.',
    imageStart: 3,
  },
  {
    brand: 'tomica',
    category: '1-64-scale',
    sku: 'TM-067',
    name: 'Tomica Toyota GR Supra',
    slug: 'tomica-toyota-gr-supra',
    price: 699,
    stock: 35,
    scale: '1:64',
    featured: false,
    justArrived: true,
    shortDescription: 'Reliable Tomica casting with durable playability.',
    description: 'Japanese quality Tomica Supra — tough for play, clean for display.',
    imageStart: 4,
  },
  {
    brand: 'tomica',
    category: 'premium-chase',
    sku: 'TM-PR-09',
    name: 'Tomica Premium Honda NSX Type R',
    slug: 'tomica-premium-honda-nsx-type-r',
    price: 1599,
    compareAtPrice: 1799,
    stock: 12,
    scale: '1:64',
    featured: true,
    justArrived: false,
    shortDescription: 'Premium Tomica NSX with elevated detailing.',
    description: 'Upgraded paint, wheels, and collector-grade presentation.',
    imageStart: 5,
  },
  {
    brand: 'majorette',
    category: '1-64-scale',
    sku: 'MJ-221',
    name: 'Majorette Mercedes-AMG GT',
    slug: 'majorette-mercedes-amg-gt',
    price: 549,
    stock: 28,
    scale: '1:64',
    featured: false,
    justArrived: true,
    shortDescription: 'Bold Majorette AMG with opening doors.',
    description: 'Street-energy AMG casting with opening parts and vivid finish.',
    imageStart: 6,
  },
  {
    brand: 'bburago',
    category: '1-18-scale',
    sku: 'BB-18047',
    name: 'Bburago Ferrari SF90 Stradale 1:18',
    slug: 'bburago-ferrari-sf90-stradale-1-18',
    price: 4999,
    compareAtPrice: 5499,
    stock: 8,
    scale: '1:18',
    featured: true,
    justArrived: true,
    shortDescription: 'Large-scale Ferrari for premium cabinets.',
    description: 'Impressive 1:18 SF90 with opening details and showroom presence.',
    imageStart: 7,
  },
  {
    brand: 'bburago',
    category: '1-43-scale',
    sku: 'BB-43022',
    name: 'Bburago Bugatti Chiron 1:43',
    slug: 'bburago-bugatti-chiron-1-43',
    price: 1499,
    stock: 16,
    scale: '1:43',
    featured: false,
    justArrived: false,
    shortDescription: 'Elegant mid-scale Bugatti for desk or shelf.',
    description: 'Balanced 1:43 Chiron with glossy dual-tone styling.',
    imageStart: 8,
  },
  {
    brand: 'greenlight',
    category: '1-64-scale',
    sku: 'GL-30120',
    name: 'Greenlight 1967 Ford Mustang GT',
    slug: 'greenlight-1967-ford-mustang-gt',
    price: 1199,
    stock: 20,
    scale: '1:64',
    featured: true,
    justArrived: false,
    shortDescription: 'American muscle classic from Greenlight.',
    description: 'Period-correct Mustang GT with rubber tires and authentic stance.',
    imageStart: 9,
  },
  {
    brand: 'autoart',
    category: '1-18-scale',
    sku: 'AA-79151',
    name: 'AutoArt McLaren P1 1:18',
    slug: 'autoart-mclaren-p1-1-18',
    price: 18999,
    compareAtPrice: 20999,
    stock: 4,
    scale: '1:18',
    featured: true,
    justArrived: true,
    shortDescription: 'Flagship AutoArt craftsmanship.',
    description: 'Museum-grade detailing and precise McLaren P1 proportions.',
    imageStart: 10,
  },
  {
    brand: 'siku',
    category: '1-64-scale',
    sku: 'SK-1529',
    name: 'Siku Mercedes-Benz G-Class',
    slug: 'siku-mercedes-benz-g-class',
    price: 899,
    stock: 25,
    scale: '1:64',
    featured: false,
    justArrived: false,
    shortDescription: 'Durable Siku G-Wagon with rugged character.',
    description: 'Solid metal construction — a rugged collector/play hybrid.',
    imageStart: 11,
  },
  {
    brand: 'hot-wheels',
    category: '1-64-scale',
    sku: 'HW-BL-088',
    name: 'Hot Wheels Batmobile',
    slug: 'hot-wheels-batmobile',
    price: 799,
    stock: 30,
    scale: '1:64',
    featured: false,
    justArrived: true,
    shortDescription: 'Iconic Batmobile casting for pop-culture shelves.',
    description: 'Dark aggressive silhouette with signature Hot Wheels rollability.',
    imageStart: 0,
  },
  {
    brand: 'mini-gt',
    category: 'premium-chase',
    sku: 'MGT-CH-07',
    name: 'Mini GT Chase Edition Toyota GR86',
    slug: 'mini-gt-chase-edition-toyota-gr86',
    price: 2499,
    compareAtPrice: 2799,
    stock: 6,
    scale: '1:64',
    featured: true,
    justArrived: true,
    shortDescription: 'Limited chase GR86 — grab before it disappears.',
    description: 'Chase packaging and exclusive finish for Mini GT hunters.',
    imageStart: 2,
  },
  {
    brand: 'majorette',
    category: '1-64-scale',
    sku: 'MJ-098',
    name: 'Majorette Porsche 911 Carrera',
    slug: 'majorette-porsche-911-carrera',
    price: 529,
    stock: 32,
    scale: '1:64',
    featured: false,
    justArrived: false,
    shortDescription: 'Everyday Porsche fun in Majorette quality.',
    description: 'Bright collectible 911 Carrera with opening doors.',
    imageStart: 4,
  },
  {
    brand: 'greenlight',
    category: '1-43-scale',
    sku: 'GL-86312',
    name: 'Greenlight Chevrolet Corvette C8 1:43',
    slug: 'greenlight-chevrolet-corvette-c8-1-43',
    price: 1699,
    stock: 11,
    scale: '1:43',
    featured: false,
    justArrived: true,
    shortDescription: 'Modern Corvette mid-engine stance in 1:43.',
    description: 'Sleek C8 proportions for American sports-car fans.',
    imageStart: 6,
  },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM products');
    await client.query('DELETE FROM categories');
    await client.query('DELETE FROM brands');

    const brandMap = {};
    for (const b of brands) {
      const { rows } = await client.query(
        `INSERT INTO brands (name, slug, sort_order, is_active, is_deleted)
         VALUES ($1,$2,$3,true,false) RETURNING id, slug`,
        [b.name, b.slug, b.sort]
      );
      brandMap[rows[0].slug] = Number(rows[0].id);
    }

    const categoryMap = {};
    for (const c of categories) {
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug, description, sort_order, is_active, is_deleted)
         VALUES ($1,$2,$3,$4,true,false) RETURNING id, slug`,
        [c.name, c.slug, c.description, c.sort]
      );
      categoryMap[rows[0].slug] = Number(rows[0].id);
    }

    for (const p of productSeeds) {
      const images = buildImages(p.name, p.imageStart, 4);
      const thumb = images[0].url;
      await client.query(
        `INSERT INTO products (
          brand_id, category_id, sku, name, slug, description, short_description,
          price, compare_at_price, currency, stock, scale, thumbnail_url, images,
          is_featured, is_just_arrived, is_active, is_deleted
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'INR',$10,$11,$12,$13,$14,$15,true,false)`,
        [
          brandMap[p.brand],
          categoryMap[p.category],
          p.sku,
          p.name,
          p.slug,
          p.description,
          p.shortDescription,
          p.price,
          p.compareAtPrice ?? null,
          p.stock,
          p.scale,
          thumb,
          JSON.stringify(images),
          !!p.featured,
          !!p.justArrived,
        ]
      );
    }

    await client.query('COMMIT');
    console.log(
      `Seeded ${brands.length} brands, ${categories.length} categories, ${productSeeds.length} products (multi diecast images)`
    );
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  });
