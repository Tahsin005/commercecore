import connectDB from '../config/db.js';
import Category from '../modules/category/category.model.js';
import Product from '../modules/product/product.model.js';
import logger from '../utils/logger.js';

const sampleCategories = [
  { name: "Men's Fashion", slug: 'mens-fashion' },
  { name: "Women's Fashion", slug: 'womens-fashion' },
  { name: 'Electronics & Gadgets', slug: 'electronics-gadgets' },
  { name: 'Footwear & Shoes', slug: 'footwear-shoes' },
  { name: 'Accessories', slug: 'accessories' },
];

const sampleProducts = [
  // Men's Fashion
  {
    name: 'Classic Linen Shirt',
    slug: 'classic-linen-shirt',
    description: 'Premium lightweight linen shirt perfect for casual summer days.',
    price: 49.99,
    categorySlug: 'mens-fashion',
  },
  {
    name: 'Slim Fit Denim Jacket',
    slug: 'slim-fit-denim-jacket',
    description: 'Timeless vintage denim jacket crafted with durable reinforced stitching.',
    price: 89.99,
    categorySlug: 'mens-fashion',
  },

  // Women's Fashion
  {
    name: 'Floral Wrap Summer Dress',
    slug: 'floral-wrap-summer-dress',
    description: 'Elegant floral print wrap dress made from breathable cotton blend.',
    price: 64.99,
    categorySlug: 'womens-fashion',
  },
  {
    name: 'Cashmere Knit Cardigan',
    slug: 'cashmere-knit-cardigan',
    description: 'Ultra-soft premium cashmere blend knit cardigan for cozy warmth.',
    price: 119.99,
    categorySlug: 'womens-fashion',
  },

  // Electronics & Gadgets
  {
    name: 'Noise-Canceling Wireless Headphones',
    slug: 'noise-canceling-wireless-headphones',
    description: 'High-fidelity over-ear headphones featuring active noise cancellation and 30-hour battery life.',
    price: 199.99,
    categorySlug: 'electronics-gadgets',
  },
  {
    name: 'Smart Fitness Tracker Watch',
    slug: 'smart-fitness-tracker-watch',
    description: 'Water-resistant smartwatch featuring heart rate monitoring, sleep tracking, and built-in GPS.',
    price: 129.99,
    categorySlug: 'electronics-gadgets',
  },

  // Footwear & Shoes
  {
    name: 'Leather Urban Sneakers',
    slug: 'leather-urban-sneakers',
    description: 'Handcrafted genuine leather sneakers with cushioned ergonomic insoles.',
    price: 84.99,
    categorySlug: 'footwear-shoes',
  },
  {
    name: 'Classic Oxford Dress Shoes',
    slug: 'classic-oxford-dress-shoes',
    description: 'Sleek polished leather Oxfords designed for formal and business occasions.',
    price: 139.99,
    categorySlug: 'footwear-shoes',
  },

  // Accessories
  {
    name: 'Minimalist Leather Wallet',
    slug: 'minimalist-leather-wallet',
    description: 'Slim RFID-blocking genuine leather bi-fold wallet.',
    price: 34.99,
    categorySlug: 'accessories',
  },
  {
    name: 'Polarized UV Sunglasses',
    slug: 'polarized-uv-sunglasses',
    description: 'UV400 protection polarized sunglasses with lightweight aluminum-magnesium alloy frame.',
    price: 45.0,
    categorySlug: 'accessories',
  },
];

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database...');
    await connectDB();

    logger.info('Clearing existing Category and Product collections...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    logger.info('Inserting Categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    logger.info(`Successfully seeded ${createdCategories.length} categories.`);

    // map category slug to created category _id
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});

    const productsToInsert = sampleProducts.map((p) => {
      const { categorySlug, ...productData } = p;
      return {
        ...productData,
        categoryId: categoryMap[categorySlug] || null,
      };
    });

    logger.info('Inserting Products...');
    const createdProducts = await Product.insertMany(productsToInsert);
    logger.info(`Successfully seeded ${createdProducts.length} products.`);

    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
