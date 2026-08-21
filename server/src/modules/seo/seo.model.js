import mongoose from 'mongoose';

const seoMetaSchema = new mongoose.Schema(
  {
    route: {
      type: String,
      required: [true, 'Route path is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    ogTitle: {
      type: String,
      trim: true,
      default: '',
    },
    ogDescription: {
      type: String,
      trim: true,
      default: '',
    },
    ogImage: {
      type: String,
      trim: true,
      default: '',
    },
    canonicalUrl: {
      type: String,
      trim: true,
      default: '',
    },
    keywords: [
      {
        type: String,
        trim: true,
      },
    ],
    noIndex: {
      type: Boolean,
      default: false,
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

const SeoMeta = mongoose.model('SeoMeta', seoMetaSchema);

export default SeoMeta;
