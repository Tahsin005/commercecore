import {
  createReviewService,
  getProductApprovedReviewsService,
  getAllReviewsAdminService,
  updateReviewStatusService,
  deleteReviewAdminService,
} from './review.service.js';

export const createReview = async (req, res, next) => {
  try {
    const review = await createReviewService(req.body, req.user);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! It will appear after moderation.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductApprovedReviews = async (req, res, next) => {
  try {
    const result = await getProductApprovedReviewsService(req.params.productId, req.query);
    res.status(200).json({
      success: true,
      data: result.reviews,
      summary: result.summary,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviewsAdmin = async (req, res, next) => {
  try {
    const result = await getAllReviewsAdminService(req.query);
    res.status(200).json({
      success: true,
      data: result.reviews,
      pagination: result.pagination,
      stats: result.stats,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewStatus = async (req, res, next) => {
  try {
    const review = await updateReviewStatusService(req.params.id, req.body.status);
    res.status(200).json({
      success: true,
      message: `Review status updated to ${req.body.status}`,
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReviewAdmin = async (req, res, next) => {
  try {
    const result = await deleteReviewAdminService(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
