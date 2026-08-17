"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Star,
  Layers,
  Check,
  SlidersHorizontal,
  ImageIcon,
  UploadCloud,
} from "lucide-react";

import {
  useProductsQuery,
  useGlobalVariantsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  Product,
  ProductVariant,
} from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";
import { useUploadImageMutation } from "@/hooks/useUploadMutation";
import { productSchema, variantSchema, ProductInput, VariantInput } from "@/lib/validations/product";

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "featured">("all");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [deletingVariant, setDeletingVariant] = useState<ProductVariant | null>(null);

  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [createVariantConfigs, setCreateVariantConfigs] = useState<Record<string, { price: string; quantity: number }>>({});
  const [editVariantConfigs, setEditVariantConfigs] = useState<Record<string, { price: string; quantity: number }>>({});
  const [createImages, setCreateImages] = useState<string[]>([]);
  const [editImages, setEditImages] = useState<string[]>([]);

  const fileInputRefCreate = useRef<HTMLInputElement>(null);
  const fileInputRefEdit = useRef<HTMLInputElement>(null);

  const { data: productsRes, isLoading: isProductsLoading, error: productsError, refetch: refetchProducts } = useProductsQuery();
  const { data: categoriesRes } = useCategoriesQuery();
  const { data: globalVariantsRes, isLoading: isVariantsLoading } = useGlobalVariantsQuery(true);

  const products = Array.isArray(productsRes?.data) ? productsRes.data : (productsRes?.data?.products || []);
  const categories = categoriesRes?.data || [];
  const globalVariants = globalVariantsRes?.data || [];

  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const uploadMutation = useUploadImageMutation();

  const createVariantMutation = useCreateVariantMutation();
  const updateVariantMutation = useUpdateVariantMutation();
  const deleteVariantMutation = useDeleteVariantMutation();

  const createForm = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      code: "",
      categoryId: null,
      description: "",
      price: 0,
      isFeatured: false,
      isActive: true,
    },
  });

  const editForm = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
  });

  const variantForm = useForm<VariantInput>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      label: "",
      order: 0,
      isActive: true,
    },
  });

  const handleOpenCreateModal = () => {
    createForm.reset({
      name: "",
      slug: "",
      code: "",
      categoryId: null,
      description: "",
      price: 0,
      isFeatured: false,
      isActive: true,
    });
    setSelectedVariantIds([]);
    setCreateVariantConfigs({});
    setCreateImages([]);
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    const existingVariantIds = (prod.variants || []).map((v) => v.id);
    setSelectedVariantIds(existingVariantIds);
    setEditImages(prod.images || []);

    const configs: Record<string, { price: string; quantity: number }> = {};
    (prod.variants || []).forEach((v) => {
      configs[v.id] = {
        price: v.overridePrice !== undefined && v.overridePrice !== null ? String(v.overridePrice) : (v.price !== undefined && v.price !== prod.price ? String(v.price) : ""),
        quantity: v.quantity !== undefined ? v.quantity : 10,
      };
    });
    setEditVariantConfigs(configs);

    editForm.reset({
      name: prod.name,
      slug: prod.slug,
      code: prod.code || "",
      categoryId: prod.categoryId?.id || null,
      description: prod.description || "",
      price: prod.price,
      isFeatured: prod.isFeatured || false,
      isActive: prod.isActive !== false,
    });
  };

  const handleImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "create" | "edit"
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const inputTarget = e.currentTarget;
    const editingProductId = editingProduct?.id;
    const fileList = Array.from(files);

    let successCount = 0;
    for (const file of fileList) {
      try {
        const res = await uploadMutation.mutateAsync(file);
        if (formType === "create" && !isCreateModalOpen) continue;
        if (formType === "edit" && (!editingProduct || editingProduct.id !== editingProductId)) continue;

        const url = res.data.url;
        if (formType === "create") {
          setCreateImages((prev) => [...prev, url]);
        } else {
          setEditImages((prev) => [...prev, url]);
        }
        successCount += 1;
      } catch (err: any) {
        if (formType === "create" && !isCreateModalOpen) continue;
        if (formType === "edit" && (!editingProduct || editingProduct.id !== editingProductId)) continue;
        toast.error(`Failed to upload ${file.name}: ${err.message || "Error"}`);
      }
    }

    if (successCount > 0) {
      toast.success("Product image(s) uploaded successfully!");
    }
    inputTarget.value = "";
  };

  const handleRemoveImage = (index: number, formType: "create" | "edit") => {
    if (formType === "create") {
      setCreateImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setEditImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const toggleCreateVariant = (variantId: string) => {
    if (selectedVariantIds.includes(variantId)) {
      setSelectedVariantIds((prev) => prev.filter((id) => id !== variantId));
      setCreateVariantConfigs((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
    } else {
      setSelectedVariantIds((prev) => [...prev, variantId]);
      setCreateVariantConfigs((prev) => ({
        ...prev,
        [variantId]: { price: "", quantity: 10 },
      }));
    }
  };

  const toggleEditVariant = (variantId: string) => {
    if (selectedVariantIds.includes(variantId)) {
      setSelectedVariantIds((prev) => prev.filter((id) => id !== variantId));
      setEditVariantConfigs((prev) => {
        const next = { ...prev };
        delete next[variantId];
        return next;
      });
    } else {
      setSelectedVariantIds((prev) => [...prev, variantId]);
      setEditVariantConfigs((prev) => ({
        ...prev,
        [variantId]: { price: "", quantity: 10 },
      }));
    }
  };

  const onCreateSubmit = (data: ProductInput) => {
    const variantsPayload = selectedVariantIds.map((vId) => {
      const cfg = createVariantConfigs[vId];
      return {
        productVariantId: vId,
        price: cfg && cfg.price.trim() !== "" ? Number(cfg.price) : null,
        quantity: cfg ? Number(cfg.quantity) || 0 : 0,
      };
    });

    const payload = {
      name: data.name.trim(),
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      code: data.code?.trim() || "",
      categoryId: data.categoryId || null,
      description: data.description?.trim() || "",
      price: data.price,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      images: createImages,
      variantIds: selectedVariantIds,
      variants: variantsPayload,
    };

    createProductMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Product "${res.data.name}" created successfully!`);
        setIsCreateModalOpen(false);
        createForm.reset();
        setSelectedVariantIds([]);
        setCreateVariantConfigs({});
        setCreateImages([]);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create product");
      },
    });
  };

  const onEditSubmit = (data: ProductInput) => {
    if (!editingProduct) return;

    const variantsPayload = selectedVariantIds.map((vId) => {
      const cfg = editVariantConfigs[vId];
      return {
        productVariantId: vId,
        price: cfg && cfg.price.trim() !== "" ? Number(cfg.price) : null,
        quantity: cfg ? Number(cfg.quantity) || 0 : 0,
      };
    });

    const payload = {
      id: editingProduct.id,
      name: data.name.trim(),
      slug: data.slug?.trim() ? slugify(data.slug) : slugify(data.name),
      code: data.code?.trim() || "",
      categoryId: data.categoryId || null,
      description: data.description?.trim() || "",
      price: data.price,
      isFeatured: data.isFeatured,
      isActive: data.isActive,
      images: editImages,
      variantIds: selectedVariantIds,
      variants: variantsPayload,
    };

    updateProductMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(`Product "${res.data.name}" updated successfully!`);
        setEditingProduct(null);
        editForm.reset();
        setSelectedVariantIds([]);
        setEditVariantConfigs({});
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update product");
      },
    });
  };

  const handleToggleFeatured = (prod: Product) => {
    const nextState = !prod.isFeatured;
    updateProductMutation.mutate(
      {
        id: prod.id,
        isFeatured: nextState,
      },
      {
        onSuccess: () => {
          toast.success(
            nextState
              ? `"${prod.name}" featured on storefront!`
              : `"${prod.name}" removed from featured products.`
          );
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update status");
        },
      }
    );
  };

  const handleToggleActive = (prod: Product) => {
    const nextState = !prod.isActive;
    updateProductMutation.mutate(
      {
        id: prod.id,
        isActive: nextState,
      },
      {
        onSuccess: () => {
          toast.success(nextState ? `"${prod.name}" activated.` : `"${prod.name}" deactivated.`);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update status");
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;

    deleteProductMutation.mutate(deletingProduct.id, {
      onSuccess: () => {
        toast.success(`Product "${deletingProduct.name}" deleted successfully!`);
        setDeletingProduct(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete product");
      },
    });
  };

  const onVariantSubmit = (data: VariantInput) => {
    if (editingVariant) {
      updateVariantMutation.mutate(
        {
          id: editingVariant.id,
          label: data.label.trim(),
          order: data.order ?? 0,
          isActive: data.isActive,
        },
        {
          onSuccess: (res) => {
            toast.success(`Variant "${res.data.label}" updated!`);
            setEditingVariant(null);
            variantForm.reset({ label: "", order: 0, isActive: true });
          },
          onError: (err) => {
            toast.error(err.message || "Failed to update variant");
          },
        }
      );
    } else {
      createVariantMutation.mutate(
        {
          label: data.label.trim(),
          order: data.order ?? 0,
          isActive: data.isActive,
        },
        {
          onSuccess: (res) => {
            toast.success(`Variant "${res.data.label}" created!`);
            variantForm.reset({ label: "", order: 0, isActive: true });
          },
          onError: (err) => {
            toast.error(err.message || "Failed to create variant");
          },
        }
      );
    }
  };

  const handleEditVariantClick = (v: ProductVariant) => {
    setEditingVariant(v);
    variantForm.reset({
      label: v.label || v.size || "",
      order: v.order || 0,
      isActive: v.isActive !== false,
    });
  };

  const handleDeleteVariantClick = (variant: ProductVariant) => {
    setDeletingVariant(variant);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        prod.name.toLowerCase().includes(query) ||
        prod.slug.toLowerCase().includes(query) ||
        (prod.code && prod.code.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      if (selectedCategory !== "all") {
        if (!prod.categoryId || prod.categoryId.id !== selectedCategory) {
          return false;
        }
      }

      if (filterStatus === "active") return prod.isActive !== false;
      if (filterStatus === "inactive") return prod.isActive === false;
      if (filterStatus === "featured") return prod.isFeatured === true;

      return true;
    });
  }, [products, searchQuery, selectedCategory, filterStatus]);

  const totalProducts = products.length;
  const totalStockUnits = useMemo(() => products.reduce((acc, p) => acc + (p.quantity || 0), 0), [products]);
  const outOfStockCount = useMemo(() => products.filter((p) => (p.quantity || 0) <= 0).length, [products]);
  const featuredCount = useMemo(() => products.filter((p) => p.isFeatured).length, [products]);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-maroon-800">
            <Package className="w-5 h-5 text-maroon-700" />
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900">Products Management</h1>
          </div>
          <p className="text-xs text-maroon-700 mt-1">
            Manage store catalog, prices, stock inventory, and age/size variant attributes
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => {
              setEditingVariant(null);
              variantForm.reset({ label: "", order: 0, isActive: true });
              setIsVariantModalOpen(true);
            }}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 font-medium text-xs rounded-xl transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-maroon-700" />
            <span>Manage Variants</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cream" />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Total Products
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isProductsLoading ? "..." : totalProducts}
            </span>
          </div>
          <div className="p-3 bg-maroon-50 border border-maroon-200/80 rounded-xl text-maroon-800">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Total Stock Units
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isProductsLoading ? "..." : totalStockUnits}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Out of Stock
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isProductsLoading ? "..." : outOfStockCount}
            </span>
          </div>
          <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-700">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-maroon-600 block uppercase tracking-wider">
              Featured Storefront
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 mt-1 block">
              {isProductsLoading ? "..." : featuredCount}
            </span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-700">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-maroon-100 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="relative w-full lg:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search product name, code, or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs placeholder-maroon-500/60 focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center space-x-3 w-full lg:w-auto justify-end">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="py-2 px-3 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="featured">Featured Only</option>
          </select>

          <button
            onClick={() => refetchProducts()}
            className="p-2 bg-off-white hover:bg-maroon-100 text-maroon-800 rounded-xl border border-maroon-200 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden">
        {isProductsLoading ? (
          <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
            <p className="text-xs font-medium">Loading catalog products...</p>
          </div>
        ) : productsError ? (
          <div className="p-8 text-center text-maroon-900 space-y-2">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="font-serif font-bold text-base">Failed to load products</p>
            <p className="text-xs text-maroon-700">{productsError.message || "An error occurred while fetching products."}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-maroon-700 space-y-3">
            <Package className="w-12 h-12 text-maroon-300 mx-auto" />
            <p className="font-serif font-bold text-base text-maroon-900">No Products Found</p>
            <p className="text-xs text-maroon-600">
              {searchQuery || selectedCategory !== "all" || filterStatus !== "all"
                ? "No products match your search filters."
                : "No products created yet. Click 'Add New Product' to start."}
            </p>
            {(searchQuery || selectedCategory !== "all" || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setFilterStatus("all");
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
                  <th className="py-3.5 px-6 font-semibold">Product Info</th>
                  <th className="py-3.5 px-6 font-semibold">Category</th>
                  <th className="py-3.5 px-6 font-semibold">Price</th>
                  <th className="py-3.5 px-6 font-semibold">Stock</th>
                  <th className="py-3.5 px-6 font-semibold">Variants</th>
                  <th className="py-3.5 px-6 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 bg-white">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-maroon-50/50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-off-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                        {prod.images && prod.images.length > 0 ? (
                          <Image
                            src={prod.images[0]}
                            alt={prod.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-maroon-400" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-maroon-900">{prod.name}</h4>
                          {prod.code && (
                            <span className="text-[10px] font-bold font-mono text-maroon-700 bg-off-white border border-maroon-200 px-1.5 py-0.5 rounded">
                              {prod.code}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-maroon-600 block">
                          /{prod.slug}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-maroon-700">
                      {prod.categoryId?.name ? (
                        <span className="text-maroon-900 font-medium px-2 py-1 rounded-md">
                          {prod.categoryId.name}
                        </span>
                      ) : (
                        <span className="text-maroon-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-sm text-maroon-900">
                      ৳{prod.price.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 font-mono font-semibold">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-bold ${
                          (prod.quantity || 0) > 0
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            : "bg-red-100 text-red-900 border border-red-200"
                        }`}
                      >
                        {prod.quantity || 0} units
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {prod.variants && prod.variants.length > 0 ? (
                          prod.variants.map((v: ProductVariant) => (
                            <span
                              key={v.id}
                              className="text-[10px] font-bold font-mono text-maroon-800 bg-off-white border border-maroon-200 px-1.5 py-0.5 rounded"
                            >
                              {v.size || v.label}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-maroon-400 italic">No variants</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center space-y-1">
                        <button
                          onClick={() => handleToggleFeatured(prod)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer shadow-xs ${
                            prod.isFeatured
                              ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                              : "bg-off-white text-maroon-500 border-maroon-200 hover:bg-maroon-100"
                          }`}
                          title="Toggle Featured"
                        >
                          <Star className={`w-3 h-3 ${prod.isFeatured ? "fill-amber-500 text-amber-600" : ""}`} />
                          <span>{prod.isFeatured ? "Featured" : "Standard"}</span>
                        </button>

                        <button
                          onClick={() => handleToggleActive(prod)}
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                            prod.isActive !== false
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-gray-100 text-gray-600 border-gray-300"
                          }`}
                          title="Toggle Active status"
                        >
                          <span>{prod.isActive !== false ? "Active" : "Inactive"}</span>
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-1.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingProduct(prod)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg transition-colors cursor-pointer"
                          title="Delete Product"
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
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-5 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-maroon-900">Add New Product</h3>
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
                  Product Images
                </label>

                <input
                  type="file"
                  ref={fileInputRefCreate}
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImagesUpload(e, "create")}
                  className="hidden"
                />

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRefCreate.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full h-24 border-2 border-dashed border-maroon-200 hover:border-maroon-700 bg-off-white/80 hover:bg-white rounded-xl flex flex-col items-center justify-center space-y-1 text-maroon-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-maroon-700" />
                        <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-maroon-600" />
                        <span className="text-xs font-semibold">Click to upload product image(s)</span>
                        <span className="text-[10px] text-maroon-500">Supports JPG, JPEG, PNG, GIF, WEBP (Select multiple)</span>
                      </>
                    )}
                  </button>

                  {createImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {createImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-full h-16 rounded-lg overflow-hidden border border-maroon-200 bg-off-white group"
                        >
                          <Image src={imgUrl} alt={`Product ${idx + 1}`} fill sizes="64px" className="object-cover" />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, "create")}
                            className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-xs"
                            title="Remove Image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                    Product Name *
                  </label>
                  {(() => {
                    const nameRegister = createForm.register("name");
                    return (
                      <input
                        type="text"
                        placeholder="e.g. Royal Embroidered Panjabi"
                        {...nameRegister}
                        onChange={(e) => {
                          nameRegister.onChange(e);
                          createForm.setValue("slug", slugify(e.target.value));
                        }}
                        className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                      />
                    );
                  })()}
                  {createForm.formState.errors.name && (
                    <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                    Product Code / SKU
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PJB-101"
                    {...createForm.register("code")}
                    className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                    URL Slug (Auto-generated)
                  </label>
                  <input
                    type="text"
                    placeholder="royal-embroidered-panjabi"
                    {...createForm.register("slug")}
                    className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-xs font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                    Category
                  </label>
                  <select
                    {...createForm.register("categoryId")}
                    className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer font-medium"
                  >
                    <option value="">-- No Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Base Price (৳) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="1850"
                  {...createForm.register("price", { valueAsNumber: true })}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                />
                {createForm.formState.errors.price && (
                  <p className="text-xs text-red-600 mt-1">{createForm.formState.errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter product description, fabric details, care instructions..."
                  {...createForm.register("description")}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-2">
                  Select Age/Size Variants
                </label>
                <div className="p-3 bg-off-white border border-maroon-100 rounded-xl space-y-3">
                  {isVariantsLoading ? (
                    <p className="text-xs text-maroon-600">Loading variants...</p>
                  ) : globalVariants.length === 0 ? (
                    <p className="text-xs text-maroon-600">No global variants configured yet.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {globalVariants.map((v) => {
                          const isSelected = selectedVariantIds.includes(v.id);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleCreateVariant(v.id)}
                              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-maroon-900 text-white border-maroon-900 shadow-xs"
                                  : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-100"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-cream" />}
                              <span>{v.label || v.size}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedVariantIds.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-maroon-200/60 space-y-2">
                          <p className="text-xs font-bold text-maroon-900">Configure Variant Prices & Stock</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {globalVariants
                              .filter((v) => selectedVariantIds.includes(v.id))
                              .map((v) => {
                                const cfg = createVariantConfigs[v.id] || { price: "", quantity: 10 };
                                return (
                                  <div key={v.id} className="p-2 bg-white rounded-lg border border-maroon-200 flex items-center justify-between gap-3 text-xs">
                                    <span className="font-bold text-maroon-900 w-28 shrink-0">{v.label || v.size}</span>
                                    <div className="flex items-center space-x-2 flex-1">
                                      <div className="flex-1">
                                        <label className="text-[10px] text-maroon-600 block">Price (৳) [Blank = Base Price]</label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder={`Default (৳${createForm.watch("price") || 0})`}
                                          value={cfg.price}
                                          onChange={(e) =>
                                            setCreateVariantConfigs((prev) => ({
                                              ...prev,
                                              [v.id]: { ...cfg, price: e.target.value },
                                            }))
                                          }
                                          className="w-full px-2 py-1 bg-off-white border border-maroon-200 rounded text-xs font-mono"
                                        />
                                      </div>
                                      <div className="w-24">
                                        <label className="text-[10px] text-maroon-600 block">Stock Qty *</label>
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="10"
                                          value={cfg.quantity}
                                          onChange={(e) =>
                                            setCreateVariantConfigs((prev) => ({
                                              ...prev,
                                              [v.id]: { ...cfg, quantity: Math.max(0, parseInt(e.target.value || "0", 10)) },
                                            }))
                                          }
                                          className="w-full px-2 py-1 bg-off-white border border-maroon-200 rounded text-xs font-mono font-bold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...createForm.register("isFeatured")}
                    className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700"
                  />
                  <span className="text-xs font-semibold text-maroon-900">Featured Storefront Item</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...createForm.register("isActive")}
                    className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700"
                  />
                  <span className="text-xs font-semibold text-maroon-900">Active (Visible to Buyers)</span>
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
                  disabled={createProductMutation.isPending || uploadMutation.isPending}
                  className="px-5 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  {createProductMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingProduct(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-5 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-maroon-900">Edit Product</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1 text-maroon-500 hover:text-maroon-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Product Images
                </label>

                <input
                  type="file"
                  ref={fileInputRefEdit}
                  accept="image/*"
                  multiple
                  onChange={(e) => handleImagesUpload(e, "edit")}
                  className="hidden"
                />

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRefEdit.current?.click()}
                    disabled={uploadMutation.isPending}
                    className="w-full h-24 border-2 border-dashed border-maroon-200 hover:border-maroon-700 bg-off-white/80 hover:bg-white rounded-xl flex flex-col items-center justify-center space-y-1 text-maroon-700 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {uploadMutation.isPending ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-maroon-700" />
                        <span className="text-xs font-semibold">Uploading to Cloudinary...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-6 h-6 text-maroon-600" />
                        <span className="text-xs font-semibold">Click to upload product image(s)</span>
                        <span className="text-[10px] text-maroon-500">Supports JPG, JPEG, PNG, GIF, WEBP (Select multiple)</span>
                      </>
                    )}
                  </button>

                  {editImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {editImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative w-full h-16 rounded-lg overflow-hidden border border-maroon-200 bg-off-white group"
                        >
                          <Image src={imgUrl} alt={`Product ${idx + 1}`} fill sizes="64px" className="object-cover" />
                          {idx === 0 && (
                            <span className="absolute bottom-0 inset-x-0 bg-emerald-600/90 text-white text-[9px] font-bold text-center py-0.5 uppercase tracking-wider">
                              Cover
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx, "edit")}
                            className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 shadow-xs"
                            title="Remove Image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                    Product Name *
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
                    Product Code / SKU
                  </label>
                  <input
                    type="text"
                    {...editForm.register("code")}
                    className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                    Category
                  </label>
                  <select
                    {...editForm.register("categoryId")}
                    className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all cursor-pointer font-medium"
                  >
                    <option value="">-- No Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Base Price (৳) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...editForm.register("price", { valueAsNumber: true })}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm font-mono focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all"
                />
                {editForm.formState.errors.price && (
                  <p className="text-xs text-red-600 mt-1">{editForm.formState.errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  {...editForm.register("description")}
                  className="w-full px-3.5 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-md text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-maroon-900 mb-2">
                  Select Age/Size Variants
                </label>
                <div className="p-3 bg-off-white border border-maroon-100 rounded-xl space-y-3">
                  {globalVariants.length === 0 ? (
                    <p className="text-xs text-maroon-600">No global variants configured yet.</p>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {globalVariants.map((v) => {
                          const isSelected = selectedVariantIds.includes(v.id);
                          return (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => toggleEditVariant(v.id)}
                              className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? "bg-maroon-900 text-white border-maroon-900 shadow-xs"
                                  : "bg-white text-maroon-800 border-maroon-200 hover:bg-maroon-100"
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-cream" />}
                              <span>{v.label || v.size}</span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedVariantIds.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-maroon-200/60 space-y-2">
                          <p className="text-xs font-bold text-maroon-900">Configure Variant Prices & Stock</p>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {globalVariants
                              .filter((v) => selectedVariantIds.includes(v.id))
                              .map((v) => {
                                const cfg = editVariantConfigs[v.id] || { price: "", quantity: 10 };
                                return (
                                  <div key={v.id} className="p-2 bg-white rounded-lg border border-maroon-200 flex items-center justify-between gap-3 text-xs">
                                    <span className="font-bold text-maroon-900 w-28 shrink-0">{v.label || v.size}</span>
                                    <div className="flex items-center space-x-2 flex-1">
                                      <div className="flex-1">
                                        <label className="text-[10px] text-maroon-600 block">Price (৳) [Blank = Base Price]</label>
                                        <input
                                          type="number"
                                          step="0.01"
                                          placeholder={`Default (৳${editForm.watch("price") || 0})`}
                                          value={cfg.price}
                                          onChange={(e) =>
                                            setEditVariantConfigs((prev) => ({
                                              ...prev,
                                              [v.id]: { ...cfg, price: e.target.value },
                                            }))
                                          }
                                          className="w-full px-2 py-1 bg-off-white border border-maroon-200 rounded text-xs font-mono"
                                        />
                                      </div>
                                      <div className="w-24">
                                        <label className="text-[10px] text-maroon-600 block">Stock Qty *</label>
                                        <input
                                          type="number"
                                          min="0"
                                          placeholder="10"
                                          value={cfg.quantity}
                                          onChange={(e) =>
                                            setEditVariantConfigs((prev) => ({
                                              ...prev,
                                              [v.id]: { ...cfg, quantity: Math.max(0, parseInt(e.target.value || "0", 10)) },
                                            }))
                                          }
                                          className="w-full px-2 py-1 bg-off-white border border-maroon-200 rounded text-xs font-mono font-bold"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...editForm.register("isFeatured")}
                    className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700"
                  />
                  <span className="text-xs font-semibold text-maroon-900">Featured Storefront Item</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...editForm.register("isActive")}
                    className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700"
                  />
                  <span className="text-xs font-semibold text-maroon-900">Active (Visible to Buyers)</span>
                </label>
              </div>

              <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProductMutation.isPending || uploadMutation.isPending}
                  className="px-5 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
                >
                  {updateProductMutation.isPending ? (
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

      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingProduct(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 p-6 space-y-4 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">Delete Product</h3>
            </div>

            <p className="text-xs text-maroon-700 leading-relaxed font-sans">
              Are you sure you want to delete the product{" "}
              <strong className="text-maroon-900 font-semibold">&quot;{deletingProduct.name}&quot;</strong>?
              This action will remove the product and its variant links permanently.
            </p>

            <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteProductMutation.isPending}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleteProductMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Product</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isVariantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsVariantModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-5 z-10 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-maroon-900">Manage Global Variants</h3>
                <p className="text-xs text-maroon-700">Configure global size and age group variants available across products</p>
              </div>
              <button
                onClick={() => setIsVariantModalOpen(false)}
                className="p-1 text-maroon-500 hover:text-maroon-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={variantForm.handleSubmit(onVariantSubmit)} className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-3" noValidate>
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                {editingVariant ? `Edit Variant: "${editingVariant.label || editingVariant.size}"` : "Add New Variant"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="e.g. 2-3 Years or XL"
                    {...variantForm.register("label")}
                    className="w-full px-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-md text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-maroon-700"
                  />
                  {variantForm.formState.errors.label && (
                    <p className="text-xs text-red-600 mt-0.5">{variantForm.formState.errors.label.message}</p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Order (e.g. 1)"
                    {...variantForm.register("order", { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-white text-maroon-900 border border-maroon-200 rounded-md text-xs font-mono focus:outline-none focus:ring-2 focus:ring-maroon-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...variantForm.register("isActive")}
                    className="w-4 h-4 text-maroon-900 border-maroon-300 rounded focus:ring-maroon-700"
                  />
                  <span className="text-xs font-semibold text-maroon-900">Active Status</span>
                </label>

                <div className="flex items-center space-x-2">
                  {editingVariant && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVariant(null);
                        variantForm.reset({ label: "", order: 0, isActive: true });
                      }}
                      className="px-3 py-1.5 bg-white border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={createVariantMutation.isPending || updateVariantMutation.isPending}
                    className="px-4 py-1.5 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {editingVariant ? "Update Variant" : "Add Variant"}
                  </button>
                </div>
              </div>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-900">Configured Global Variants</h4>
              {isVariantsLoading ? (
                <p className="text-xs text-maroon-600 py-4 text-center">Loading variants...</p>
              ) : globalVariants.length === 0 ? (
                <p className="text-xs text-maroon-600 py-4 text-center">No global variants configured yet.</p>
              ) : (
                <div className="divide-y divide-maroon-100 border border-maroon-100 rounded-xl overflow-hidden bg-white">
                  {globalVariants.map((v) => (
                    <div key={v.id} className="p-3 flex items-center justify-between text-xs hover:bg-maroon-50/50">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-maroon-900 font-mono text-sm">{v.label || v.size}</span>
                        <span className="text-[10px] font-mono text-maroon-600 bg-off-white border border-maroon-200 px-1.5 py-0.5 rounded">
                          Order: {v.order || 0}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            v.isActive !== false ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {v.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => handleEditVariantClick(v)}
                          className="p-1 text-maroon-800 hover:bg-maroon-100 rounded transition-colors"
                          title="Edit Variant"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVariantClick(v)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {deletingVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingVariant(null)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-red-100 p-6 space-y-4 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">Delete Variant</h3>
            </div>

            <p className="text-xs text-maroon-700 leading-relaxed font-sans">
              Are you sure you want to delete the variant{" "}
              <strong className="text-maroon-900 font-semibold">&quot;{deletingVariant.label || deletingVariant.size}&quot;</strong>?
              This action cannot be undone.
            </p>

            <div className="pt-3 border-t border-maroon-100 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setDeletingVariant(null)}
                className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteVariantMutation.isPending}
                onClick={() => {
                  deleteVariantMutation.mutate(deletingVariant.id, {
                    onSuccess: () => {
                      toast.success("Variant deleted successfully!");
                      setDeletingVariant(null);
                    },
                    onError: (err) => {
                      toast.error(err.message || "Failed to delete variant");
                    },
                  });
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                {deleteVariantMutation.isPending ? (
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
