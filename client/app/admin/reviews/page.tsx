"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  Star,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  Package,
  User,
  ImageIcon,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  useAdminReviewsQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} from "@/hooks/useReviewQueries";
import { Review } from "@/types/review";
import { DialogModal } from "@/components/ui/DialogModal";
import { RatingStars } from "@/components/ui/RatingStars";
import { ConfirmDeleteModal } from "../settings/components/ConfirmDeleteModal";

export default function AdminReviewsPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "pending" | "approved" | "rejected">("pending");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data, isLoading, isFetching, error, refetch } = useAdminReviewsQuery({
    status: activeTab,
    search,
    page,
    limit: 15,
  });

  const reviews = data?.reviews || [];
  const stats = data?.stats || { total: 0, pending: 0, approved: 0, rejected: 0 };
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 };

  const updateStatusMutation = useUpdateReviewStatusMutation();
  const deleteReviewMutation = useDeleteReviewMutation();

  const handleStatusChange = (review: Review, newStatus: "approved" | "rejected" | "pending") => {
    updateStatusMutation.mutate(
      { id: review.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Review ${newStatus === "approved" ? "approved" : newStatus === "rejected" ? "rejected" : "moved to pending"}`);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update review status");
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingReview) return;
    deleteReviewMutation.mutate(deletingReview.id, {
      onSuccess: () => {
        toast.success("Review deleted");
        setDeletingReview(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete review");
      },
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-maroon-900">Review Moderation</h1>
          <p className="text-xs sm:text-sm text-maroon-700 mt-1">
            Review, approve, or reject customer feedback across your products.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white border border-maroon-200 text-maroon-900 rounded-xl text-xs font-semibold hover:bg-maroon-50 transition-all shadow-xs cursor-pointer disabled:opacity-60 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin text-maroon-700" : "text-maroon-800"}`} />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-maroon-600 block uppercase tracking-wider">Total</span>
            <span className="text-xl font-bold font-serif text-maroon-900 mt-0.5 block">{stats.total}</span>
          </div>
          <div className="p-2.5 bg-maroon-50 border border-maroon-200/80 rounded-xl text-maroon-800">
            <Star className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 block uppercase tracking-wider">Pending</span>
            <span className="text-xl font-bold font-serif text-amber-900 mt-0.5 block">{stats.pending}</span>
          </div>
          <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider">Approved</span>
            <span className="text-xl font-bold font-serif text-emerald-900 mt-0.5 block">{stats.approved}</span>
          </div>
          <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-red-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-red-700 block uppercase tracking-wider">Rejected</span>
            <span className="text-xl font-bold font-serif text-red-900 mt-0.5 block">{stats.rejected}</span>
          </div>
          <div className="p-2.5 bg-red-50 border border-red-200/80 rounded-xl text-red-700">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-maroon-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-maroon-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search reviewer name or review text..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3.5 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
          />
        </div>

        <div className="flex items-center space-x-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: "pending", label: "Pending", count: stats.pending },
            { id: "approved", label: "Approved", count: stats.approved },
            { id: "rejected", label: "Rejected", count: stats.rejected },
            { id: "ALL", label: "All Reviews", count: stats.total },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center space-x-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-maroon-900 text-white shadow-xs"
                  : "bg-off-white text-maroon-800 hover:bg-maroon-100 border border-maroon-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 text-[10px] font-mono rounded-md font-bold ${
                activeTab === tab.id ? "bg-white/20 text-cream" : "bg-maroon-200/80 text-maroon-900"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
            <p className="text-xs font-medium">Loading customer reviews...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-maroon-900 space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="font-serif font-bold text-base">Failed to load reviews</p>
            <p className="text-xs text-maroon-700">{error.message || "An error occurred while fetching reviews."}</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Star className="w-12 h-12 text-maroon-300 mx-auto" />
            <p className="font-serif font-bold text-base text-maroon-900">No Reviews Found</p>
            <p className="text-xs text-maroon-600 max-w-sm mx-auto">
              {search ? "No reviews match your search keywords." : "There are currently no reviews in this category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-maroon-900 font-sans">
              <thead className="bg-maroon-900 text-white font-serif uppercase tracking-wider text-[11px] border-b border-maroon-800">
                <tr>
                  <th className="py-3.5 px-5 font-semibold">Product</th>
                  <th className="py-3.5 px-5 font-semibold">Reviewer</th>
                  <th className="py-3.5 px-5 font-semibold">Rating</th>
                  <th className="py-3.5 px-5 font-semibold min-w-[280px]">Review Content</th>
                  <th className="py-3.5 px-5 font-semibold">Date</th>
                  <th className="py-3.5 px-5 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 bg-white">
                {reviews.map((rev) => {
                  const productObj = typeof rev.productId === "object" ? rev.productId : null;
                  const userObj = typeof rev.userId === "object" ? rev.userId : null;

                  return (
                    <tr key={rev.id} className="hover:bg-maroon-50/50 transition-colors">
                      <td className="py-4 px-5 align-top">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-off-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                            {productObj?.images?.[0] ? (
                              <Image
                                src={productObj.images[0]}
                                alt={productObj.name || "Product"}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-maroon-400" />
                            )}
                          </div>
                          <div className="space-y-0.5 max-w-[160px]">
                            <h4 className="font-bold text-xs text-maroon-900 line-clamp-2">
                              {productObj?.name || "Unknown Product"}
                            </h4>
                            {productObj?.code && (
                              <span className="text-[10px] font-mono text-maroon-500 block">
                                #{productObj.code}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top">
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-maroon-900 block">{rev.customerName}</span>
                          {Boolean(rev.userId) ? (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                              <User className="w-3 h-3" />
                              <span>Verified User</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-maroon-500 block">Guest</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top whitespace-nowrap">
                        <div className="space-y-1">
                          <RatingStars rating={rev.rating} />
                          <span className="text-[11px] font-bold font-mono text-maroon-700 block">
                            {rev.rating} / 5 Stars
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5 align-top space-y-2">
                        <p className="text-xs text-maroon-900 leading-relaxed font-sans bg-off-white/80 p-2.5 rounded-lg border border-maroon-100">
                          "{rev.description}"
                        </p>

                        {rev.imageUrl && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setPreviewImage(rev.imageUrl!)}
                              className="inline-flex items-center space-x-1.5 text-[11px] text-maroon-800 font-semibold bg-white border border-maroon-200 px-2 py-0.5 rounded-md hover:bg-maroon-50 transition-all cursor-pointer shadow-2xs"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-maroon-600" />
                              <span>View Attached Photo</span>
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-5 align-top whitespace-nowrap text-[11px] text-maroon-600 font-mono">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      <td className="py-4 px-5 align-top text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                          rev.status === "approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : rev.status === "rejected"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}>
                          {rev.status}
                        </span>
                      </td>

                      <td className="py-4 px-5 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-1.5">
                          {rev.status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(rev, "approved")}
                              disabled={updateStatusMutation.isPending}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Approve Review"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {rev.status !== "rejected" && (
                            <button
                              onClick={() => handleStatusChange(rev, "rejected")}
                              disabled={updateStatusMutation.isPending}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Reject Review"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {rev.status !== "pending" && (
                            <button
                              onClick={() => handleStatusChange(rev, "pending")}
                              disabled={updateStatusMutation.isPending}
                              className="p-1.5 text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Reset to Pending"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeletingReview(rev)}
                            disabled={deleteReviewMutation.isPending}
                            className="p-1.5 text-red-600 hover:bg-red-50 border border-maroon-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                            title="Delete Review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 bg-off-white/50 border-t border-maroon-100 flex items-center justify-between">
            <span className="text-xs text-maroon-700 font-medium">
              Showing page <span className="font-bold text-maroon-900 font-mono">{pagination.page}</span> of{" "}
              <span className="font-bold text-maroon-900 font-mono">{pagination.totalPages}</span> ({pagination.total} total reviews)
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

      <ConfirmDeleteModal
        isOpen={Boolean(deletingReview)}
        onClose={() => setDeletingReview(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Review"
        description={`Are you sure you want to delete the review by "${deletingReview?.customerName}"? This action cannot be undone.`}
        isDeleting={deleteReviewMutation.isPending}
      />

      <DialogModal
        isOpen={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        title="Review Photo Attachment"
      >
        {previewImage && (
          <div className="space-y-4">
            <div className="w-full h-80 relative rounded-xl overflow-hidden border border-maroon-100 bg-black/5 flex items-center justify-center">
              <Image src={previewImage} alt="Review attachment" fill sizes="(max-width: 768px) 100vw, 800px" className="object-contain" />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 bg-maroon-900 text-white rounded-xl text-xs font-semibold hover:bg-maroon-800 transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </DialogModal>
    </div>
  );
}
