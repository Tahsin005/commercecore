# Meta Pixel & Conversions API (CAPI) Tracking Architecture

We implement a **Dual-Tracking Setup** (Browser Pixel + Server-Side Conversions API) with **Event Deduplication** to maximize data accuracy, bypass ad-blockers/browser restrictions, and calculate exact Return on Ad Spend (ROAS).

---

## 1. Configuration & Environment Variables

| Variable | Scope | Description |
|---|---|---|
| `NEXT_PUBLIC_FB_PIXEL_ID` | Client (`client/.env`) | Meta Pixel ID used in browser initialization |
| `FB_PIXEL_ID` | Server (`server/.env`) | Meta Pixel ID used in server-side Graph API requests |
| `FB_CAPI_ACCESS_TOKEN` | Server (`server/.env`) | Meta System User Access Token generated from Events Manager |
| `FB_TEST_EVENT_CODE` | Server (`server/.env`) | Optional test code (e.g. `TEST94112`) for real-time validation in Events Manager |

---

## 2. Client-Side Meta Pixel Standard Events

Managed through the type-safe utility `client/lib/meta-pixel.ts` and loaded via Next.js `next/script` (`strategy="afterInteractive"`) in `client/app/layout.tsx`.

| # | Event Name | Trigger Point / Source File | Parameters Sent |
|---|---|---|---|
| 1 | **`PageView`** | `client/app/layout.tsx`<br>• Script mount on site visit | `fbq('track', 'PageView')` |
| 2 | **`ViewContent`** | `client/app/(customer)/product/[id]/page.tsx`<br>• Triggered when product details page loads | • `content_name`: Product Name<br>• `content_ids`: `[product.id]`<br>• `content_type`: `'product'`<br>• `content_category`: Category Name<br>• `value`: Effective Price<br>• `currency`: `'BDT'` |
| 3 | **`AddToCart`** | `client/app/(customer)/product/[id]/page.tsx`<br>• "Add to Cart" & "Order Now" buttons<br>`client/hooks/useProductCardActions.ts`<br>• Product card quick add | • `content_name`: Product Name<br>• `content_ids`: `[product.id]`<br>• `content_type`: `'product'`<br>• `value`: Total item price (Price × Qty)<br>• `currency`: `'BDT'`<br>• `quantity`: Quantity added |
| 4 | **`AddToWishlist`** | `client/app/(customer)/product/[id]/page.tsx`<br>• Wishlist toggle button<br>`client/hooks/useProductCardActions.ts`<br>• Heart icon on product cards | • `content_name`: Product Name<br>• `content_ids`: `[product.id]`<br>• `content_type`: `'product'`<br>• `value`: Item Price<br>• `currency`: `'BDT'` |
| 5 | **`InitiateCheckout`** | `client/app/(customer)/checkout/page.tsx`<br>• Triggered once on checkout page load with cart items | • `content_ids`: Array of item product IDs<br>• `content_type`: `'product'`<br>• `value`: Cart subtotal<br>• `currency`: `'BDT'`<br>• `num_items`: Number of unique items |
| 6 | **`Purchase`** | `client/app/(customer)/checkout/page.tsx`<br>• Order creation `onSuccess` callback | • `content_ids`: Array of item product IDs<br>• `content_type`: `'product'`<br>• `value`: Order Grand Total (subtotal + delivery)<br>• `currency`: `'BDT'`<br>• `num_items`: Item count<br>• `{ eventID: order.orderNumber }` (Deduplication key) |
| 7 | **`Search`** | `client/components/Navbar.tsx`<br>• Search input (debounced, >= 2 characters) | • `search_string`: Search query text |
| 8 | **`Contact`** | `client/app/(customer)/product/[id]/page.tsx`<br>• WhatsApp "Ask for details" link click | • `content_name`: `'whatsapp'` |
| 9 | **`CompleteRegistration`** | `client/hooks/useAuthMutations.ts`<br>• User signup & post-checkout claim account | • `content_name`: `'signup'` or `'claim_account'`<br>• `status`: `true` |

---

## 3. Server-Side Conversions API (CAPI) Events

Managed through `server/src/utils/metaCapi.js` using native Node.js `fetch` and SHA-256 PII hashing.

| # | Event Name | Trigger Point / Source File | Parameters Sent |
|---|---|---|---|
| 1 | **`Purchase`** | `server/src/modules/order/order.service.js`<br>• Triggered immediately after `Order.create` and `OrderItem.insertMany` succeed | • `event_name`: `'Purchase'`<br>• `event_id`: `order.orderNumber` (Matches client `eventID`)<br>• `event_time`: Unix Timestamp (seconds)<br>• `action_source`: `'website'`<br>• `user_data`: SHA-256 hashed email (`em`), normalized & hashed phone (`ph`), name (`fn`/`ln`), userId (`external_id`)<br>• `custom_data`: `currency: 'BDT'`, `value: order.total`, `order_id: order.orderNumber`, `content_ids`, `num_items`<br>• `event_source_url`: `"/order-success/{orderNumber}"` |
| 2 | **`CompleteRegistration`** | `server/src/modules/user/user.service.js`<br>• Triggered inside `registerUser` and `claimAccountService` after DB persistence | • `event_name`: `'CompleteRegistration'`<br>• `event_id`: `reg_{userId}` or `claim_{userId}`<br>• `event_time`: Unix Timestamp (seconds)<br>• `action_source`: `'website'`<br>• `user_data`: SHA-256 hashed email (`em`), phone (`ph`), name (`fn`/`ln`), userId (`external_id`)<br>• `custom_data`: `status: true`, `content_name: 'signup' \| 'claim_account'` |

---

## 4. Deduplication Mechanism (`event_id` ↔ `eventID`)

To prevent duplicate conversion counting in Meta Ads Manager when both the browser pixel and server CAPI fire for the same purchase:

```
[Customer clicks "Place Order"]
          │
          ├──► (1) Frontend fires Browser Pixel:
          │        fbq('track', 'Purchase', {...}, { eventID: 'CC-20260823-2838' })
          │
          └──► (2) Backend DB saves order & fires Server CAPI:
                   sendMetaConversionEvent({ eventName: 'Purchase', eventId: 'CC-20260823-2838', ... })
          │
          ▼
[Meta Events Manager]
  Receives both payloads ➔ Matches identical event_id ('CC-20260823-2838')
  ➔ Automatically deduplicates into 1 single verified conversion.
```
