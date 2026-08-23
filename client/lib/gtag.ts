// Google Analytics 4 (GA4) Event Tracking Utility

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || "G-JR8SSQWMHZ";

const isDev = process.env.NODE_ENV === "development";

// Safe generic event tracker
export const trackGaEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];

  // Ensure window.gtag exists and queues arguments
  if (typeof window.gtag !== "function") {
    /* eslint-disable-next-line prefer-rest-params */
    window.gtag = function () {
      /* eslint-disable-next-line prefer-rest-params */
      window.dataLayer!.push(arguments);
    };

    // Ensure config is pre-queued if events fire before layout script executes
    window.gtag("js", new Date());
    window.gtag("config", GA_TRACKING_ID, {
      send_page_view: false,
      debug_mode: isDev,
    });
  }

  const payload: Record<string, unknown> = {
    ...(isDev ? { debug_mode: true } : {}),
    ...eventParams,
  };

  if (isDev) {
    console.log(`[GA4 Event] ${eventName}`, payload);
  }

  window.gtag("event", eventName, payload);
};

// Page View (for SPA route transitions)
export const trackGaPageView = (url: string, title?: string) => {
  trackGaEvent("page_view", {
    page_path: url,
    page_location: typeof window !== "undefined" ? window.location.href : url,
    page_title: title || (typeof document !== "undefined" ? document.title : ""),
  });
};

// View Item List (Category or Catalog Browse)
export const trackGaViewItemList = (params: {
  listId?: string;
  listName?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    category?: string;
    variant?: string;
    index?: number;
  }>;
}) => {
  trackGaEvent("view_item_list", {
    item_list_id: params.listId,
    item_list_name: params.listName,
    items: params.items.map((item, idx) => ({
      item_id: item.id,
      item_name: item.name,
      item_category: item.category,
      item_variant: item.variant,
      price: Number(item.price.toFixed(2)),
      index: item.index !== undefined ? item.index : idx + 1,
    })),
  });
};

// View Item (Product Details)
export const trackGaViewItem = (params: {
  id: string;
  name: string;
  price: number;
  category?: string;
  variant?: string;
}) => {
  trackGaEvent("view_item", {
    currency: "BDT",
    value: Number(params.price.toFixed(2)),
    items: [
      {
        item_id: params.id,
        item_name: params.name,
        item_category: params.category,
        item_variant: params.variant,
        price: Number(params.price.toFixed(2)),
        quantity: 1,
      },
    ],
  });
};

// Add to Cart
export const trackGaAddToCart = (item: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  category?: string;
  variant?: string;
}) => {
  const qty = item.quantity || 1;
  trackGaEvent("add_to_cart", {
    currency: "BDT",
    value: Number((item.price * qty).toFixed(2)),
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variant,
        quantity: qty,
        price: Number(item.price.toFixed(2)),
      },
    ],
  });
};

// Remove from Cart
export const trackGaRemoveFromCart = (item: {
  productId: string;
  name: string;
  price: number;
  quantity?: number;
  variant?: string;
}) => {
  const qty = item.quantity || 1;
  trackGaEvent("remove_from_cart", {
    currency: "BDT",
    value: Number((item.price * qty).toFixed(2)),
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        item_variant: item.variant,
        quantity: qty,
        price: Number(item.price.toFixed(2)),
      },
    ],
  });
};

// View Cart
export const trackGaViewCart = (params: {
  items: Array<{
    productId?: string;
    id?: string;
    name?: string;
    price?: number;
    effectivePrice?: number;
    quantity?: number;
    size?: string;
  }>;
  totalValue: number;
}) => {
  trackGaEvent("view_cart", {
    currency: "BDT",
    value: Number(params.totalValue.toFixed(2)),
    items: params.items.map((item) => ({
      item_id: item.productId || item.id || "",
      item_name: item.name || "Product",
      item_variant: item.size,
      quantity: item.quantity || 1,
      price: Number((item.price || item.effectivePrice || 0).toFixed(2)),
    })),
  });
};

