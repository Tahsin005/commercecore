"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, UploadCloud, Loader2 } from "lucide-react";
import {
  useAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  BannerItem,
} from "@/hooks/useCmsQueries";
import { useUploadImageMutation } from "@/hooks/useUploadMutation";
import { bannerFormSchema, BannerFormInput } from "@/lib/validations/settings";
import { DialogModal } from "@/components/ui/DialogModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export function BannersTab() {
  const { data: banners = [], isLoading } = useAdminBannersQuery();
  const createBannerMut = useCreateBannerMutation();
  const updateBannerMut = useUpdateBannerMutation();
  const deleteBannerMut = useDeleteBannerMutation();
  const uploadImageMutation = useUploadImageMutation();

  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<BannerItem | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BannerFormInput>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: { imageUrl: "", title: "", sortOrder: 0 },
  });

  const bannerImageUrl = watch("imageUrl");

  const openCreateModal = () => {
    setEditingBanner(null);
    reset({ imageUrl: "", title: "", sortOrder: banners.length + 1 });
    setBannerModalOpen(true);
  };

  const openEditModal = (b: BannerItem) => {
    setEditingBanner(b);
    reset({ imageUrl: b.imageUrl, title: b.title || "", sortOrder: b.sortOrder });
    setBannerModalOpen(true);
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (uploadImageMutation.isPending) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP image formats are supported");
      e.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Image size must not exceed 10MB");
      e.target.value = "";
      return;
    }

    uploadImageMutation.mutate(file, {
      onSuccess: (res) => {
        setValue("imageUrl", res.data.url, { shouldValidate: true });
        toast.success("Banner image uploaded successfully!");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to upload banner image");
      },
    });
    e.target.value = "";
  };

  const onSubmit = (data: BannerFormInput) => {
    const payload = {
      imageUrl: data.imageUrl,
      title: data.title,
      sortOrder: Number.isNaN(data.sortOrder) ? 0 : data.sortOrder,
    };

    if (editingBanner) {
      updateBannerMut.mutate(
        { id: editingBanner.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Banner updated!");
            setBannerModalOpen(false);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to update banner");
          },
        }
      );
    } else {
      createBannerMut.mutate(
        { ...payload, isActive: true },
        {
          onSuccess: () => {
            toast.success("Banner created!");
            setBannerModalOpen(false);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to create banner");
          },
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingBanner) return;
    deleteBannerMut.mutate(deletingBanner.id, {
      onSuccess: () => {
        toast.success("Banner deleted");
        setDeletingBanner(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete banner");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
          <div className="space-y-2">
            <div className="h-5 w-48 bg-maroon-200/70 rounded-md" />
            <div className="h-3 w-64 bg-maroon-100/60 rounded" />
          </div>
          <div className="h-9 w-28 bg-maroon-200/70 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-maroon-100 rounded-xl p-3 space-y-2 bg-off-white/40">
              <div className="h-36 w-full bg-maroon-100/70 rounded-lg" />
              <div className="h-3 w-32 bg-maroon-200/60 rounded" />
              <div className="flex items-center justify-between pt-1">
                <div className="h-4 w-16 bg-maroon-100/70 rounded" />
                <div className="h-4 w-12 bg-maroon-100/70 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-maroon-900">Homepage Slider Banners</h2>
          <p className="text-xs text-maroon-700">Add banner images for the homepage hero carousel.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-maroon-900 hover:bg-maroon-950 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.map((b) => (
          <div key={b.id} className="border border-maroon-100 rounded-xl overflow-hidden bg-off-white/40 space-y-2 p-3">
            <div className="relative h-36 w-full bg-maroon-100 rounded-lg overflow-hidden border border-maroon-200">
              <img src={b.imageUrl} alt={b.title || "Banner"} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-xs text-maroon-900 truncate">{b.title || "Untitled Banner"}</h4>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="bg-maroon-100 text-maroon-900 px-2 py-0.5 rounded font-mono font-bold">Order: {b.sortOrder}</span>
                <div className="flex items-center space-x-2">
                  <button onClick={() => openEditModal(b)} className="text-maroon-700 hover:text-maroon-900 cursor-pointer">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingBanner(b)}
                    className="text-red-600 hover:text-red-800 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DialogModal
        isOpen={bannerModalOpen}
        onClose={() => setBannerModalOpen(false)}
        title={editingBanner ? "Edit Homepage Banner" : "Add Homepage Banner"}
      >
        <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
          <h3 id="dialog-title" className="font-serif font-bold text-lg text-maroon-900">
            {editingBanner ? "Edit Homepage Banner" : "Add Homepage Banner"}
          </h3>
          <button onClick={() => setBannerModalOpen(false)} className="text-maroon-500 hover:text-maroon-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-maroon-900 mb-1.5">Banner Image (Cloudinary Upload) *</label>
            <input
              type="file"
              ref={bannerFileInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleBannerImageUpload}
              disabled={uploadImageMutation.isPending}
              className="hidden"
            />

            {bannerImageUrl ? (
              <div className="relative h-40 w-full rounded-xl overflow-hidden border border-maroon-200 group bg-maroon-50">
                <img src={bannerImageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    disabled={uploadImageMutation.isPending}
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white text-maroon-900 font-semibold text-xs rounded-lg shadow-sm hover:bg-maroon-50 cursor-pointer flex items-center space-x-1 disabled:opacity-50"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Change Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("imageUrl", "", { shouldValidate: true })}
                    className="px-3 py-1.5 bg-red-600 text-white font-semibold text-xs rounded-lg shadow-sm hover:bg-red-700 cursor-pointer flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => !uploadImageMutation.isPending && bannerFileInputRef.current?.click()}
                className={`border-2 border-dashed border-maroon-200 hover:border-maroon-700 bg-off-white hover:bg-maroon-50/50 rounded-xl p-6 text-center transition-all space-y-2 flex flex-col items-center justify-center ${
                  uploadImageMutation.isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                }`}
              >
                {uploadImageMutation.isPending ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
                    <p className="text-xs font-semibold text-maroon-800">Uploading image to Cloudinary...</p>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-maroon-900">Click to upload banner image</p>
                      <p className="text-[11px] text-maroon-600 mt-0.5">JPG, PNG, WebP up to 10MB</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="mt-2">
              <input
                type="text"
                {...register("imageUrl")}
                placeholder="Or paste direct image URL (https://...)"
                className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono placeholder:text-maroon-400"
              />
              {errors.imageUrl && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.imageUrl.message}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-maroon-900 mb-1">Banner Title (Optional)</label>
            <input
              type="text"
              {...register("title")}
              placeholder="e.g. Summer Eid Collection Sale"
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-maroon-900 mb-1">Sort Order</label>
            <input
              type="number"
              {...register("sortOrder", { valueAsNumber: true })}
              className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono"
            />
            {errors.sortOrder && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.sortOrder.message}</p>}
          </div>

          <button
            type="submit"
            disabled={uploadImageMutation.isPending || createBannerMut.isPending || updateBannerMut.isPending}
            className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-950 text-white font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {(createBannerMut.isPending || updateBannerMut.isPending) && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
            <span>{editingBanner ? "Save Changes" : "Create Banner"}</span>
          </button>
        </form>
      </DialogModal>

      <ConfirmDeleteModal
        isOpen={!!deletingBanner}
        onClose={() => setDeletingBanner(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Banner"
        description={`Are you sure you want to delete banner "${deletingBanner?.title || 'Untitled'}"?`}
        isDeleting={deleteBannerMut.isPending}
      />
    </div>
  );
}
