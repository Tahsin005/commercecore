"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Star,
  MessageSquarePlus,
  ImageIcon,
  UploadCloud,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProductReviewsQuery, useCreateReviewMutation } from "@/hooks/useReviewQueries";
import { useUploadImageMutation } from "@/hooks/useUploadMutation";
import { DialogModal } from "@/components/ui/DialogModal";
import { RatingStars } from "@/components/ui/RatingStars";

interface ProductReviewsSectionProps {
  productId: string;
}

export function ProductReviewsSection({ productId }: ProductReviewsSectionProps) {
  const { user } = useAuth();
  const [page, setPage] = useState<number>(1);
  const { data, isLoading } = useProductReviewsQuery(productId, page);
  const createReviewMutation = useCreateReviewMutation();
  const uploadImageMutation = useUploadImageMutation();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isWriteModalOpen, setIsWriteModalOpen] = useState<boolean>(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const handleCloseWriteModal = useCallback(() => {
    setIsWriteModalOpen(false);
  }, []);

  const handleClosePreviewModal = useCallback(() => {
    setPreviewModalImage(null);
  }, []);

  const reviews = data?.reviews || [];
  const summary = data?.summary || { averageRating: 0, totalReviews: 0, starCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const pagination = data?.pagination || { total: 0, page: 1, limit: 20, totalPages: 0 };

  const openWriteModal = () => {
    setRating(5);
    setCustomerName(user?.name || "");
    setDescription("");
    setImageUrl("");
    setIsWriteModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
      return;
    }

    uploadImageMutation.mutate(file, {
      onSuccess: (res) => {
        if (res?.data?.url) {
          setImageUrl(res.data.url);
          toast.success("Photo attached successfully!");
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to upload photo");
      },
    });
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!description.trim()) {
      toast.error("Please enter a review description");
      return;
    }

    createReviewMutation.mutate(
      {
        productId,
        customerName: customerName.trim(),
        rating,
        description: description.trim(),
        imageUrl: imageUrl.trim() || null,
      },
      {
        onSuccess: () => {
          toast.success("Thank you! Your review has been submitted for moderation.");
          setIsWriteModalOpen(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to submit review");
        },
      }
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 sm:p-8 space-y-8 mt-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-maroon-100 pb-6">
        <div>
          <h2 className="font-serif font-bold text-2xl text-maroon-900">Customer Reviews &amp; Ratings</h2>
          <p className="text-xs text-maroon-700 mt-1">
            Real feedback from verified buyers and shoppers.
          </p>
        </div>

        <button
          type="button"
          onClick={openWriteModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <MessageSquarePlus className="w-4 h-4 text-cream" />
          <span>Write a Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-off-white/60 rounded-2xl p-6 border border-maroon-100 items-center">
        <div className="md:col-span-4 text-center md:border-r md:border-maroon-200/60 md:pr-6 space-y-2">
          <span className="text-4xl font-bold font-mono text-maroon-900 block">
            {summary.averageRating.toFixed(1)}
          </span>
          <div className="flex justify-center">
            <RatingStars rating={summary.averageRating} sizeClass="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-maroon-700 block">
            Based on {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className="md:col-span-8 space-y-2">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = summary.starCounts[star as keyof typeof summary.starCounts] || 0;
            const percentage = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;

            return (
              <div key={star} className="flex items-center space-x-3 text-xs">
                <span className="font-semibold text-maroon-900 w-8 flex items-center justify-end space-x-1 shrink-0 font-mono">
                  <span>{star}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 inline" />
                </span>
                <div className="flex-1 h-2.5 bg-maroon-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-maroon-700 w-8 font-mono text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-maroon-100 rounded-xl space-y-3 bg-off-white/40">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-maroon-200/70 rounded" />
                <div className="h-4 w-20 bg-maroon-100/70 rounded" />
              </div>
              <div className="h-3 w-5/6 bg-maroon-100/60 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 text-center bg-off-white/40 rounded-xl border border-dashed border-maroon-200 space-y-2">
          <MessageSquarePlus className="w-8 h-8 text-maroon-300 mx-auto" />
          <h4 className="font-serif font-bold text-sm text-maroon-900">No reviews yet</h4>
          <p className="text-xs text-maroon-700">Be the first customer to share your thoughts on this product!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-maroon-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800 font-bold text-xs uppercase">
                      {rev.customerName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-xs text-maroon-900">{rev.customerName}</h4>
                        {rev.userId && (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified Buyer</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-maroon-500 font-mono block">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <RatingStars rating={rev.rating} />
                </div>

                <p className="text-xs text-maroon-800 font-sans leading-relaxed pl-10">
                  &quot;{rev.description}&quot;
                </p>

                {rev.imageUrl && (
                  <div className="pl-10 pt-1">
                    <button
                      type="button"
                      onClick={() => setPreviewModalImage(rev.imageUrl!)}
                      className="inline-flex items-center space-x-1.5 text-xs text-maroon-800 font-semibold bg-off-white border border-maroon-200 px-2.5 py-1 rounded-md hover:bg-maroon-50 transition-all cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-maroon-600" />
                      <span>View Customer Photo</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-maroon-100 text-xs">
              <span className="text-maroon-700">
                Page <span className="font-bold font-mono text-maroon-900">{pagination.page}</span> of{" "}
                <span className="font-bold font-mono text-maroon-900">{pagination.totalPages}</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-maroon-200 text-maroon-800 rounded-lg text-xs font-semibold hover:bg-maroon-50 transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  Previous
                </button>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-maroon-200 text-maroon-800 rounded-lg text-xs font-semibold hover:bg-maroon-50 transition-all disabled:opacity-40 cursor-pointer shadow-2xs"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <DialogModal
        isOpen={isWriteModalOpen}
        onClose={handleCloseWriteModal}
        title="Write a Customer Review"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1.5">Your Rating *</label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                  aria-pressed={star === rating}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-maroon-200"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold font-mono text-maroon-800 ml-2">
                {hoverRating || rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Your Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahat Ahmed"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Your Review *</label>
            <textarea
              required
              rows={4}
              placeholder="Share what you liked or disliked about this product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-maroon-700 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-maroon-900 mb-1">Attach Photo (Optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            {imageUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-maroon-200 group">
                <Image src={imageUrl} alt="Review attachment" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full shadow hover:bg-red-700 cursor-pointer"
                  title="Remove Photo"
                >
                  &times;
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadImageMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 border border-dashed border-maroon-300 rounded-xl bg-off-white/60 hover:bg-off-white transition-all flex items-center justify-center space-x-2 text-xs text-maroon-800 font-semibold cursor-pointer disabled:opacity-60"
              >
                {uploadImageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-maroon-700" />
                    <span>Uploading Photo...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 text-maroon-700" />
                    <span>Upload Product Photo</span>
                  </>
                )}
              </button>
            )}
          </div>

          <div className="pt-2 flex justify-end space-x-2 border-t border-maroon-100">
            <button
              type="button"
              onClick={handleCloseWriteModal}
              className="px-4 py-2 border border-maroon-200 text-maroon-800 text-xs font-semibold rounded-xl hover:bg-maroon-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createReviewMutation.isPending}
              className="px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-60 flex items-center space-x-1.5"
            >
              {createReviewMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-cream" />}
              <span>Submit Review</span>
            </button>
          </div>
        </form>
      </DialogModal>

      <DialogModal
        isOpen={Boolean(previewModalImage)}
        onClose={handleClosePreviewModal}
        title="Customer Photo"
      >
        {previewModalImage && (
          <div className="space-y-4">
            <div className="w-full h-80 relative rounded-xl overflow-hidden border border-maroon-100 bg-black/5 flex items-center justify-center">
              <Image src={previewModalImage} alt="Customer photo" fill className="object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleClosePreviewModal}
                className="px-4 py-2 bg-maroon-900 text-white rounded-xl text-xs font-semibold hover:bg-maroon-800 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </DialogModal>
    </div>
  );
}
