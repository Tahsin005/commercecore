export const siteConfig = {
  name: "Rupzon Collection",
  shortName: "Rupzon",
  tagline: "Exclusive Traditional & Modern Bangladeshi Fashion",
  description:
    "Discover authentic handcrafted Dhakai Jamdani Sarees, Pure Silk Katans, Organza, Bridal Sarees, and exclusive festive fashion at Rupzon Collection. Premium quality, best prices, and reliable nationwide delivery.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://rupzoncollection.com",
  ogImage: "/logo.png",
  keywords: [
    "Rupzon Collection",
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
  authors: [{ name: "Rupzon Collection", url: "https://rupzoncollection.com" }],
  creator: "Rupzon Collection",
  publisher: "Rupzon Collection",
  category: "clothing",
  locale: "en_US",
  localeAlternate: "bn_BD",
  contact: {
    email: "support@rupzoncollection.com",
    telephone: "+8801700000000",
    country: "Bangladesh",
  },
  social: {
    facebook: "https://facebook.com/rupzoncollection",
    instagram: "https://instagram.com/rupzoncollection",
    whatsapp: "https://wa.me/8801700000000",
  },
  themeColor: "#321014",
  backgroundColor: "#FAECEB",
};

export type SiteConfig = typeof siteConfig;
