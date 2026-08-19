# Rupzon Collection — DB Schema & Feature List (v1)

Stack: Next.js full stack (App Router + API routes/Server Actions), assumed Postgres + Prisma-style modeling below (adjust ORM syntax as needed).

---

## 1. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid/int PK | |
| name | string | |
| email | string, unique | |
| phone | string, unique | |
| password | string (hashed) | nullable if account created via guest checkout without setting a password initially |
| isAdmin | boolean, default false | only two roles: admin / normal user |
| createdAt / updatedAt | timestamp | |

### Address
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| userId | FK → User | |
| label | string | e.g. "Home", "Office" — optional |
| fullAddress | text | |
| city | string | |
| isDefault | boolean | |

### Category
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| name | string | |
| slug | string, unique | |
| imageUrl | string | |
| isFeatured | boolean | |

### Product
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| categoryId | FK → Category, required | Mandatory association with category |
| name | string | |
| slug | string, unique | |
| code | string | product code |
| description | text | |
| price | decimal | Base regular price |
| discountPrice | decimal, nullable | Base manual discounted price (must be < price) |
| images | string[] | simple array of image URLs |
| isFeatured | boolean | |
| isActive | boolean | for hiding without deleting |
| createdAt / updatedAt | timestamp | |

### ProductVariant  (global, standalone catalog — not tied to any product by default)

| Field | Type | Notes |
|---|---|---|
| id | PK | |
| label | string, unique | e.g. "1-2 years", "2-3 years" |
| order | int | for display ordering in admin UI / on product page |
| isActive | boolean | lets admin retire a label without deleting it |

### ProductVariantLink  (join table — connects Product ↔ ProductVariant, many-to-many)

| Field | Type | Notes |
|---|---|---|
| id | PK | |
| productId | FK → Product | |
| productVariantId | FK → ProductVariant | |
| price | decimal, nullable | variant regular price override |
| discountPrice | decimal, nullable | variant manual discounted price override |
| quantity | int | variant stock quantity |
| unique(productId, productVariantId) | | prevents linking the same variant twice to one product |

### Review
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| productId | FK → Product | |
| customerName | string | not tied to a User account |
| userId | FK → User, nullable | if a logged-in user leaves it |
| rating | int (1–5) | |
| description | text | |
| imageUrl | string, nullable | |
| status | enum: pending / approved / rejected | admin moderation |
| createdAt | timestamp | |

### Wishlist / WishlistItem *(same pattern as Cart — guests use localStorage, logged-in users get DB-backed storage, merge on login)*
| Field | Type | Notes |
|---|---|---|
| Wishlist.id, userId | | one per user |
| WishlistItem.id, wishlistId, productId | | wishlist has no price/stock concern, so no variant reference needed here |

### Cart / CartItem *(guests use localStorage, logged-in users are DB-backed)*
| Field | Type | Notes |
|---|---|---|
| Cart.id, userId | | |
| CartItem.id, cartId, productId, quantity, productVariantId (nullable, FK → ProductVariant) | | variant is validated via ProductVariantLink for the productId; selectedVariantLabel is derived from the linked ProductVariant |

