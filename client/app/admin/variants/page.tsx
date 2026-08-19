"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  SlidersHorizontal,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowUpDown,
} from "lucide-react";

import {
  useGlobalVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  ProductVariant,
} from "@/hooks/useProductQueries";
import { variantSchema, VariantInput } from "@/lib/validations/product";

export default function AdminVariantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy] = useState<"order" | "label">("order");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null);

  // Queries & Mutations
  const { data: response, isLoading, error, refetch, isFetching } = useGlobalVariantsQuery(true);
  const variants = response?.data || [];

  const createMutation = useCreateVariantMutation();
  const updateMutation = useUpdateVariantMutation();
  const deleteMutation = useDeleteVariantMutation();

  const form = useForm<VariantInput>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      label: "",
      order: 0,
      isActive: true,
    },
  });

  const handleOpenCreateModal = () => {
    setEditingVariant(null);
    form.reset({
      label: "",
      order: variants.length > 0 ? Math.max(...variants.map((v) => v.order || 0)) + 1 : 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (variant: ProductVariant) => {
    setEditingVariant(variant);
    form.reset({
      label: variant.label || variant.size || "",
      order: variant.order ?? 0,
      isActive: variant.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVariant(null);
    form.reset();
  };

  const onSubmit = async (data: VariantInput) => {
    try {
      if (editingVariant) {
        await updateMutation.mutateAsync({
          id: editingVariant.id,
          label: data.label.trim(),
          order: data.order ?? 0,
          isActive: data.isActive !== false,
        });
        toast.success("Variant updated successfully!");
      } else {
        await createMutation.mutateAsync({
          label: data.label.trim(),
          order: data.order ?? 0,
          isActive: data.isActive !== false,
        });
        toast.success("New variant created successfully!");
      }
      handleCloseModal();
    } catch (err: any) {
      toast.error(err.message || "Failed to save variant");
    }
  };

  const handleToggleActive = async (variant: ProductVariant) => {
    try {
      const nextActive = variant.isActive === false;
      await updateMutation.mutateAsync({
        id: variant.id,
        isActive: nextActive,
      });
      toast.success(`Variant marked as ${nextActive ? "Active" : "Inactive"}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle variant status");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingVariant) return;
    try {
      await deleteMutation.mutateAsync(deletingVariant.id);
      toast.success("Variant deleted successfully!");
      setDeletingVariant(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete variant");
    }
  };

  // Metrics
  const totalVariants = variants.length;
  const activeVariants = useMemo(() => variants.filter((v) => v.isActive !== false).length, [variants]);
  const inactiveVariants = totalVariants - activeVariants;
  const maxOrder = useMemo(() => (variants.length > 0 ? Math.max(...variants.map((v) => v.order || 0)) : 0), [variants]);

  // Filtered & Sorted variants
  const filteredVariants = useMemo(() => {
    return variants
      .filter((v) => {
        const label = (v.label || v.size || "").toLowerCase();
        const matchesQuery = label.includes(searchQuery.toLowerCase().trim());
        const matchesStatus =
          filterStatus === "all"
            ? true
            : filterStatus === "active"
            ? v.isActive !== false
            : v.isActive === false;
        return matchesQuery && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "order") {
          const orderA = a.order ?? 0;
          const orderB = b.order ?? 0;
          return sortOrder === "asc" ? orderA - orderB : orderB - orderA;
        } else {
          const labelA = (a.label || a.size || "").toLowerCase();
          const labelB = (b.label || b.size || "").toLowerCase();
          return sortOrder === "asc" ? labelA.localeCompare(labelB) : labelB.localeCompare(labelA);
        }
      });
  }, [variants, searchQuery, filterStatus, sortBy, sortOrder]);

  const toggleSort = (type: "order" | "label") => {
    if (sortBy === type) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-maroon-800">
            <SlidersHorizontal className="w-5 h-5 text-maroon-700" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900">
              Age & Size Variants
            </h1>
          </div>
          <p className="text-xs text-maroon-700 mt-1">
            Configure global age groups, clothing sizes, and dimension attributes available across products
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-cream" />
          <span>Add New Variant</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Total Variants
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isLoading ? "..." : totalVariants}
            </span>
          </div>
          <div className="p-3 bg-maroon-50 border border-maroon-200/80 rounded-xl text-maroon-800">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Active In-Store
            </span>
            <span className="text-2xl font-bold font-serif text-emerald-900 mt-1 block">
              {isLoading ? "..." : activeVariants}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Inactive / Hidden
            </span>
            <span className="text-2xl font-bold font-serif text-gray-700 mt-1 block">
              {isLoading ? "..." : inactiveVariants}
            </span>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Highest Sort Order
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isLoading ? "..." : maxOrder}
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800">
            <Layers className="w-6 h-6" />
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
            placeholder="Search variant name (e.g. 2-3 Years)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-off-white/80 border border-maroon-200/80 rounded-xl text-xs text-maroon-900 placeholder-maroon-600/70 focus:outline-none focus:ring-2 focus:ring-maroon-700 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3.5 py-2 bg-off-white/80 border border-maroon-200/80 rounded-xl text-xs font-medium text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-700 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-800 rounded-xl transition-all cursor-pointer"
            title="Refresh variants"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-maroon-100 shadow-sm flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
          <p className="text-xs text-maroon-700 font-medium">Loading variants...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-12 rounded-2xl border border-red-200 shadow-sm text-center space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
          <h3 className="text-base font-serif font-bold text-maroon-900">Failed to load variants</h3>
          <p className="text-xs text-red-600 max-w-sm mx-auto">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-maroon-900 text-white text-xs font-medium rounded-xl hover:bg-maroon-800 transition-all cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      ) : filteredVariants.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-maroon-100 shadow-sm text-center space-y-3">
          <div className="w-14 h-14 bg-maroon-50 rounded-2xl flex items-center justify-center mx-auto text-maroon-800">
            <SlidersHorizontal className="w-7 h-7" />
          </div>
          <h3 className="text-base font-serif font-bold text-maroon-900">No Variants Found</h3>
          <p className="text-xs text-maroon-700 max-w-sm mx-auto">
            {searchQuery || filterStatus !== "all"
              ? "No variants matched your current search and filter criteria."
              : "No age or size variants have been configured yet. Create your first variant to get started."}
          </p>
          {searchQuery || filterStatus !== "all" ? (
            <button
              onClick={() => {
                setSearchQuery("");
                setFilterStatus("all");
              }}
              className="px-4 py-2 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 text-xs font-semibold rounded-xl border border-maroon-200 cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow cursor-pointer"
            >
              Add First Variant
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="block md:hidden space-y-3">
            {filteredVariants.map((variant) => {
              const isActive = variant.isActive !== false;
              return (
                <div
                  key={variant.id}
                  className="bg-white rounded-2xl border border-maroon-100 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-maroon-100/70 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-sm text-maroon-900">
                        {variant.label || variant.size}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-maroon-700 bg-maroon-50 border border-maroon-200 px-1.5 py-0.5 rounded">
                        #{variant.order ?? 0}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(variant)}
                      disabled={updateMutation.isPending}
                      className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-gray-100 text-gray-700 border-gray-200"
                      }`}
                    >
                      {isActive ? "Active" : "Inactive"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-maroon-600">
                      Sort sequence: <strong className="text-maroon-900 font-mono">{variant.order ?? 0}</strong>
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleOpenEditModal(variant)}
                        className="px-2.5 py-1 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeletingVariant(variant)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden md:block bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden w-full max-w-full">
            <div className="overflow-x-auto w-full max-w-full">
              <table className="w-full text-left text-xs text-maroon-900 border-collapse">
                <thead>
                  <tr className="bg-maroon-900 text-cream text-[11px] font-bold uppercase tracking-wider">
                    <th
                      onClick={() => toggleSort("order")}
                      className="py-3.5 px-4 cursor-pointer hover:bg-maroon-800 transition-colors w-24"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Order</span>
                        <ArrowUpDown className="w-3 h-3 text-cream/70" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort("label")}
                      className="py-3.5 px-4 cursor-pointer hover:bg-maroon-800 transition-colors"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Variant Label (Age / Size)</span>
                        <ArrowUpDown className="w-3 h-3 text-cream/70" />
                      </div>
                    </th>
                    <th className="py-3.5 px-4 text-center w-36">Status</th>
                    <th className="py-3.5 px-4 text-right w-36">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-maroon-100 bg-white">
                  {filteredVariants.map((variant) => {
                    const isActive = variant.isActive !== false;
                    return (
                      <tr key={variant.id} className="hover:bg-maroon-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-xs text-maroon-800">
                          <span className="inline-block bg-off-white border border-maroon-200 px-2 py-0.5 rounded-md">
                            #{variant.order ?? 0}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-bold text-sm text-maroon-900 font-mono">
                            {variant.label || variant.size}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(variant)}
                            disabled={updateMutation.isPending}
                            className={`inline-flex items-center text-[10px] font-extrabold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                              isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                            }`}
                            title="Click to toggle active status"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                isActive ? "bg-emerald-600" : "bg-gray-400"
                              }`}
                            />
                            {isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEditModal(variant)}
                              className="p-1.5 text-maroon-700 hover:text-maroon-900 hover:bg-maroon-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit Variant"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingVariant(variant)}
                              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Variant"
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
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={handleCloseModal}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-maroon-100 p-6 space-y-5 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-maroon-900">
                  {editingVariant ? "Edit Variant" : "Add New Variant"}
                </h3>
                <p className="text-xs text-maroon-700">
                  {editingVariant
                    ? `Update attribute settings for "${editingVariant.label || editingVariant.size}"`
                    : "Create a new age group or size option for product catalog"}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 text-maroon-500 hover:text-maroon-800 hover:bg-maroon-50 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900 block">
                  Variant Label / Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1-2 Years, 2-3 Years, XL, Free Size"
                  {...form.register("label")}
                  className="w-full px-3.5 py-2.5 bg-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-maroon-700"
                />
                {form.formState.errors.label && (
                  <p className="text-xs text-red-600 mt-0.5">{form.formState.errors.label.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900 block">
                  Display Sort Order
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1, 2, 3"
                  {...form.register("order", { valueAsNumber: true })}
                  className="w-full px-3.5 py-2.5 bg-white text-maroon-900 border border-maroon-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-maroon-700"
                />
                <p className="text-[11px] text-maroon-600">
                  Lower numbers display first on the storefront dropdowns and variant selectors.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="variant-active"
                  {...form.register("isActive")}
                  className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700 cursor-pointer"
                />
                <label htmlFor="variant-active" className="text-xs font-medium text-maroon-900 cursor-pointer">
                  Active (available for selection in product inventory)
                </label>
              </div>

              <div className="pt-4 border-t border-maroon-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-maroon-700 hover:text-maroon-900 hover:bg-maroon-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer disabled:opacity-60 flex items-center space-x-1.5"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{editingVariant ? "Update Variant" : "Create Variant"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingVariant(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-red-100 p-6 space-y-4 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">Delete Variant</h3>
            </div>

            <p className="text-xs text-maroon-700 leading-relaxed">
              Are you sure you want to delete the variant{" "}
              <strong className="text-maroon-900 font-semibold">&quot;{deletingVariant.label || deletingVariant.size}&quot;</strong>?
              This will remove it from future product configurations.
            </p>

            <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingVariant(null)}
                className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Variant</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
