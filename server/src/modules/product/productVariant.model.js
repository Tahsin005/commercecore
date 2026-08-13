import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true,
    },
    price: {
      type: Number,
      default: null, // Overrides Product.defaultPrice when set
      min: [0, 'Price cannot be negative'],
    },
    quantity: {
      type: Number,
      default: 0, // Stock for this size
      min: [0, 'Quantity cannot be negative'],
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

const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);

export default ProductVariant;
