// Google Analytics 4 (GA4) Event Tracking Utility

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-JR8SSQWMHZ";

// Safe generic event tracker
export const trackGaEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
};

// 1. Page View (for SPA route transitions)
export const trackGaPageView = (url: string) => {
  trackGaEvent("page_view", {
    page_path: url,
  });
};

// 2. View Item
export const trackGaViewItem = (params: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackGaEvent("view_item", {
    currency: "BDT",
    value: Number(params.price.toFixed(2)),
    items: [
      {
        item_id: params.id,
        item_name: params.name,
        item_category: params.category,
        price: Number(params.price.toFixed(2)),
      },
    ],
  });
};

// 3. Add to Cart
export const trackGaAddToCart = (item: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
}) => {
  const qty = item.quantity || 1;
  trackGaEvent("add_to_cart", {
    currency: "BDT",
    value: Number((item.price * qty).toFixed(2)),
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        quantity: qty,
        price: Number(item.price.toFixed(2)),
      },
    ],
  });
};

// 4. Add to Wishlist
export const trackGaAddToWishlist = (item: {
  productId: string;
  name: string;
  price: number;
}) => {
  trackGaEvent("add_to_wishlist", {
    currency: "BDT",
    value: Number(item.price.toFixed(2)),
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        price: Number(item.price.toFixed(2)),
      },
    ],
  });
};

// 5. Begin Checkout
export const trackGaBeginCheckout = (
  items: Array<{
    productId?: string;
    id?: string;
    name?: string;
    productName?: string;
    price?: number;
    effectivePrice?: number;
    quantity?: number;
  }>,
  totalValue: number
) => {
  trackGaEvent("begin_checkout", {
    currency: "BDT",
    value: Number(totalValue.toFixed(2)),
    items: items.map((item) => ({
      item_id: item.productId || item.id || "",
      item_name: item.name || item.productName || "",
      quantity: item.quantity || 1,
      price: Number((item.price || item.effectivePrice || 0).toFixed(2)),
    })),
  });
};

// 6. Purchase
export const trackGaPurchase = (order: {
  orderNumber: string;
  total: number;
  items?: Array<{
    productId?: string;
    name?: string;
    productName?: string;
    price?: number;
    unitPrice?: number;
    quantity?: number;
  }>;
}) => {
  trackGaEvent("purchase", {
    transaction_id: order.orderNumber,
    currency: "BDT",
    value: Number(order.total.toFixed(2)),
    items: (order.items || []).map((item) => ({
      item_id: item.productId || "",
      item_name: item.name || item.productName || "",
      quantity: item.quantity || 1,
      price: Number((item.price || item.unitPrice || 0).toFixed(2)),
    })),
  });
};

// 7. Search
export const trackGaSearch = (searchTerm: string) => {
  if (!searchTerm || !searchTerm.trim()) return;
  trackGaEvent("search", {
    search_term: searchTerm.trim(),
  });
};

// 8. Generate Lead (WhatsApp inquiry)
export const trackGaGenerateLead = (contentType: string = "whatsapp_inquiry") => {
  trackGaEvent("generate_lead", {
    content_type: contentType,
  });
};

// 9. Sign Up / Claim Account
export const trackGaSignUp = (method: string = "signup") => {
  trackGaEvent("sign_up", {
    method,
  });
};
