export const siteConfig = {
  name: "Commerce Core",
  shortName: "Commerce Core",
  tagline: "Premium Full-Stack E-Commerce Platform",
  description:
    "Discover curated premium fashion, bridal collections, festive wear, and everyday essentials at Commerce Core. Premium quality, best prices, and reliable nationwide delivery.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://commercecoreshop.vercel.app",
  ogImage: "/logo.png",
  keywords: [
    "Commerce Core",
    "Dhakai Jamdani Saree",
    "Silk Katan Saree",
    "Handloom Sarees",
    "Cotton Casual Sarees",
    "Bridal Sarees Bangladesh",
    "Organza Sarees",
    "Partywear Sarees",
    "Bangladeshi Traditional Clothing",
    "Luxury Women Fashion BD",
    "Online Saree Shop Bangladesh",
    "Traditional Ethnic Wear",
    "Authentic Bangladeshi Fashion",
  ],
  authors: [{ name: "Commerce Core", url: "https://commercecoreshop.vercel.app" }],
  creator: "Commerce Core",
  publisher: "Commerce Core",
  category: "clothing",
  locale: "en_US",
  localeAlternate: "bn_BD",
  contact: {
    email: "support@commercecore.com",
    telephone: "+8801700000000",
    country: "Bangladesh",
  },
  social: {
    facebook: "https://facebook.com/commercecore",
    instagram: "https://instagram.com/commercecore",
    whatsapp: "https://wa.me/8801700000000",
  },
  themeColor: "#321014",
  backgroundColor: "#FAECEB",
};

export type SiteConfig = typeof siteConfig;
