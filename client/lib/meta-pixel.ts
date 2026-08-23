// Meta (Facebook) Pixel Event Tracking Utility

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "1738010567468201";

// Generic safe event tracker
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, any>,
  eventOptions?: { eventID?: string }
) => {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (eventOptions?.eventID) {
      window.fbq("track", eventName, parameters, eventOptions);
    } else {
      window.fbq("track", eventName, parameters);
    }
  }
};

// Track when a user views a product page
export const trackViewContent = (product: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackEvent("ViewContent", {
    content_name: product.name,
    content_ids: [product.id],
    content_type: "product",
    content_category: product.category,
    value: Number(product.price.toFixed(2)),
    currency: "BDT",
  });
};

// Track when a user adds a product to cart
export const trackAddToCart = (item: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
}) => {
  const qty = item.quantity || 1;
  trackEvent("AddToCart", {
    content_name: item.name,
    content_ids: [item.productId],
    content_type: "product",
    value: Number((item.price * qty).toFixed(2)),
    currency: "BDT",
    quantity: qty,
  });
};

// Track when a user adds a product to wishlist
export const trackAddToWishlist = (item: {
  productId: string;
  name: string;
  price: number;
}) => {
  trackEvent("AddToWishlist", {
    content_name: item.name,
    content_ids: [item.productId],
    content_type: "product",
    value: Number(item.price.toFixed(2)),
    currency: "BDT",
  });
};

// Track when a user initiates the checkout process
export const trackInitiateCheckout = (
  items: Array<{ productId: string }>,
  totalValue: number
) => {
  trackEvent("InitiateCheckout", {
    content_ids: items.map((item) => item.productId),
    content_type: "product",
    value: Number(totalValue.toFixed(2)),
    currency: "BDT",
    num_items: items.length,
  });
};

// Track when a user successfully completes a purchase
export const trackPurchase = (order: {
  orderNumber: string;
  total: number;
  items?: Array<{ productId?: string; id?: string }>;
}) => {
  const contentIds =
    order.items?.map((item) => item.productId || item.id || "").filter(Boolean) || [];

  trackEvent(
    "Purchase",
    {
      content_ids: contentIds,
      content_type: "product",
      value: Number(order.total.toFixed(2)),
      currency: "BDT",
      num_items: contentIds.length || 1,
    },
    { eventID: order.orderNumber }
  );
};

// Track when a user searches for products
export const trackSearch = (searchQuery: string) => {
  if (!searchQuery || !searchQuery.trim()) return;
  trackEvent("Search", {
    search_string: searchQuery.trim(),
  });
};

// Track when a user clicks to contact the business (e.g. WhatsApp, phone)
export const trackContact = (channel: string = "whatsapp") => {
  trackEvent("Contact", {
    content_name: channel,
  });
};

// Track when a user completes account registration or claims account
export const trackCompleteRegistration = (method: string = "email_or_phone") => {
  trackEvent("CompleteRegistration", {
    content_name: method,
    status: true,
  });
};
