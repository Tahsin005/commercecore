import mongoose from 'mongoose';

// 1. Banner Model
const bannerSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true, trim: true },
    title: { type: String, default: '', trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
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
  }
);
bannerSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

// 2. ContactChannel Model
const contactChannelSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['call', 'whatsapp', 'bkash', 'nagad'],
      default: 'call',
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
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
  }
);
contactChannelSchema.index({ isActive: 1, sortOrder: 1, createdAt: -1 });

// 3. ContentBlock Model
const contentBlockSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
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
  }
);

// 4. ProductInfoBullet Model
const productInfoBulletSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
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
  }
);
productInfoBulletSchema.index({ isActive: 1, productId: 1, sortOrder: 1 });

export const Banner = mongoose.model('Banner', bannerSchema);
export const ContactChannel = mongoose.model('ContactChannel', contactChannelSchema);
export const ContentBlock = mongoose.model('ContentBlock', contentBlockSchema);
export const ProductInfoBullet = mongoose.model('ProductInfoBullet', productInfoBulletSchema);
