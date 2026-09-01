import mongoose from 'mongoose';

const seoMetaSchema = new mongoose.Schema(
  {
    route: {
      type: String,
      required: [true, 'Route path is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    ogTitle: {
      type: String,
      trim: true,
      default: '',
    },
    ogDescription: {
      type: String,
      trim: true,
      default: '',
    },
    ogImage: {
      type: String,
      trim: true,
      default: '',
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    noIndex: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DEFAULT_SEO_ROUTES = [
  {
    route: '/',
    title: 'Commerce Core | Premium Fashion & Lifestyle Collections',
    description:
      'Discover curated premium fashion, bridal collections, festive wear, and everyday essentials at Commerce Core. Premium quality, best prices, and reliable nationwide delivery.',
    ogTitle: 'Commerce Core | Premium Fashion & Lifestyle Collections',
    ogDescription:
      'Discover curated premium fashion, bridal collections, festive wear, and everyday essentials at Commerce Core. Premium quality, best prices, and reliable nationwide delivery.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://commercecoreshop.vercel.app',
    keywords: [
      'Commerce Core',
      'Online Shopping Bangladesh',
      'Premium Fashion',
      'Dhakai Jamdani Saree',
      'Silk Katan Saree',
      'Bridal Sarees Bangladesh',
      'Cash on Delivery BD',
    ],
    noIndex: false,
  },
  {
    route: '/categories',
    title: 'Collections & Product Catalog | Commerce Core',
    description:
      'Browse our extensive collection of sarees, traditional wear, festive attire, and fashion essentials with live filtering by category, price, and age range.',
    ogTitle: 'Collections & Product Catalog | Commerce Core',
    ogDescription:
      'Browse our extensive collection of sarees, traditional wear, festive attire, and fashion essentials with live filtering by category, price, and age range.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://commercecoreshop.vercel.app/categories',
    keywords: [
      'Commerce Core Catalog',
      'Buy Sarees Online',
      'Jamdani Saree',
      'Katan Saree',
      'Cotton Sarees',
      'Women Fashion BD',
      'Party Wear Sarees',
    ],
    noIndex: false,
  },
  {
    route: '/login',
    title: 'Customer Sign In | Commerce Core',
    description:
      'Sign in to your Commerce Core account to view your order history, manage your profile, and enjoy a seamless checkout experience.',
    ogTitle: 'Customer Sign In | Commerce Core',
    ogDescription:
      'Sign in to your Commerce Core account to view your order history, manage your profile, and enjoy a seamless checkout experience.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://commercecoreshop.vercel.app/login',
    keywords: ['Commerce Core Login', 'Customer Sign In', 'Track Order Login'],
    noIndex: false,
  },
  {
    route: '/signup',
    title: 'Create an Account | Commerce Core',
    description:
      'Join Commerce Core today for faster checkout, personalized recommendations, exclusive discounts, and simple order tracking nationwide.',
    ogTitle: 'Create an Account | Commerce Core',
    ogDescription:
      'Join Commerce Core today for faster checkout, personalized recommendations, exclusive discounts, and simple order tracking nationwide.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://commercecoreshop.vercel.app/signup',
    keywords: ['Commerce Core Signup', 'Register Account', 'New Customer Registration'],
    noIndex: false,
  },
  {
    route: '/profile',
    title: 'My Profile & Order History | Commerce Core',
    description:
      'Manage your Commerce Core personal details, delivery addresses, and track real-time status of your active and past orders.',
    ogTitle: 'My Profile & Order History | Commerce Core',
    ogDescription:
      'Manage your Commerce Core personal details, delivery addresses, and track real-time status of your active and past orders.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://commercecoreshop.vercel.app/profile',
    keywords: ['Customer Profile', 'Order History', 'Order Tracking'],
    noIndex: true,
  },
  {
    route: '/checkout',
    title: 'Cart & Secure Checkout | Commerce Core',
    description:
      'Review your cart items and complete your order with fast Cash-on-Delivery across Dhaka and all districts in Bangladesh.',
    ogTitle: 'Cart & Secure Checkout | Commerce Core',
    ogDescription:
      'Review your cart items and complete your order with fast Cash-on-Delivery across Dhaka and all districts in Bangladesh.',
    ogImage: '/logo.png',
    canonicalUrl: 'https://commercecoreshop.vercel.app/checkout',
    keywords: ['Commerce Core Checkout', 'Cash on Delivery Checkout', 'Cart Review BD'],
    noIndex: true,
  },
];

const SeoMeta = mongoose.model('SeoMeta', seoMetaSchema);

export default SeoMeta;
