import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../config/db.js';
import Category from '../modules/category/category.model.js';
import Product, { ProductVariant, ProductVariantLink } from '../modules/product/product.model.js';
import UploadConfig from '../modules/upload/uploadConfig.model.js';
import { uploadImageToCloudinaryService } from '../modules/upload/upload.service.js';
import { seedDefaultSeoRecordsService } from '../modules/seo/seo.service.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES_ASSET_DIR = path.join(__dirname, '../assets/categories');
const PRODUCTS_ASSET_DIR = path.join(__dirname, '../assets/products');

const sampleCategories = [
  {
    name: 'Jamdani Sharees',
    slug: 'jamdani-sarees',
    isFeatured: true,
    imageFile: 'img1.jpeg',
  },
  {
    name: 'Katan & Silk Sharees',
    slug: 'katan-silk-sarees',
    isFeatured: true,
    imageFile: 'img2.png',
  },
  {
    name: 'Cotton & Casual Sharees',
    slug: 'cotton-sarees',
    isFeatured: true,
    imageFile: 'img3.png',
  },
  {
    name: 'Organza & Tissue Sharees',
    slug: 'organza-sarees',
    isFeatured: true,
    imageFile: 'img4.png',
  },
  {
    name: 'Bridal & Heavy Zari Sharees',
    slug: 'bridal-sarees',
    isFeatured: false,
    imageFile: 'img5.png',
  },
  {
    name: 'Georgette & Partywear Sharees',
    slug: 'partywear-sarees',
    isFeatured: false,
    imageFile: 'img6.png',
  },
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
    name: 'Royal Dhakai Jamdani Sharee',
    slug: 'royal-dhakai-jamdani-sharee',
    code: 'JAM-DHK-001',
    description: 'Handcrafted traditional Dhakai Jamdani Sharee with intricate gold zari thread geometric weaving.',
    price: 8500,
    quantity: 25,
    isFeatured: true,
    isActive: true,
    categorySlug: 'jamdani-sarees',
    imageFile: 'img1.jpeg',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Kanchipuram Crimson Silk Katan Sharee',
    slug: 'kanchipuram-crimson-silk-katan-sharee',
    code: 'KTN-KNC-002',
    description: 'Luxurious crimson red Kanchipuram silk katan Sharee with opulent gold brocade border and rich pallu.',
    price: 14500,
    quantity: 18,
    isFeatured: true,
    isActive: true,
    categorySlug: 'katan-silk-sarees',
    imageFile: 'img2.jpeg',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Soft Handloom Muslin Jamdani Sharee',
    slug: 'soft-handloom-muslin-jamdani-sharee',
    code: 'JAM-MSL-003',
    description: 'Lightweight breathable pastel muslin Jamdani Sharee featuring delicate floral vine motifs.',
    price: 11200,
    quantity: 20,
    isFeatured: true,
    isActive: true,
    categorySlug: 'jamdani-sarees',
    imageFile: 'img3.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Pure Rajshahi Silk Pattern Sharee',
    slug: 'pure-rajshahi-silk-pattern-sharee',
    code: 'KTN-RJS-004',
    description: 'Premium pure silk Sharee from Rajshahi with lustrous texture and contrast woven pallu.',
    price: 9800,
    quantity: 22,
    isFeatured: false,
    isActive: true,
    categorySlug: 'katan-silk-sarees',
    imageFile: 'img4.png',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years'],
  },
  {
    name: 'Printed Pure Cotton Daily Sharee',
    slug: 'printed-pure-cotton-daily-sharee',
    code: 'COT-PRN-005',
    description: 'Comfortable 100% natural cotton Sharee with elegant hand-block print design suited for daily wear.',
    price: 2450,
    quantity: 50,
    isFeatured: true,
    isActive: true,
    categorySlug: 'cotton-sarees',
    imageFile: 'img5.png',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Flowy Floral Organza Silk Sharee',
    slug: 'flowy-floral-organza-silk-sharee',
    code: 'ORG-FLR-006',
    description: 'Sheer lightweight organza Sharee with hand-painted floral embroidery and scalloped border work.',
    price: 6750,
    quantity: 30,
    isFeatured: true,
    isActive: true,
    categorySlug: 'organza-sarees',
    imageFile: 'img6.jpeg',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Bridal Zardosi Embroidered Velvet Sharee',
    slug: 'bridal-zardosi-embroidered-velvet-sharee',
    code: 'BRL-ZAR-007',
    description: 'Heavy royal bridal Sharee featuring intricate hand-embroidered Zardosi and stone work along the borders.',
    price: 24500,
    quantity: 12,
    isFeatured: false,
    isActive: true,
    categorySlug: 'bridal-sarees',
    imageFile: 'img7.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years', '2-3 years'],
  },
  {
    name: 'Designer Georgette Sequin Party Sharee',
    slug: 'designer-georgette-sequin-party-sharee',
    code: 'PTY-GEO-008',
    description: 'High-fashion georgette Sharee with shimmering sequin highlights and ruffled pallu design.',
    price: 7850,
    quantity: 28,
    isFeatured: true,
    isActive: true,
    categorySlug: 'partywear-sarees',
    imageFile: 'img8.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Traditional Bengal Taant Cotton Sharee',
    slug: 'traditional-bengal-taant-cotton-sharee',
    code: 'COT-TNT-009',
    description: 'Authentic Bengal Taant cotton Sharee with traditional temple border pattern and crisp finish.',
    price: 1950,
    quantity: 45,
    isFeatured: false,
    isActive: true,
    categorySlug: 'cotton-sarees',
    imageFile: 'img9.jpeg',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Banarasi Katan Silk Gold Zari Sharee',
    slug: 'banarasi-katan-silk-gold-zari-sharee',
    code: 'KTN-BNR-010',
    description: 'Royal Banarasi katan silk Sharee embellished with woven gold zari jaal work across the drape.',
    price: 16800,
    quantity: 15,
    isFeatured: true,
    isActive: true,
    categorySlug: 'katan-silk-sarees',
    imageFile: 'img10.jpeg',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Dhakai Heritage Fine Muslin Sharee',
    slug: 'dhakai-heritage-fine-muslin-sharee',
    code: 'JAM-HRT-011',
    description: "Collector's edition heritage fine muslin Jamdani Sharee woven by master artisans in Narayanganj.",
    price: 18500,
    quantity: 10,
    isFeatured: false,
    isActive: true,
    categorySlug: 'jamdani-sarees',
    imageFile: 'img11.jpeg',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years', '2-3 years'],
  },
  {
    name: 'Pastel Tissue Organza Lace Sharee',
    slug: 'pastel-tissue-organza-lace-sharee',
    code: 'ORG-TIS-012',
    description: 'Shimmering pastel tissue organza Sharee decorated with delicate cut-work lace embroidery.',
    price: 8200,
    quantity: 24,
    isFeatured: true,
    isActive: true,
    categorySlug: 'organza-sarees',
    imageFile: 'img12.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Heavy Bridal Maroon Banarasi Silk Sharee',
    slug: 'heavy-bridal-maroon-banarasi-silk-sharee',
    code: 'BRL-MRN-013',
    description: 'Deep maroon bridal Banarasi silk Sharee enriched with heavy antique gold zari weaving.',
    price: 28900,
    quantity: 8,
    isFeatured: true,
    isActive: true,
    categorySlug: 'bridal-sarees',
    imageFile: 'img13.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Chanderi Silk Cotton Blend Sharee',
    slug: 'chanderi-silk-cotton-blend-sharee',
    code: 'KTN-CHN-014',
    description: 'Elegant Chanderi silk cotton blend Sharee with lightweight golden sheen and woven bootis.',
    price: 5400,
    quantity: 35,
    isFeatured: false,
    isActive: true,
    categorySlug: 'katan-silk-sarees',
    imageFile: 'img14.png',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Hand-Painted Peacock Dupion Silk Sharee',
    slug: 'hand-painted-peacock-dupion-silk-sharee',
    code: 'KTN-DUP-015',
    description: 'Artisan hand-painted raw dupion silk Sharee featuring traditional peacock artwork along the pallu.',
    price: 12500,
    quantity: 14,
    isFeatured: true,
    isActive: true,
    categorySlug: 'katan-silk-sarees',
    imageFile: 'img15.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Contemporary Digital Print Georgette Sharee',
    slug: 'contemporary-digital-print-georgette-sharee',
    code: 'PTY-DIG-016',
    description: 'Lightweight georgette Sharee with modern abstract digital print and satin border piping.',
    price: 4800,
    quantity: 32,
    isFeatured: true,
    isActive: true,
    categorySlug: 'partywear-sarees',
    imageFile: 'img16.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Embroidered Crystal Net Party Sharee',
    slug: 'embroidered-crystal-net-party-sharee',
    code: 'PTY-NET-017',
    description: 'Glamorous sheer net Sharee studded with crystal stone embroidery and satin inner skirt lining.',
    price: 9500,
    quantity: 20,
    isFeatured: false,
    isActive: true,
    categorySlug: 'partywear-sarees',
    imageFile: 'img17.jpeg',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Soft Half-Silk Jamdani Festive Sharee',
    slug: 'soft-half-silk-jamdani-festive-sharee',
    code: 'JAM-HLF-018',
    description: 'Soft half-silk Jamdani Sharee suited for Pohela Boishakh, weddings, and evening festivities.',
    price: 6200,
    quantity: 30,
    isFeatured: true,
    isActive: true,
    categorySlug: 'jamdani-sarees',
    imageFile: 'img18.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Pure Organic Linen Sharee with Tassels',
    slug: 'pure-organic-linen-sharee-with-tassels',
    code: 'COT-LIN-019',
    description: 'Eco-friendly organic linen Sharee with hand-knotted thread tassels along the pallu border.',
    price: 4900,
    quantity: 26,
    isFeatured: false,
    isActive: true,
    categorySlug: 'cotton-sarees',
    imageFile: 'img19.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years', '2-3 years'],
  },
  {
    name: 'Royal Velvet Border Bridal Heritage Sharee',
    slug: 'royal-velvet-border-bridal-heritage-sharee',
    code: 'BRL-VLV-020',
    description: 'Opulent bridal Sharee featuring heavy velvet borders embroidered with dabka and sequin work.',
    price: 22000,
    quantity: 11,
    isFeatured: false,
    isActive: true,
    categorySlug: 'bridal-sarees',
    imageFile: 'img20.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Soft Metallic Tissue Silk Party Sharee',
    slug: 'soft-metallic-tissue-silk-party-sharee',
    code: 'ORG-MTL-021',
    description: 'Graceful metallic tissue silk Sharee with a subtle shimmer and contrast raw silk blouse piece.',
    price: 7900,
    quantity: 22,
    isFeatured: true,
    isActive: true,
    categorySlug: 'organza-sarees',
    imageFile: 'img21.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Boutique Pearl Work Silk Chiffon Sharee',
    slug: 'boutique-pearl-work-silk-chiffon-sharee',
    code: 'PTY-CHF-022',
    description: 'Flowing silk chiffon Sharee with delicate hand-stitched pearl work along the pallu border.',
    price: 8900,
    quantity: 19,
    isFeatured: false,
    isActive: true,
    categorySlug: 'partywear-sarees',
    imageFile: 'img22.jpeg',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  },
  {
    name: 'Authentic Tangail Handloom Cotton Sharee',
    slug: 'authentic-tangail-handloom-cotton-sharee',
    code: 'COT-TNG-023',
    description: 'Authentic Tangail cotton Sharee hand-woven with traditional geometric borders and soft finish.',
    price: 2800,
    quantity: 40,
    isFeatured: false,
    isActive: true,
    categorySlug: 'cotton-sarees',
    imageFile: 'img23.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years', '2-3 years', '3-4 years'],
  },
  {
    name: 'Gold Zari Embroidered Organza Sharee',
    slug: 'gold-zari-embroidered-organza-sharee',
    code: 'ORG-ZAR-024',
    description: 'Sheer organza Sharee embellished with fine gold thread lace and sparkling stone highlights.',
    price: 9200,
    quantity: 25,
    isFeatured: true,
    isActive: true,
    categorySlug: 'organza-sarees',
    imageFile: 'img24.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Handcrafted Kantha Stitch Cotton Sharee',
    slug: 'handcrafted-kantha-stitch-cotton-sharee',
    code: 'COT-KNT-025',
    description: 'Breathable daily cotton Sharee decorated with authentic Bengal Kantha stitch hand embroidery.',
    price: 3600,
    quantity: 30,
    isFeatured: false,
    isActive: true,
    categorySlug: 'cotton-sarees',
    imageFile: 'img25.jpeg',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Contemporary Pre-Pleated Ready Sharee',
    slug: 'contemporary-pre-pleated-ready-sharee',
    code: 'PTY-PLT-026',
    description: 'Pre-pleated designer Sharee with adjustable waist belt for an effortless 1-minute drape.',
    price: 7450,
    quantity: 27,
    isFeatured: false,
    isActive: true,
    categorySlug: 'partywear-sarees',
    imageFile: 'img26.jpeg',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years'],
  },
  {
    name: 'Exclusive Banarasi Tanchoi Silk Sharee',
    slug: 'exclusive-banarasi-tanchoi-silk-sharee',
    code: 'KTN-TNC-027',
    description: 'Richly woven Tanchoi Banarasi silk Sharee with multi-colored floral jacquard weaving.',
    price: 15400,
    quantity: 16,
    isFeatured: true,
    isActive: true,
    categorySlug: 'katan-silk-sarees',
    imageFile: 'img27.png',
    variantLabels: ['0-6 months', '6-12 months', '1-2 years', '2-3 years'],
  },
  {
    name: 'Self-Weave Fine Count Muslin Sharee',
    slug: 'self-weave-fine-count-muslin-sharee',
    code: 'JAM-SLF-028',
    description: 'Fine count 100s muslin Jamdani Sharee woven with subtle self-colored geometric motifs.',
    price: 13800,
    quantity: 15,
    isFeatured: true,
    isActive: true,
    categorySlug: 'jamdani-sarees',
    imageFile: 'img28.png',
    variantLabels: ['2-3 years', '3-4 years', '4-5 years', '5-6 years'],
  },
  {
    name: 'Bridal Heavily Woven Gold Katan Sharee',
    slug: 'bridal-heavily-woven-gold-katan-sharee',
    code: 'BRL-KTN-029',
    description: 'Gorgeous bridal katan silk Sharee featuring dense gold zari work across the body and pallu.',
    price: 26500,
    quantity: 9,
    isFeatured: true,
    isActive: true,
    categorySlug: 'bridal-sarees',
    imageFile: 'img29.png',
    variantLabels: ['1-2 years', '2-3 years', '3-4 years', '4-5 years'],
  }
];