// Add to Wishlist
export const trackGaAddToWishlist = (item: {
  productId: string;
  name: string;
  price: number;
  category?: string;
}) => {
  trackGaEvent("add_to_wishlist", {
    currency: "BDT",
    value: Number(item.price.toFixed(2)),
    items: [
      {
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category,
        price: Number(item.price.toFixed(2)),
        quantity: 1,
      },
    ],
  });
};

// Begin Checkout
export const trackGaBeginCheckout = (
  items: Array<{
    productId?: string;
    id?: string;
    name?: string;
    productName?: string;
    price?: number;
    effectivePrice?: number;
    quantity?: number;
    size?: string;
  }>,
  totalValue: number
) => {
  trackGaEvent("begin_checkout", {
    currency: "BDT",
    value: Number(totalValue.toFixed(2)),
    items: items.map((item) => ({
      item_id: item.productId || item.id || "",
      item_name: item.name || item.productName || "",
      item_variant: item.size,
      quantity: item.quantity || 1,
      price: Number((item.price || item.effectivePrice || 0).toFixed(2)),
    })),
  });
};

// Add Shipping Info
export const trackGaAddShippingInfo = (params: {
  items: Array<{
    productId?: string;
    id?: string;
    name?: string;
    price?: number;
    effectivePrice?: number;
    quantity?: number;
    size?: string;
  }>;
  totalValue: number;
  shippingTier: string;
}) => {
  trackGaEvent("add_shipping_info", {
    currency: "BDT",
    value: Number(params.totalValue.toFixed(2)),
    shipping_tier: params.shippingTier,
    items: params.items.map((item) => ({
      item_id: item.productId || item.id || "",
      item_name: item.name || "",
      item_variant: item.size,
      quantity: item.quantity || 1,
      price: Number((item.price || item.effectivePrice || 0).toFixed(2)),
    })),
  });
};

// Purchase
export const trackGaPurchase = (order: {
  orderNumber: string;
  total: number;
  shipping?: number;
  tax?: number;
  items?: Array<{
    productId?: string;
    name?: string;
    productName?: string;
    price?: number;
    unitPrice?: number;
    quantity?: number;
    size?: string;
    selectedVariantLabel?: string;
  }>;
}) => {
  const rawVal = typeof order.total === "number" ? order.total : parseFloat(String(order.total || 0));
  const numericValue = !isNaN(rawVal) && rawVal >= 0 ? Number(rawVal.toFixed(2)) : 0;

  const rawItems = order.items && order.items.length > 0 ? order.items : [];
  const mappedItems = rawItems.map((item) => {
    const rawItemPrice = typeof item.price === "number" ? item.price : parseFloat(String(item.unitPrice || item.price || 0));
    return {
      item_id: item.productId || "",
      item_name: item.name || item.productName || "Product",
      item_variant: item.selectedVariantLabel || item.size,
      quantity: item.quantity || 1,
      price: !isNaN(rawItemPrice) ? Number(rawItemPrice.toFixed(2)) : 0,
    };
  });

  trackGaEvent("purchase", {
    transaction_id: order.orderNumber,
    currency: "BDT",
    value: numericValue,
    shipping: order.shipping ? Number(order.shipping.toFixed(2)) : 0,
    tax: order.tax ? Number(order.tax.toFixed(2)) : 0,
    items:
      mappedItems.length > 0
        ? mappedItems
        : [
            {
              item_id: order.orderNumber,
              item_name: `Order ${order.orderNumber}`,
              quantity: 1,
              price: numericValue,
            },
          ],
  });
};

// Search
export const trackGaSearch = (searchTerm: string) => {
  if (!searchTerm || !searchTerm.trim()) return;
  trackGaEvent("search", {
    search_term: searchTerm.trim(),
  });
};

// Generate Lead (WhatsApp inquiry)
export const trackGaGenerateLead = (contentType: string = "whatsapp_inquiry") => {
  trackGaEvent("generate_lead", {
    content_type: contentType,
  });
};

// Sign Up / Claim Account
export const trackGaSignUp = (method: string = "signup") => {
  trackGaEvent("sign_up", {
    method,
  });
};

// Login
export const trackGaLogin = (method: string = "phone_or_email") => {
  trackGaEvent("login", {
    method,
  });
};
