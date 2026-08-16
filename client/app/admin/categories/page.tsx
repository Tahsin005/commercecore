"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Tag,
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  ImageIcon,
  UploadCloud,
} from "lucide-react";

import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  Category,
} from "@/hooks/useCategoryQueries";
import { useUploadImageMutation } from "@/hooks/useUploadMutation";
import { categorySchema, CategoryInput } from "@/lib/validations/category";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export default function AdminCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFeatured, setFilterFeatured] = useState<"all" | "featured" | "standard">("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const fileInputRefCreate = useRef<HTMLInputElement>(null);
  const fileInputRefEdit = useRef<HTMLInputElement>(null);

  // Queries & Mutations
  const { data: response, isLoading, error, refetch } = useCategoriesQuery();
  const categories = response?.data || [];

  const createMutation = useCreateCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();
  const uploadMutation = useUploadImageMutation();

  const createForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      isFeatured: false,
      imageUrl: "",
    },
  });

  const editForm = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
  });

  const handleOpenCreateModal = () => {
    createForm.reset({ name: "", slug: "", isFeatured: false, imageUrl: "" });
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    editForm.reset({
      name: cat.name,
      slug: cat.slug,
      isFeatured: cat.isFeatured || false,
      imageUrl: cat.imageUrl || "",
    });
  };

  const handleImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "create" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const inputTarget = e.currentTarget;
    const editingCategoryId = editingCategory?.id;

    uploadMutation.mutate(file, {
      onSuccess: (res) => {
        if (formType === "create" && !isCreateModalOpen) return;
        if (formType === "edit" && (!editingCategory || editingCategory.id !== editingCategoryId)) return;

        const uploadedUrl = res.data.url;
        if (formType === "create") {
          createForm.setValue("imageUrl", uploadedUrl, { shouldValidate: true });
        } else {
          editForm.setValue("imageUrl", uploadedUrl, { shouldValidate: true });
        }
        toast.success("Category image uploaded successfully!");
      },
      onError: (err) => {
        if (formType === "create" && !isCreateModalOpen) return;
        if (formType === "edit" && (!editingCategory || editingCategory.id !== editingCategoryId)) return;
        toast.error(err.message || "Failed to upload category image");
      },
    });

    inputTarget.value = "";
  };

  const onCreateSubmit = (data: CategoryInput) => {
    const payload = {
      name: data.name.trim(),
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      isFeatured: data.isFeatured,
      imageUrl: data.imageUrl || "",
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Category "${res.data.name}" created successfully!`);
        setIsCreateModalOpen(false);
        createForm.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create category");
      },
    });
  };

  const onEditSubmit = (data: CategoryInput) => {
    if (!editingCategory) return;

    const payload = {
      id: editingCategory.id,
      name: data.name.trim(),
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      isFeatured: data.isFeatured,
      imageUrl: data.imageUrl || "",
    };

    updateMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Category "${res.data.name}" updated successfully!`);
        setEditingCategory(null);
        editForm.reset();
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update category");
      },
    });
  };

  const handleToggleFeatured = (cat: Category) => {
    const nextFeaturedState = !cat.isFeatured;
    updateMutation.mutate(
      {
        id: cat.id,
        isFeatured: nextFeaturedState,
      },
      {
        onSuccess: () => {
          toast.success(
            nextFeaturedState
              ? `"${cat.name}" is now featured!`
              : `"${cat.name}" removed from featured categories.`
          );
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update category status");
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingCategory) return;

    deleteMutation.mutate(deletingCategory.id, {
      onSuccess: () => {
        toast.success(`Category "${deletingCategory.name}" deleted successfully!`);
        setDeletingCategory(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete category");
      },
    });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.slug.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterFeatured === "featured") return cat.isFeatured === true;
      if (filterFeatured === "standard") return !cat.isFeatured;

      return true;
    });
  }, [categories, searchQuery, filterFeatured]);

  const featuredCount = useMemo(() => categories.filter((c) => c.isFeatured).length, [categories]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-maroon-800">
            <Tag className="w-5 h-5 text-maroon-700" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900">Category Management</h1>
          </div>
          <p className="text-xs text-maroon-700 mt-1">
            Organize store catalog items, manage URL slugs, upload category images, and highlight featured categories.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-cream" />
          <span>Add New Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Total Categories
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isLoading ? "..." : categories.length}
            </span>
          </div>
          <div className="p-3 bg-maroon-50 border border-maroon-200/80 rounded-xl text-maroon-800">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Featured Homepage Categories
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isLoading ? "..." : featuredCount}
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-700">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-maroon-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search category name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as any)}
            className="py-2 px-3 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            <option value="featured">Featured Only</option>
            <option value="standard">Standard Only</option>
          </select>

          <button
            onClick={() => refetch()}
            className="p-2 bg-off-white hover:bg-maroon-100 text-maroon-800 rounded-xl border border-maroon-200 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
            <p className="text-xs font-medium">Loading catalog categories...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-maroon-900 space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="font-serif font-bold text-base">Failed to load categories</p>
            <p className="text-xs text-maroon-700">{error.message || "An error occurred while fetching categories."}</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-12 text-center text-maroon-700 space-y-3">
            <Tag className="w-12 h-12 text-maroon-300 mx-auto" />
            <p className="font-serif font-bold text-base text-maroon-900">No Categories Found</p>
            <p className="text-xs text-maroon-600">
              {searchQuery || filterFeatured !== "all"
                ? "No categories match your search filters."
                : "No categories created yet. Click 'Add New Category' to start."}
            </p>
            {(searchQuery || filterFeatured !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterFeatured("all");
                }}
                className="px-4 py-2 bg-maroon-100 text-maroon-900 text-xs font-semibold rounded-lg hover:bg-maroon-200 transition-colors cursor-pointer"
              >
                Clear Search &amp; Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-maroon-900 font-sans">
              <thead className="bg-maroon-900 text-white font-serif uppercase tracking-wider text-[11px] border-b border-maroon-800">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Image</th>
                  <th className="py-3.5 px-6 font-semibold">Category Name</th>
                  <th className="py-3.5 px-6 font-semibold">Slug</th>
                  <th className="py-3.5 px-6 font-semibold text-center">Featured Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 bg-white">
                {filteredCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-maroon-50/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-off-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                        {cat.imageUrl ? (
                          <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-maroon-400" />
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-bold text-sm text-maroon-900">
                      <div className="flex items-center space-x-2">
                        <span>{cat.name}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-maroon-700">
                      <span className="bg-off-white px-2 py-1 rounded-md">
                        {cat.slug}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleFeatured(cat)}
                        className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-xs ${
                          cat.isFeatured
                            ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                            : "bg-off-white text-maroon-600 border-maroon-200 hover:bg-maroon-100"
                        }`}
                        title="Click to toggle featured status"
                      >
                        <Star className={`w-3.5 h-3.5 ${cat.isFeatured ? "fill-amber-500 text-amber-600" : ""}`} />
                        <span>{cat.isFeatured ? "Featured" : "Standard"}</span>
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingCategory(cat)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-5 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-maroon-900">Add New Category</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-maroon-500 hover:text-maroon-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Category Image
                </label>

                <input
                  type="file"
                  ref={fileInputRefCreate}
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e, "create")}
                  className="hidden"
                />

                {createForm.watch("imageUrl") ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-maroon-200 bg-off-white flex items-center justify-center group">
                    <Image
                      src={createForm.watch("imageUrl") || ""}
                      alt="Category Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => createForm.setValue("imageUrl", "", { shouldValidate: true })}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-all shadow-md cursor-pointer"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefCreate.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full h-28 border-2 border-dashed border-maroon-200 hover:border-maroon-700 bg-off-white/80 hover:bg-white rounded-xl flex flex-col items-center justify-center space-y-1 text-maroon-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-maroon-700" />
                        <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-maroon-600" />
                        <span className="text-xs font-semibold">Click to upload image</span>
                        <span className="text-[10px] text-maroon-500">Supports JPG, JPEG, PNG, GIF, WEBP</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Traditional Panjabi"
                  {...createForm.register("name")}
                  onChange={(e) => {
                    createForm.setValue("name", e.target.value);
                    createForm.setValue("slug", slugify(e.target.value));
                  }}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm placeholder-maroon-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                />
                {createForm.formState.errors.name && (
                  <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  URL Slug (Auto-generated)
                </label>
                <input
                  type="text"
                  placeholder="traditional-panjabi"
                  {...createForm.register("slug")}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-xs font-mono placeholder-maroon-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                />
                <p className="text-[11px] text-maroon-500 mt-1">
                  Preview URL: <span className="font-mono font-bold text-maroon-800">/product?category={createForm.watch("slug") || "slug"}</span>
                </p>
              </div>

              <div className="pt-1 flex items-center space-x-2.5">
                <input
                  id="create-featured"
                  type="checkbox"
                  {...createForm.register("isFeatured")}
                  className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700 cursor-pointer"
                />
                <label htmlFor="create-featured" className="text-xs font-semibold text-maroon-900 cursor-pointer">
                  Feature on Store Homepage Filter Tabs
                </label>
              </div>

              <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || uploadMutation.isPending}
                  className="px-5 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingCategory(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-5 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-maroon-900">Edit Category</h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1 text-maroon-500 hover:text-maroon-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Category Image
                </label>

                <input
                  type="file"
                  ref={fileInputRefEdit}
                  accept="image/*"
                  onChange={(e) => handleImageFileChange(e, "edit")}
                  className="hidden"
                />

                {editForm.watch("imageUrl") ? (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border border-maroon-200 bg-off-white flex items-center justify-center group">
                    <Image
                      src={editForm.watch("imageUrl") || ""}
                      alt="Category Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => editForm.setValue("imageUrl", "", { shouldValidate: true })}
                      className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-all shadow-md cursor-pointer"
                      title="Remove Image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRefEdit.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full h-28 border-2 border-dashed border-maroon-200 hover:border-maroon-700 bg-off-white/80 hover:bg-white rounded-xl flex flex-col items-center justify-center space-y-1 text-maroon-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-maroon-700" />
                        <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-maroon-600" />
                        <span className="text-xs font-semibold">Click to upload image</span>
                        <span className="text-[10px] text-maroon-500">Supports JPG, JPEG, PNG, GIF, WEBP</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Category Name *
                </label>
                <input
                  type="text"
                  {...editForm.register("name")}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                />
                {editForm.formState.errors.name && (
                  <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  {...editForm.register("slug")}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-xs font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                />
              </div>

              <div className="pt-1 flex items-center space-x-2.5">
                <input
                  id="edit-featured"
                  type="checkbox"
                  {...editForm.register("isFeatured")}
                  className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700 cursor-pointer"
                />
                <label htmlFor="edit-featured" className="text-xs font-semibold text-maroon-900 cursor-pointer">
                  Feature on Store Homepage Filter Tabs
                </label>
              </div>

              <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending || uploadMutation.isPending}
                  className="px-5 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingCategory(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 p-6 space-y-4 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">Delete Category</h3>
            </div>

            <p className="text-xs text-maroon-700 leading-relaxed font-sans">
              Are you sure you want to delete the category{" "}
              <strong className="text-maroon-900 font-semibold">&quot;{deletingCategory.name}&quot;</strong>?
              This action cannot be undone.
            </p>

            <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Category</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
