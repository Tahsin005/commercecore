"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import {
  useAdminProductBulletsQuery,
  useCreateProductBulletMutation,
  useUpdateProductBulletMutation,
  useDeleteProductBulletMutation,
  ProductInfoBulletItem,
} from "@/hooks/useCmsQueries";
import { productBulletFormSchema, ProductBulletFormInput } from "@/lib/validations/settings";
import { DialogModal } from "@/components/ui/DialogModal";
import { ConfirmDeleteModal } from "./ConfirmDeleteModal";

export function ProductBulletsTab() {
  const { data: infoBullets = [], isLoading } = useAdminProductBulletsQuery();
  const createBulletMut = useCreateProductBulletMutation();
  const updateBulletMut = useUpdateProductBulletMutation();
  const deleteBulletMut = useDeleteProductBulletMutation();

  const [bulletModalOpen, setBulletModalOpen] = useState(false);
  const [editingBullet, setEditingBullet] = useState<ProductInfoBulletItem | null>(null);
  const [deletingBullet, setDeletingBullet] = useState<ProductInfoBulletItem | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductBulletFormInput>({
    resolver: zodResolver(productBulletFormSchema),
    defaultValues: { text: "", sortOrder: 0 },
  });

  const openCreateModal = () => {
    setEditingBullet(null);
    reset({ text: "", sortOrder: infoBullets.length + 1 });
    setBulletModalOpen(true);
  };

  const openEditModal = (bul: ProductInfoBulletItem) => {
    setEditingBullet(bul);
    reset({ text: bul.text, sortOrder: bul.sortOrder });
    setBulletModalOpen(true);
  };

  const onSubmit = (data: ProductBulletFormInput) => {
    const payload = {
      text: data.text.trim(),
      sortOrder: Number.isNaN(data.sortOrder) ? 0 : data.sortOrder,
    };

    if (editingBullet) {
      updateBulletMut.mutate(
        { id: editingBullet.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Product bullet updated!");
            setBulletModalOpen(false);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to update bullet");
          },
        }
      );
    } else {
      createBulletMut.mutate(
        { ...payload, isActive: true },
        {
          onSuccess: () => {
            toast.success("Product bullet created!");
            setBulletModalOpen(false);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to create bullet");
          },
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingBullet) return;
    deleteBulletMut.mutate(deletingBullet.id, {
      onSuccess: () => {
        toast.success("Bullet deleted");
        setDeletingBullet(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete bullet");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6 animate-pulse">
        <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
          <div className="space-y-2">
            <div className="h-5 w-44 bg-maroon-200/70 rounded-md" />
            <div className="h-3 w-64 bg-maroon-100/60 rounded" />
          </div>
          <div className="h-9 w-28 bg-maroon-200/70 rounded-xl" />
        </div>
        <div className="divide-y divide-maroon-100 border border-maroon-100 rounded-xl overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3.5 flex items-center justify-between bg-white">
              <div className="h-4 w-60 bg-maroon-100/70 rounded" />
              <div className="flex items-center space-x-3">
                <div className="h-5 w-16 bg-maroon-100/70 rounded" />
                <div className="h-4 w-4 bg-maroon-200/60 rounded" />
                <div className="h-4 w-4 bg-maroon-200/60 rounded" />
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
          <h2 className="font-serif font-bold text-lg text-maroon-900">Product Info Bullets</h2>
          <p className="text-xs text-maroon-700">Manage repeatable bullet points displayed on product detail pages.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-maroon-900 hover:bg-maroon-950 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Info Bullet</span>
        </button>
      </div>

      <div className="divide-y divide-maroon-100 border border-maroon-100 rounded-xl overflow-hidden">
        {infoBullets.map((bul) => (
          <div key={bul.id} className="p-3.5 flex items-center justify-between text-xs bg-white">
            <span className="font-medium text-maroon-900">• {bul.text}</span>
            <div className="flex items-center space-x-3">
              <span className="bg-off-white text-maroon-800 px-2 py-0.5 rounded border font-mono">Order: {bul.sortOrder}</span>
              <button onClick={() => openEditModal(bul)} className="text-maroon-700 hover:text-maroon-900 cursor-pointer">
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeletingBullet(bul)}
                className="text-red-600 hover:text-red-800 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- PRODUCT BULLET MODAL --- */}
      <DialogModal
        isOpen={bulletModalOpen}
        onClose={() => setBulletModalOpen(false)}
        title={editingBullet ? "Edit Product Bullet" : "Add Product Bullet"}
      >
        <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
          <h3 id="dialog-title" className="font-serif font-bold text-lg text-maroon-900">
            {editingBullet ? "Edit Product Bullet" : "Add Product Bullet"}
          </h3>
          <button onClick={() => setBulletModalOpen(false)} className="text-maroon-500 hover:text-maroon-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs font-sans">
          <div>
            <label className="block font-semibold text-maroon-900 mb-1">Bullet Text *</label>
            <input type="text" {...register("text")} placeholder="e.g. 100% Authentic Quality Guaranteed" className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs" />
            {errors.text && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.text.message}</p>}
          </div>
          <div>
            <label className="block font-semibold text-maroon-900 mb-1">Sort Order</label>
            <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono" />
            {errors.sortOrder && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.sortOrder.message}</p>}
          </div>
          <button type="submit" disabled={createBulletMut.isPending || updateBulletMut.isPending} className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-950 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
            {(createBulletMut.isPending || updateBulletMut.isPending) && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
            <span>Save Bullet</span>
          </button>
        </form>
      </DialogModal>

      <ConfirmDeleteModal
        isOpen={!!deletingBullet}
        onClose={() => setDeletingBullet(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product Bullet"
        description={`Are you sure you want to delete bullet "${deletingBullet?.text || 'Untitled'}"?`}
        isDeleting={deleteBulletMut.isPending}
      />
    </div>
  );
}
