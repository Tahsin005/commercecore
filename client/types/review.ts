export interface Review {
  id: string;
  productId: string | { id: string; name: string; slug: string; code?: string; images?: string[] };
  customerName: string;
  userId?: string | { id: string; name: string; email: string } | null;
  rating: number;
  description: string;
  imageUrl?: string | null;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  starCounts: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewInput {
  productId: string;
  customerName: string;
  rating: number;
  description: string;
  imageUrl?: string | null;
}

export interface ReviewAdminQuery {
  productId?: string;
  status?: "pending" | "approved" | "rejected" | "ALL";
  search?: string;
  page?: number;
  limit?: number;
}

export interface ReviewAdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}
