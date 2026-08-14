import connectDB from '../config/db.js';
import Category from '../modules/category/category.model.js';
import Product, { ProductVariant, ProductVariantLink } from '../modules/product/product.model.js';
import logger from '../utils/logger.js';

const sampleCategories = [
  { name: "Kids' Fashion", slug: 'kids-fashion', isFeatured: true },
  { name: "Infant Wear", slug: 'infant-wear', isFeatured: true },
  { name: 'Footwear & Shoes', slug: 'footwear-shoes', isFeatured: false },
  { name: 'Accessories', slug: 'accessories', isFeatured: false },
];

const sampleAgeVariants = [
  { label: '0-6 months', order: 1, isActive: true },
  { label: '6-12 months', order: 2, isActive: true },
  { label: '1-2 years', order: 3, isActive: true },
  { label: '2-3 years', order: 4, isActive: true },
  { label: '3-4 years', order: 5, isActive: true },
  { label: '4-5 years', order: 6, isActive: true },
  { label: '5-6 years', order: 7, isActive: true },
];

const sampleProducts = [
  {
    name: 'Classic Organic Cotton Romper',
    slug: 'classic-organic-cotton-romper',
    code: 'KF-ROMP-001',
    description: 'Ultra-soft 100% organic cotton romper designed for delicate skin.',
    price: 49.99,
    quantity: 50,
    isFeatured: true,
    isActive: true,
    categorySlug: 'infant-wear',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Cozy Fleece Bear Hoodie',
    slug: 'cozy-fleece-bear-hoodie',
    code: 'KF-HOOD-002',
    description: 'Warm fleece jacket featuring cute bear ear hood design.',
    price: 64.99,
    quantity: 40,
    isFeatured: true,
    isActive: true,
    categorySlug: 'kids-fashion',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Denim Overalls Set',
    slug: 'denim-overalls-set',
    code: 'KF-DEN-003',
    description: 'Durable denim overalls paired with a soft striped cotton tee.',
    price: 79.99,
    quantity: 35,
    isFeatured: true,
    isActive: true,
    categorySlug: 'kids-fashion',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Knit Wool Cardigan',
    slug: 'knit-wool-cardigan',
    code: 'KF-KNIT-004',
    description: 'Hand-knit soft merino wool cardigan for chilly autumn evenings.',
    price: 89.99,
    quantity: 30,
    isFeatured: false,
    isActive: true,
    categorySlug: 'kids-fashion',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years'],
  },
  {
    name: 'Breathable Canvas Shoes',
    slug: 'breathable-canvas-shoes',
    code: 'FS-SHOE-001',
    description: 'Non-slip rubber sole canvas shoes perfect for active toddlers.',
    price: 39.99,
    quantity: 60,
    isFeatured: true,
    isActive: true,
    categorySlug: 'footwear-shoes',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
];

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database...');
    await connectDB();

    logger.info('Clearing existing collections...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    await ProductVariantLink.deleteMany({});

    logger.info('Inserting Master Categories...');
    const createdCategories = await Category.insertMany(sampleCategories);
    const categoryMap = createdCategories.reduce((acc, cat) => {
      acc[cat.slug] = cat._id;
      return acc;
    }, {});

    logger.info('Inserting Master Global Age Variants...');
    const createdVariants = await ProductVariant.insertMany(sampleAgeVariants);
    const variantMap = createdVariants.reduce((acc, v) => {
      acc[v.label] = v.id;
      return acc;
    }, {});

    logger.info('Inserting Products & Creating ProductVariantLinks...');
    let totalLinks = 0;
    for (const p of sampleProducts) {
      const { categorySlug, variantLabels, ...productData } = p;
      const product = await Product.create({
        ...productData,
        categoryId: categoryMap[categorySlug] || null,
      });

      if (variantLabels && variantLabels.length > 0) {
        const linksToInsert = variantLabels
          .filter((label) => variantMap[label])
          .map((label) => ({
            productId: product.id,
            productVariantId: variantMap[label],
          }));
        if (linksToInsert.length > 0) {
          const createdLinks = await ProductVariantLink.insertMany(linksToInsert);
          totalLinks += createdLinks.length;
        }
      }
    }

    logger.info(`Successfully seeded ${sampleCategories.length} categories, ${createdVariants.length} age variants, ${sampleProducts.length} products, and ${totalLinks} variant links.`);
    logger.info('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
