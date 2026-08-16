"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Loader2,
  ChevronRight,
  X,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  useCustomerOrdersQuery,
  Order,
  OrderItem,
} from "@/hooks/useProfileQueries";

const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
  PROCESSING: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200" },
  SHIPPED: { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-200" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-900", border: "border-red-200" },
  RETURNED: { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-300" },
};

interface MyOrdersTabProps {
  isAuthenticated: boolean;
}

export function MyOrdersTab({ isAuthenticated }: MyOrdersTabProps) {
  const { t } = useLanguage();
  const [ordersPage, setOrdersPage] = useState(1);
  const { data: ordersRes, isLoading: isOrdersLoading } = useCustomerOrdersQuery(ordersPage, 10, isAuthenticated);
  const ordersData = ordersRes?.data;
  const orders = ordersData?.orders || [];
  const totalPages = ordersData?.pagination?.totalPages || 1;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  if (isOrdersLoading) {
    return (
      <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-2 bg-white rounded-2xl border border-maroon-100 shadow-sm">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
        <p className="text-xs font-medium">Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center space-y-4 bg-white rounded-2xl border border-maroon-100 shadow-sm">
        <div className="w-16 h-16 bg-maroon-50 rounded-full flex items-center justify-center mx-auto text-maroon-800">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-serif font-bold text-maroon-900">
            {t.profile.noOrdersTitle || "No Orders Yet"}
          </h3>
          <p className="text-xs text-maroon-700 max-w-sm mx-auto">
            {t.profile.noOrdersDesc || "You haven't placed any orders with us yet. Discover our collection and place your first order!"}
          </p>
        </div>
        <Link
          href="/categories"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all"
        >
          <span>Explore Collection</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-maroon-900 border-collapse">
            <thead>
              <tr className="bg-maroon-900 text-cream text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Order Info</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Total Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-maroon-100 bg-white">
              {orders.map((order) => {
                const statusStyle = statusColorMap[order.status] || {
                  bg: "bg-gray-100",
                  text: "text-gray-900",
                  border: "border-gray-200",
                };

                return (
                  <tr key={order.id} className="hover:bg-maroon-50/50 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <span className="font-bold text-maroon-900 block font-mono">
                        {t.profile.orderNumberLabel || "Order #"} {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-maroon-600 block">
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="space-y-1">
                        {order.items?.map((item: OrderItem, idx: number) => {
                          const name = item.productName || item.name || "Item";
                          const price = item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice : (item.price || 0);
                          const size = item.selectedVariantLabel || item.size || "Standard";
                          return (
                            <div key={idx} className="text-xs text-maroon-900 flex items-center justify-between gap-2">
                              <span className="truncate">{name} ({size}) × {item.quantity}</span>
                              <span className="font-mono font-semibold shrink-0">৳{(price * item.quantity).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 align-top text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-top text-right font-mono font-bold text-sm text-maroon-900">
                      ৳{order.total.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 align-top text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1.5 bg-maroon-50 hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
                      >
                        {t.profile.viewDetailsBtn || "View Details"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-maroon-100 rounded-2xl shadow-sm">
          <button
            disabled={ordersPage <= 1}
            onClick={() => setOrdersPage((prev) => Math.max(1, prev - 1))}
            className="px-3.5 py-1.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-mono font-medium text-maroon-800">
            Page {ordersPage} of {totalPages}
          </span>
          <button
            disabled={ordersPage >= totalPages}
            onClick={() => setOrdersPage((prev) => Math.min(totalPages, prev + 1))}
            className="px-3.5 py-1.5 bg-maroon-50 hover:bg-maroon-100 text-maroon-900 border border-maroon-200 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 border border-maroon-100 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-4 text-maroon-700 hover:text-maroon-900 p-1.5 rounded-full hover:bg-maroon-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 border-b border-maroon-100 pb-4">
              <div className="flex items-center justify-between pr-8">
                <h3 className="font-serif font-bold text-xl text-maroon-900">
                  Order Details ({selectedOrder.orderNumber})
                </h3>
                <span
                  className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${(statusColorMap[selectedOrder.status] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" }).bg
                    } ${(statusColorMap[selectedOrder.status] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" }).text
                    } ${(statusColorMap[selectedOrder.status] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" }).border
                    }`}
                >
                  {selectedOrder.status}
                </span>
              </div>
              <p className="text-xs text-maroon-600 font-mono">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-US")}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-off-white p-4 rounded-2xl border border-maroon-100">
              <div className="space-y-1">
                <span className="font-bold text-maroon-900 block uppercase tracking-wider text-[10px]">Customer Info</span>
                <p className="font-medium text-maroon-800">{selectedOrder.customerName}</p>
                <p className="font-mono text-maroon-700">{selectedOrder.phone}</p>
                {selectedOrder.email && <p className="font-mono text-maroon-700">{selectedOrder.email}</p>}
              </div>

              <div className="space-y-1">
                <span className="font-bold text-maroon-900 block uppercase tracking-wider text-[10px]">Shipping Destination</span>
                <p className="text-maroon-800 leading-relaxed">{selectedOrder.shippingAddress}</p>
                <span className="text-[10px] font-bold text-maroon-700 bg-maroon-100 px-2 py-0.5 rounded border border-maroon-200 inline-block capitalize mt-1">
                  {selectedOrder.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-maroon-900 uppercase tracking-wider">Ordered Items</h4>
              <div className="border border-maroon-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-maroon-900 text-white font-serif uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Item</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Variant</th>
                      <th className="py-2.5 px-4 font-semibold text-center">Qty</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-maroon-100 bg-white">
                    {selectedOrder.items?.map((item: OrderItem, idx: number) => {
                      const name = item.productName || item.name || "Item";
                      const price = item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice : (item.price || 0);
                      const size = item.selectedVariantLabel || item.size || "Standard";
                      return (
                        <tr key={idx} className="hover:bg-maroon-50/50">
                          <td className="py-3 px-4 font-medium text-maroon-900">{name}</td>
                          <td className="py-3 px-4 text-center font-mono text-maroon-700">{size}</td>
                          <td className="py-3 px-4 text-center font-mono font-bold text-maroon-900">{item.quantity}</td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-maroon-900">
                            ৳{(price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-maroon-50/60 border border-maroon-100 rounded-2xl p-4 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-maroon-800">
                <span>Subtotal</span>
                <span className="font-mono">
                  ৳{(selectedOrder.subtotal || (selectedOrder.total - (selectedOrder.deliveryCharge || 0) + (selectedOrder.discountAmount ?? selectedOrder.discount ?? 0))).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-maroon-800">
                <span>Delivery Fee</span>
                <span className="font-mono">৳{(selectedOrder.deliveryCharge || 0).toFixed(2)}</span>
              </div>
              {Boolean((selectedOrder.discountAmount ?? selectedOrder.discount ?? 0) > 0) && (
                <div className="flex items-center justify-between text-emerald-800 font-semibold">
                  <span>Discount</span>
                  <span className="font-mono">-৳{(selectedOrder.discountAmount ?? selectedOrder.discount ?? 0).toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-maroon-200 flex items-center justify-between text-sm font-bold text-maroon-900">
                <span>Grand Total (Cash On Delivery)</span>
                <span className="font-mono">৳{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
