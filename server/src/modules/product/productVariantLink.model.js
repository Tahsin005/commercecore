import mongoose from 'mongoose';

const productVariantLinkSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    productVariantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ProductVariant',
      required: [true, 'Product Variant ID is required'],
      index: true,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      default: null,
    },
    quantity: {
      type: Number,
      min: [0, 'Quantity cannot be negative'],
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer quantity',
      },
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

productVariantLinkSchema.index({ productId: 1, productVariantId: 1 }, { unique: true });

const ProductVariantLink = mongoose.model('ProductVariantLink', productVariantLinkSchema);

export const ensureUniqueProductVariantLinks = async () => {
  try {
    const duplicates = await ProductVariantLink.aggregate([
      {
        $group: {
          _id: { productId: '$productId', productVariantId: '$productVariantId' },
          ids: { $push: '$_id' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    for (const dup of duplicates) {
      const [, ...toDelete] = dup.ids;
      if (toDelete.length > 0) {
        await ProductVariantLink.deleteMany({ _id: { $in: toDelete } });
      }
    }

    await ProductVariantLink.syncIndexes();
  } catch (err) {
    // ignore index sync error if DB connection is transient
  }
};

export default ProductVariantLink;