// Helper to upload a local image file buffer to Cloudinary
const uploadLocalImage = async (filePath) => {
  if (!fs.existsSync(filePath)) {
    logger.warn(`Asset image file not found: ${filePath}`);
    return null;
  }
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const result = await uploadImageToCloudinaryService(buffer, fileName);
  return result ? result.url : null;
};

const seedDatabase = async () => {
  try {
    logger.info('Connecting to database...');
    await connectDB();

    // Ensure there is at least one active UploadConfig for Cloudinary
    let activeUploadConfig = await UploadConfig.findOne({ isActive: true });
    if (!activeUploadConfig) {
      if (process.env.CLOUDINARY_URL) {
        logger.info('Creating UploadConfig record from CLOUDINARY_URL...');
        activeUploadConfig = await UploadConfig.create({
          name: 'Primary Cloudinary Account',
          uploadUrl: process.env.CLOUDINARY_URL,
          load: 0,
          isActive: true,
        });
      } else {
        logger.error('No active UploadConfig found in database and CLOUDINARY_URL env variable is missing.');
        logger.error('Please add a Cloudinary connection URL in the admin settings or process.env.CLOUDINARY_URL');
        process.exit(1);
      }
    }

    logger.info('Clearing existing categories, products, and variants...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    await ProductVariant.deleteMany({});
    await ProductVariantLink.deleteMany({});

    logger.info(`Uploading ${sampleCategories.length} Sharee category images to Cloudinary & inserting Categories...`);
    const createdCategories = [];
    for (const cat of sampleCategories) {
      const { imageFile, ...catData } = cat;
      const imagePath = path.join(CATEGORIES_ASSET_DIR, imageFile);
      logger.info(`Uploading category image (${imageFile}) for "${cat.name}"...`);
      let imageUrl = null;
      try {
        imageUrl = await uploadLocalImage(imagePath);
      } catch (err) {
        logger.warn(`Failed to upload category image for ${cat.name}: ${err.message}`);
      }

      const createdCat = await Category.create({
        ...catData,
        imageUrl: imageUrl || undefined,
      });
      createdCategories.push(createdCat);
    }

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

    logger.info(`Uploading ${sampleProducts.length} Sharee product images to Cloudinary & inserting Products...`);
    let totalLinks = 0;
    let productIndex = 1;
    for (const p of sampleProducts) {
      const { categorySlug, variantLabels, imageFile, quantity: _q, ...productData } = p;
      const imagePath = path.join(PRODUCTS_ASSET_DIR, imageFile);
      logger.info(`[${productIndex}/${sampleProducts.length}] Uploading product image (${imageFile}) for "${p.name}"...`);

      let imageUrl = null;
      try {
        imageUrl = await uploadLocalImage(imagePath);
      } catch (err) {
        logger.warn(`Failed to upload product image for ${p.name}: ${err.message}`);
      }

      const catId = categoryMap[categorySlug];
      if (!catId) {
        throw new Error(`Category "${categorySlug}" not found in seed categoryMap for product "${p.name}"`);
      }
      const product = await Product.create({
        ...productData,
        categoryId: catId,
        images: imageUrl ? [imageUrl] : [],
      });

      if (variantLabels && variantLabels.length > 0) {
        const linksToInsert = variantLabels
          .filter((label) => variantMap[label])
          .map((label, idx) => ({
            productId: product.id,
            productVariantId: variantMap[label],
            price: product.price + idx * 100,
            quantity: 12 + idx * 4,
          }));
        if (linksToInsert.length > 0) {
          const createdLinks = await ProductVariantLink.insertMany(linksToInsert);
          totalLinks += createdLinks.length;
        }
      }
      productIndex++;
    }

    logger.info('Seeding default SEO metadata for frontend routes...');
    await seedDefaultSeoRecordsService();

    logger.info(`Successfully seeded ${sampleCategories.length} Sharee categories, ${createdVariants.length} age variants, ${sampleProducts.length} Sharee products, and ${totalLinks} variant links.`);
    logger.info('All Sharee category and product images were successfully uploaded to Cloudinary!');
    process.exit(0);
  } catch (error) {
    logger.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
