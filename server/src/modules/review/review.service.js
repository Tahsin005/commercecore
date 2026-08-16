import mongoose from 'mongoose';
import Review from './review.model.js';
import Product from '../product/product.model.js';
import User from '../user/user.model.js';
import ApiError from '../../utils/ApiError.js';

export const createReviewService = async (reviewPayload, reqUser = null) => {
  const { productId, customerName, rating, description, imageUrl } = reviewPayload;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Invalid Product ID');
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const review = await Review.create({
    productId,
    customerName: customerName.trim(),
    userId: reqUser ? reqUser.id : null,
    rating,
    description: description.trim(),
    imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
    status: 'pending',
  });

  return review.toJSON();
};

export const getProductApprovedReviewsService = async (productId, query = {}) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new ApiError(400, 'Invalid Product ID');
  }

  const { page = 1, limit = 20 } = query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  const filter = { productId, status: 'approved' };

  const [reviews, totalCount, [ratingAggregate]] = await Promise.all([
    Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sumRating = 0;
  let totalRatingCount = 0;

  if (ratingAggregate) {
    for (const item of (Array.isArray(ratingAggregate) ? ratingAggregate : [ratingAggregate])) {
      if (item._id && item.count) {
        starCounts[item._id] = item.count;
        sumRating += item._id * item.count;
        totalRatingCount += item.count;
      }
    }
  }

  // Double check aggregate iteration
  const aggregateList = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        totalCount: { $sum: 1 },
      },
    },
  ]);

  const stats = aggregateList[0] || { avgRating: 0, totalCount: 0 };
  const averageRating = stats.totalCount > 0 ? Math.round(stats.avgRating * 10) / 10 : 0;

  return {
    reviews: reviews.map((r) => r.toJSON()),
    summary: {
      averageRating,
      totalReviews: totalCount,
      starCounts,
    },
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
  };
};

export const getAllReviewsAdminService = async (query = {}) => {
  const { status, search, page = 1, limit = 20 } = query;
  const filter = {};

  if (status && status !== 'ALL') {
    filter.status = status;
  }

  if (search && search.trim()) {
    const trimmed = search.trim().slice(0, 100);
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { customerName: regex },
      { description: regex },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 20);
  const skip = (pageNum - 1) * limitNum;

  const [reviews, totalCount, statsAggregate] = await Promise.all([
    Review.find(filter)
      .populate('productId', 'name slug code images')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Review.countDocuments(filter),
    Review.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
    ]),
  ]);

  const stats = statsAggregate[0] || { total: 0, pending: 0, approved: 0, rejected: 0 };

  return {
    reviews: reviews.map((r) => r.toJSON()),
    pagination: {
      total: totalCount,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(totalCount / limitNum),
    },
    stats: {
      total: stats.total || 0,
      pending: stats.pending || 0,
      approved: stats.approved || 0,
      rejected: stats.rejected || 0,
    },
  };
};

export const updateReviewStatusService = async (reviewId, status) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, 'Invalid Review ID');
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  review.status = status;
  await review.save();

  return review.toJSON();
};

export const deleteReviewAdminService = async (reviewId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, 'Invalid Review ID');
  }

  const review = await Review.findByIdAndDelete(reviewId);
  if (!review) {
    throw new ApiError(404, 'Review not found');
  }

  return { id: reviewId };
};