### Order
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| orderNumber | string, unique, indexed | date-based format, e.g. `MTF-20260811-001` (date + daily sequence), used for public tracking |
| userId | FK → User, nullable | null if guest never converts to account |
| customerName, phone, email | string | captured at checkout (works for both guest & logged-in) |
| shippingAddress | text | snapshot at time of order (don't rely on live Address FK, in case it changes later) |
| deliveryZone | enum: inside_dhaka / outside_dhaka | drives delivery charge |
| deliveryCharge | decimal | snapshot of admin-configured value at order time |
| subtotal | decimal | |
| discountAmount | decimal | snapshot of applied sitewide discount, if any |
| total | decimal | |
| status | enum (see below) | |
| createdAt / updatedAt | timestamp | |

**Order statuses (fixed enum, proposed):**
`PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED`, with `CANCELLED` and `RETURNED` as side-branches.

### OrderItem
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| orderId | FK → Order | |
| productId | FK → Product | |
| productName, unitPrice | snapshot | store copies at order time so later product edits don't rewrite history |
| selectedVariantLabel | string, nullable | plain text snapshot of the chosen age label (e.g. "2-3 years"), NOT an FK — so it stays correct even if the variant catalog changes later |
| quantity | int | |

---

### Admin-configurable content (site settings / CMS)

Implemented using a **Hybrid Storage Architecture**:

#### 1. Global Key-Value Store (`site_settings` collection)
Stores single-row configuration objects in a polymorphic `{ key, value }` collection:
- **`delivery_charge`**: `{ insideDhaka: number, outsideDhaka: number }`
- **`marquee`**: `{ text: string, isActive: boolean }`
- **`footer_settings`**: `{ description: string, helpline: string, socialLinks: { platform: string, url: string }[] }`

#### 2. Dedicated Multi-Row CMS Collections

##### `Banner` (Homepage Slider)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| imageUrl | string | Uploaded to Cloudinary |
| title | string | Optional caption title |
| sortOrder | int | Carousel display order |
| isActive | boolean | Toggle banner visibility |

##### `ContactChannel` (Helplines & Payments)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| label | string | e.g. "Bkash Personal", "Customer Helpline" |
| phoneNumber | string | Contact phone or account number |
| type | enum | `call`, `whatsapp`, `bkash`, `nagad` |
| sortOrder | int | Display sequence |
| isActive | boolean | Active toggle |

##### `ContentBlock` (Static Content Pages)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| key | string (enum) | Fixed core keys: `about_us`, `contact_us`, `how_to_buy`, `return_policy` |
| title | string | Page header title |
| body | string | Rich text / markdown page content |

##### `ProductInfoBullet` (Product Highlight Bullets)
| Field | Type | Notes |
|---|---|---|
| id | PK | |
| text | string | e.g. "100% Authentic Quality Guaranteed" |
| sortOrder | int | Display order |
| isActive | boolean | Active toggle |
| productId | FK → Product (nullable) | Optional per-product override (null = global default) |

---

## 2. Feature List

### Public storefront
- Home: banners slider, marquee ticker, featured categories, featured products
- Category listing → product grid, filter by category
- Product detail: images, age size selector (pulls linked global ProductVariants with per-variant stock & price overrides), base price from Product, stock quantity from linked ProductVariantLink, quantity selector, add to cart/wishlist, reviews list, product info bullets, "questions? call us" block
- Reviews: submit (name, rating, description, optional image) → goes to pending queue
- Cart: guest = localStorage, logged-in = DB-backed; merge localStorage cart into DB cart on login
- Wishlist: same behavior as cart — guest = localStorage, logged-in = DB-backed, merge on login
- Checkout: guest or logged-in, address entry with optional order notes/instructions, delivery zone selection, order summary with live delivery rates
- Order confirmation screen with order number & guest account claiming card
- Public order tracking page (lookup by order number, no login)
- About Us / Contact Us / How to Buy / Return Policy pages (driven by ContentBlock CMS)
- Account area (logged-in): profile, saved addresses, order history, wishlist, account claiming password setup

### Admin panel
- Auth (separate admin role or `isAdmin` flag on User)
- Category CRUD (with Cloudinary image uploads)
- Product CRUD (base price, category, code, details, images)
- Master Global Age Variant CRUD (standalone catalog: label, display order, active status)
- Product-Variant Linker (link/unlink global variants to products with per-variant stock quantity & optional price override via ProductVariantLink)
- Review moderation queue (approve/reject)
- Order management: view, update status, view/edit shipping info manually, view order notes
- Site Settings & Rates management (Delivery charges, Sitewide discount, Header marquee ticker, Footer info)
- Homepage Banners manager (with Cloudinary image upload)
- Contact Channels manager (Bkash, WhatsApp, Nagad, Call Us)
- Content Pages editor (About Us, Contact Us, How to Buy, Return Policy)
- Product Info Bullets manager
- Media Upload Endpoints (Cloudinary accounts load balancer)


