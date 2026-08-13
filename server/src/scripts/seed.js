import connectDB from '../config/db.js';
import Category from '../modules/category/category.model.js';
import Product, { ProductVariant } from '../modules/product/product.model.js';
import logger from '../utils/logger.js';

const sampleCategories = [
  { name: "Men's Fashion", slug: 'mens-fashion', isFeatured: true },
  { name: "Women's Fashion", slug: 'womens-fashion', isFeatured: true },
  { name: 'Electronics & Gadgets', slug: 'electronics-gadgets', isFeatured: true },
  { name: 'Footwear & Shoes', slug: 'footwear-shoes', isFeatured: false },
  { name: 'Accessories', slug: 'accessories', isFeatured: false },
];

const sampleProducts = [
  // Men's Fashion
  {
    name: 'Classic Linen Shirt',
    slug: 'classic-linen-shirt',
    code: 'MF-SHIRT-001',
    description: 'Premium lightweight linen shirt perfect for casual summer days.',
    defaultPrice: 49.99,
    isFeatured: true,
    isActive: true,
    categorySlug: 'mens-fashion',
    variants: [
      { size: 'S', price: null, quantity: 15 },
      { size: 'M', price: null, quantity: 25 },
      { size: 'L', price: null, quantity: 20 },
      { size: 'XL', price: 54.99, quantity: 10 },
    ],
  },
  {
    name: 'Slim Fit Denim Jacket',
    slug: 'slim-fit-denim-jacket',
    code: 'MF-JACKET-002',
    description: 'Timeless vintage denim jacket crafted with durable reinforced stitching.',
    defaultPrice: 89.99,
    isFeatured: true,
    isActive: true,
    categorySlug: 'mens-fashion',
    variants: [
      { size: 'M', price: null, quantity: 12 },
      { size: 'L', price: null, quantity: 18 },
      { size: 'XL', price: null, quantity: 8 },
    ],
  },

  // Women's Fashion
  {
    name: 'Floral Wrap Summer Dress',
    slug: 'floral-wrap-summer-dress',
    code: 'WF-DRESS-001',
    description: 'Elegant floral print wrap dress made from breathable cotton blend.',
    defaultPrice: 64.99,
    isFeatured: true,
    isActive: true,
    categorySlug: 'womens-fashion',
    variants: [
      { size: 'S', price: null, quantity: 30 },
      { size: 'M', price: null, quantity: 40 },
      { size: 'L', price: null, quantity: 15 },
    ],
  },
  {
    name: 'Cashmere Knit Cardigan',
    slug: 'cashmere-knit-cardigan',
    code: 'WF-KNIT-002',
    description: 'Ultra-soft premium cashmere blend knit cardigan for cozy warmth.',
    defaultPrice: 119.99,
    isFeatured: false,
    isActive: true,
    categorySlug: 'womens-fashion',
    variants: [
      { size: 'S', price: null, quantity: 10 },
      { size: 'M', price: null, quantity: 15 },
    ],
  },

  // Electronics & Gadgets
  {
    name: 'Noise-Canceling Wireless Headphones',
    slug: 'noise-canceling-wireless-headphones',
    code: 'EG-AUDIO-001',
    description: 'High-fidelity over-ear headphones featuring active noise cancellation and 30-hour battery life.',
    defaultPrice: 199.99,
    isFeatured: true,
    isActive: true,
    categorySlug: 'electronics-gadgets',
    variants: [
      { size: 'Standard', price: null, quantity: 50 },
    ],
  },
  {
    name: 'Smart Fitness Tracker Watch',
    slug: 'smart-fitness-tracker-watch',
    code: 'EG-WATCH-002',
    description: 'Water-resistant smartwatch featuring heart rate monitoring, sleep tracking, and built-in GPS.',
    defaultPrice: 129.99,
    isFeatured: false,
    isActive: true,
    categorySlug: 'electronics-gadgets',
    variants: [
      { size: '38mm', price: 129.99, quantity: 20 },
      { size: '42mm', price: 149.99, quantity: 25 },
    ],
  },

  // Footwear & Shoes
  {
    name: 'Leather Urban Sneakers',
    slug: 'leather-urban-sneakers',
    code: 'FS-SHOE-001',
    description: 'Handcrafted genuine leather sneakers with cushioned ergonomic insoles.',
    defaultPrice: 84.99,
    isFeatured: true,
    isActive: true,
    categorySlug: 'footwear-shoes',
    variants: [
      { size: '40', price: null, quantity: 10 },
      { size: '41', price: null, quantity: 15 },
      { size: '42', price: null, quantity: 20 },
      { size: '43', price: null, quantity: 12 },
    ],
  },
  {
    name: 'Classic Oxford Dress Shoes',
    slug: 'classic-oxford-dress-shoes',
    code: 'FS-SHOE-002',
    description: 'Sleek polished leather Oxfords designed for formal and business occasions.',
    defaultPrice: 139.99,
    isFeatured: false,
    isActive: true,
    categorySlug: 'footwear-shoes',
    variants: [
      { size: '41', price: null, quantity: 8 },
      { size: '42', price: null, quantity: 14 },
      { size: '43', price: null, quantity: 10 },
    ],
  },

  // Accessories
  {
    name: 'Minimalist Leather Wallet',
    slug: 'minimalist-leather-wallet',
    code: 'AC-WAL-001',
    description: 'Slim RFID-blocking genuine leather bi-fold wallet.',
    defaultPrice: 34.99,
    isFeatured: false,
    isActive: true,
    categorySlug: 'accessories',
    variants: [
      { size: 'One Size', price: null, quantity: 60 },
    ],
  },
  {
    name: 'Polarized UV Sunglasses',
    slug: 'polarized-uv-sunglasses',
    code: 'AC-SUN-002',
    description: 'UV400 protection polarized sunglasses with lightweight aluminum-magnesium alloy frame.',
    defaultPrice: 45.0,
    isFeatured: false,
    isActive: true,
    categorySlug: 'accessories',
    variants: [
      { size: 'Standard', price: null, quantity: 35 },
    ],
  },
];

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database...');
    await connectDB();

    logger.info('Clearing existing Category, Product, and ProductVariant collections...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});

    logger.info('Inserting Categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    logger.info(`Successfully seeded ${createdCategories.length} categories.`);

    // map category slug to created category _id
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});

    logger.info('Inserting Products & Product Variants...');
    let totalVariants = 0;
    for (const p of sampleProducts) {
      const { categorySlug, variants, ...productData } = p;
      const product = await Product.create({
        ...productData,
        categoryId: categoryMap[categorySlug] || null,
      });

      if (variants && variants.length > 0) {
        const variantsToInsert = variants.map((v) => ({
          productId: product.id,
          size: v.size,
          price: v.price,
          quantity: v.quantity,
        }));
        const createdVariants = await ProductVariant.insertMany(variantsToInsert);
        totalVariants += createdVariants.length;
      }
    }

    logger.info(`Successfully seeded ${sampleProducts.length} products and ${totalVariants} product variants.`);
    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
