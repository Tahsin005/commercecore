import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema(
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

const cartItemSchema = new mongoose.Schema(
  {
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
      required: [true, 'Cart ID is required'],
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
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

// Unique constraint per cart + product + variant + color combination
cartItemSchema.index({ cartId: 1, productId: 1, productVariantId: 1, color: 1 }, { unique: true });

export const Cart = mongoose.model('Cart', cartSchema);
export const CartItem = mongoose.model('CartItem', cartItemSchema);

export const ensureCartIndexes = async () => {
  try {
    const collection = CartItem.collection;
    const indexes = await collection.indexes();
    const oldIndex = indexes.find((idx) => idx.name === 'cartId_1_productId_1_productVariantId_1');
    if (oldIndex) {
      await collection.dropIndex('cartId_1_productId_1_productVariantId_1');
    }
    await CartItem.syncIndexes();
  } catch (err) {
    if (err.codeName !== 'NamespaceNotFound') {
      throw err;
    }
  }
};

export default Cart;
