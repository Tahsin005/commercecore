"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import {
  useAdminOrdersQuery,
  useAdminOrderDetailQuery,
  useUpdateOrderStatusMutation,
  OrderStatus,
  AdminOrder,
} from "@/hooks/useAdminOrderQueries";
import { toast } from "react-hot-toast";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Package,
  Eye,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  RotateCcw,
  Loader2,
  LucideIcon,
} from "lucide-react";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; border: string; icon: LucideIcon }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: CheckCircle2,
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
    icon: Package,
  },
  SHIPPED: {
    label: "Shipped",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
  },
  RETURNED: {
    label: "Returned",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    icon: RotateCcw,
  },
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  // Debounce search query input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal Escape key dismissal & Focus management
  useEffect(() => {
    if (!selectedOrderId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedOrderId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    if (modalRef.current) {
      modalRef.current.focus();
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedOrderId]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const filters = useMemo(
    () => ({
      status: statusFilter,
      search: debouncedSearch,
      page,
      limit: 15,
    }),
    [statusFilter, debouncedSearch, page]
  );

  const {
    data: ordersRes,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useAdminOrdersQuery(filters);

  const {
    data: detailRes,
    isLoading: isDetailLoading,
    error: detailError,
    refetch: refetchDetail,
  } = useAdminOrderDetailQuery(selectedOrderId);

  const updateStatusMutation = useUpdateOrderStatusMutation();

  const orders = ordersRes?.data?.orders || [];
  const pagination = ordersRes?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 15,
    totalPages: 1,
  };
  const stats = ordersRes?.data?.stats || {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  };

  const selectedOrder = detailRes?.data?.order;
  const selectedOrderItems = detailRes?.data?.items || [];

  const handleStatusChange = (id: string, newStatus: OrderStatus) => {
    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Order status updated to ${newStatus}`);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update order status");
        },
      }
    );
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  // Generate bounded page numbers for pagination bar
  const getPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, 4, total];
    }
    if (current >= total - 2) {
      return [1, total - 3, total - 2, total - 1, total];
    }
    return [1, current - 1, current, current + 1, total];
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-maroon-800">
            <ShoppingBag className="w-6 h-6 text-maroon-700" />
            <h1 className="font-serif font-bold text-2xl text-maroon-900 tracking-tight">
              Order Fulfillment & Management
            </h1>
          </div>
          <p className="text-xs text-maroon-700 mt-1">
            Track customer orders, manage shipping status, inspect receipts, and process fulfillments.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="px-4 py-2.5 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          <span>{isRefetching ? "Refreshing..." : "Refresh Data"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Total Revenue</p>
            <h3 className="font-serif font-bold text-2xl text-maroon-900 mt-1">
              ৳{stats.totalRevenue.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Active sales volume</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Total Orders</p>
            <h3 className="font-serif font-bold text-2xl text-maroon-900 mt-1">
              {stats.totalOrders}
            </h3>
            <p className="text-[11px] text-maroon-700 mt-0.5 font-medium">All customer transactions</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-maroon-50 border border-maroon-200 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6 text-maroon-800" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Pending Action</p>
            <h3 className="font-serif font-bold text-2xl text-amber-700 mt-1">
              {stats.pendingOrders}
            </h3>
            <p className="text-[11px] text-amber-700 mt-0.5 font-medium">Awaiting confirmation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Delivered</p>
            <h3 className="font-serif font-bold text-2xl text-emerald-800 mt-1">
              {stats.deliveredOrders}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Fulfilled successfully</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-maroon-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-maroon-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search by Order #, Name, Phone, Email..."
              className="w-full pl-10 pr-9 py-2.5 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl text-xs focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all placeholder:text-maroon-400"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-maroon-400 hover:text-maroon-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {[
              { id: "ALL", label: "All Orders" },
              { id: "PENDING", label: "Pending" },
              { id: "CONFIRMED", label: "Confirmed" },
              { id: "PROCESSING", label: "Processing" },
              { id: "SHIPPED", label: "Shipped" },
              { id: "DELIVERED", label: "Delivered" },
              { id: "CANCELLED", label: "Cancelled" },
              { id: "RETURNED", label: "Returned" },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleStatusFilterChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-maroon-900 text-white shadow-xs"
                      : "bg-off-white hover:bg-maroon-100 text-maroon-800 border border-maroon-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
            <p className="text-xs font-medium">Fetching orders database...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-semibold">Failed to load orders.</p>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-maroon-700 space-y-2">
            <ShoppingBag className="w-10 h-10 mx-auto text-maroon-400" />
            <p className="text-sm font-bold text-maroon-900">No orders found</p>
            <p className="text-xs text-maroon-600">
              Try adjusting your search criteria or status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-maroon-50/60 border-b border-maroon-100 text-[11px] font-bold text-maroon-900 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Zone</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 text-xs">
                {orders.map((ord: AdminOrder) => {
                  const cfg = STATUS_CONFIG[ord.status] || STATUS_CONFIG.PENDING;
                  const Icon = cfg.icon;
                  const isItemUpdating =
                    updateStatusMutation.isPending &&
                    updateStatusMutation.variables?.id === ord.id;

                  return (
                    <tr key={ord.id} className="hover:bg-maroon-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-maroon-900">
                        <span className="bg-off-white border border-maroon-200 px-2 py-1 rounded-md">
                          {ord.orderNumber}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-maroon-900">{ord.customerName}</div>
                        <div className="text-[11px] text-maroon-700 font-mono flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-maroon-500 shrink-0" />
                          <span>{ord.phone}</span>
                        </div>
                        {ord.email && (
                          <div className="text-[11px] text-maroon-500 truncate max-w-[180px]">
                            {ord.email}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-maroon-700 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-maroon-500 shrink-0" />
                          <span>{formatDate(ord.createdAt)}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            ord.deliveryZone === "inside_dhaka"
                              ? "bg-blue-50 text-blue-800 border border-blue-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {ord.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-maroon-900 whitespace-nowrap">
                        ৳{ord.total.toLocaleString()}
                        <div className="text-[10px] font-normal text-maroon-600">
                          Subtotal: ৳{ord.subtotal} | Delivery: ৳{ord.deliveryCharge}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{cfg.label}</span>
                          </span>

                          <select
                            value={ord.status}
                            aria-label={`Update order status for ${ord.orderNumber}`}
                            disabled={isItemUpdating}
                            onChange={(e) =>
                              handleStatusChange(ord.id, e.target.value as OrderStatus)
                            }
                            className="text-[11px] bg-off-white hover:bg-white text-maroon-900 border border-maroon-200 rounded-md px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-maroon-700 cursor-pointer disabled:opacity-50"
                          >
                            <option value="PENDING">Set Pending</option>
                            <option value="CONFIRMED">Set Confirmed</option>
                            <option value="PROCESSING">Set Processing</option>
                            <option value="SHIPPED">Set Shipped</option>
                            <option value="DELIVERED">Set Delivered</option>
                            <option value="CANCELLED">Set Cancelled</option>
                            <option value="RETURNED">Set Returned</option>
                          </select>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrderId(ord.id)}
                          className="px-3 py-1.5 bg-maroon-900 hover:bg-maroon-950 text-white text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center space-x-1.5 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Invoice</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="p-4 bg-off-white border-t border-maroon-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-sans">
            <div className="text-maroon-700">
              Showing <span className="font-bold text-maroon-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
              <span className="font-bold text-maroon-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{" "}
              <span className="font-bold text-maroon-900">{pagination.total}</span> orders
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                Previous
              </button>

              {getPageNumbers(pagination.page, pagination.totalPages).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-lg font-bold transition-all cursor-pointer ${
                    pNum === pagination.page
                      ? "bg-maroon-900 text-white shadow-xs"
                      : "bg-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900"
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="px-3 py-1.5 bg-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setSelectedOrderId(null)}
          />

          <div
            ref={modalRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-modal-title"
            className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-6 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 focus:outline-none font-sans"
          >
            <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 id="order-modal-title" className="font-serif font-bold text-xl text-maroon-900">
                    Order Receipt Summary
                  </h3>
                  {selectedOrder && (
                    <span className="font-mono font-bold text-xs bg-maroon-100 text-maroon-900 px-2.5 py-0.5 rounded-md border border-maroon-200">
                      {selectedOrder.orderNumber}
                    </span>
                  )}
                </div>
                {selectedOrder && (
                  <p className="text-xs text-maroon-600 mt-0.5">
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedOrderId(null)}
                  className="p-1.5 text-maroon-500 hover:text-maroon-800 rounded-md transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {detailError ? (
              <div className="p-8 text-center text-red-600 space-y-3 bg-red-50/50 rounded-xl border border-red-100">
                <AlertTriangle className="w-8 h-8 mx-auto text-red-600" />
                <p className="text-xs font-semibold">
                  {detailError.message || "Failed to load order receipt details."}
                </p>
                <button
                  onClick={() => refetchDetail()}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : isDetailLoading || !selectedOrder ? (
              <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
                <p className="text-xs font-medium">Fetching order receipt details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-off-white rounded-xl border border-maroon-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                      Current Status:
                    </span>
                    {(() => {
                      const cfg =
                        STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.PENDING;
                      const Icon = cfg.icon;
                      return (
                        <span
                          className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{cfg.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-semibold text-maroon-800">
                      Update Order Status:
                    </label>
                    <select
                      value={selectedOrder.status}
                      disabled={updateStatusMutation.isPending}
                      onChange={(e) =>
                        handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                      }
                      className="text-xs bg-white text-maroon-900 border border-maroon-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-maroon-700 cursor-pointer font-medium shadow-xs"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="RETURNED">RETURNED</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-maroon-100 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-900 border-b border-maroon-100 pb-2 flex items-center space-x-1.5">
                      <User className="w-4 h-4 text-maroon-700" />
                      <span>Customer Information</span>
                    </h4>
                    <div className="text-xs space-y-1 text-maroon-800 pt-1">
                      <div className="font-bold text-sm text-maroon-900">
                        {selectedOrder.customerName}
                      </div>
                      <div className="flex items-center space-x-2 text-maroon-700 font-mono">
                        <Phone className="w-3.5 h-3.5 text-maroon-500 shrink-0" />
                        <span>{selectedOrder.phone}</span>
                      </div>
                      {selectedOrder.email && (
                        <div className="flex items-center space-x-2 text-maroon-600">
                          <Mail className="w-3.5 h-3.5 text-maroon-500 shrink-0" />
                          <span>{selectedOrder.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-maroon-100 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-900 border-b border-maroon-100 pb-2 flex items-center space-x-1.5">
                      <MapPin className="w-4 h-4 text-maroon-700" />
                      <span>Delivery Address</span>
                    </h4>
                    <div className="text-xs space-y-1.5 text-maroon-800 pt-1">
                      <div className="font-semibold text-maroon-900 leading-relaxed">
                        {selectedOrder.shippingAddress}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider bg-maroon-100 text-maroon-900 border border-maroon-200">
                          Zone:{" "}
                          {selectedOrder.deliveryZone === "inside_dhaka"
                            ? "Inside Dhaka (৳60)"
                            : "Outside Dhaka (৳120)"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-maroon-900">
                    Ordered Items Breakdown
                  </h4>
                  <div className="border border-maroon-100 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left border-collapse font-sans">
                      <thead>
                        <tr className="bg-maroon-50/80 border-b border-maroon-100 text-[11px] font-bold text-maroon-900 uppercase">
                          <th className="py-3 px-4">Product Name</th>
                          <th className="py-3 px-4">Selected Variant</th>
                          <th className="py-3 px-4 text-center">Unit Price</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-maroon-100 text-xs">
                        {selectedOrderItems.map((item) => {
                          const itemImg = item.imageUrl || item.productId?.images?.[0] || item.productId?.imageUrl;

                          return (
                            <tr key={item.id} className="hover:bg-maroon-50/30">
                              <td className="py-3 px-4 font-semibold text-maroon-900">
                                <div className="flex items-center space-x-2.5">
                                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-off-white border border-maroon-200 flex items-center justify-center shrink-0 relative">
                                    {itemImg ? (
                                      <Image
                                        src={itemImg}
                                        alt={item.productName}
                                        fill
                                        sizes="36px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <Package className="w-4 h-4 text-maroon-300" />
                                    )}
                                  </div>
                                  <span>{item.productName}</span>
                                </div>
                              </td>
                            <td className="py-3 px-4">
                              <span className="text-[11px] font-semibold bg-off-white text-maroon-800 border border-maroon-200 px-2 py-0.5 rounded">
                                {item.size || item.selectedVariantLabel || "Standard"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-maroon-800">
                              ৳{item.unitPrice.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center font-mono font-bold text-maroon-900">
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-maroon-900">
                              ৳{(item.unitPrice * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-4 bg-off-white rounded-xl border border-maroon-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-maroon-700 font-medium">
                    Payment Method: <span className="font-bold text-maroon-900">Cash on Delivery</span>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs text-maroon-800">
                    <div className="flex items-center justify-between">
                      <span className="text-maroon-600">Subtotal:</span>
                      <span className="font-mono font-semibold">
                        ৳{selectedOrder.subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-maroon-600">Delivery Charge:</span>
                      <span className="font-mono font-semibold">
                        ৳{selectedOrder.deliveryCharge.toLocaleString()}
                      </span>
                    </div>
                    {selectedOrder.discountAmount > 0 && (
                      <div className="flex items-center justify-between text-emerald-700">
                        <span>Discount:</span>
                        <span className="font-mono font-semibold">
                          -৳{selectedOrder.discountAmount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-maroon-200 flex items-center justify-between font-bold text-sm text-maroon-900">
                      <span>Total Amount:</span>
                      <span className="font-mono text-base text-maroon-950">
                        ৳{selectedOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
