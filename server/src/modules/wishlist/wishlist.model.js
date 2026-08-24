import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
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
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

const wishlistItemSchema = new mongoose.Schema(
  {
    wishlistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wishlist',
      required: [true, 'Wishlist ID is required'],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      default: null,
    },
    color: {
      type: String,
      trim: true,
      default: null,
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
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Prevent duplicate product + variant + color entries per wishlist
wishlistItemSchema.index({ wishlistId: 1, productId: 1, productVariantId: 1, color: 1 }, { unique: true });

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export const WishlistItem = mongoose.model('WishlistItem', wishlistItemSchema);

export const ensureWishlistIndexes = async () => {
  try {
    const collection = WishlistItem.collection;
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === 'wishlistId_1_productId_1');
    if (oldIndex) {
      await collection.dropIndex('wishlistId_1_productId_1');
    }
    await WishlistItem.syncIndexes();
  } catch (err) {
    // Ignore transient index sync error
  }
};

export default Wishlist;
