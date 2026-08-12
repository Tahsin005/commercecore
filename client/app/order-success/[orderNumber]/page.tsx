"use client";

import { use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Package,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import { useOrderDetailsQuery } from "@/hooks/useOrderQueries";

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const { orderNumber } = use(params);

  // react Query hook for order receipt details
  const { data: response, isLoading, error } = useOrderDetailsQuery(orderNumber);
  
  const order = response?.data?.order;
  const items = response?.data?.items || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="flex items-center space-x-3 text-maroon-700 bg-white p-6 px-8 rounded-xl shadow-md border border-maroon-100">
          <Loader2 className="w-6 h-6 animate-spin text-maroon-700" />
          <span className="text-sm font-semibold text-maroon-900">Loading order receipt...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-off-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-maroon-100 text-center space-y-4">
          <Package className="w-12 h-12 text-maroon-300 mx-auto" />
          <h1 className="text-2xl font-serif font-bold text-maroon-900">Order Not Found</h1>
          <p className="text-xs text-maroon-700">{error?.message || "Could not retrieve order receipt."}</p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-maroon-900 text-white font-medium text-xs rounded-md shadow hover:bg-maroon-800 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans justify-center items-center p-4 sm:p-6">
      <main className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-maroon-100 overflow-hidden">
        <div className="bg-maroon-900 p-8 sm:p-10 text-white text-center space-y-3">
          <div className="w-14 h-14 bg-white/10 border border-maroon-700 rounded-full flex items-center justify-center mx-auto text-cream shadow-inner">
            <CheckCircle2 className="w-8 h-8 text-cream" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            Order Confirmed!
          </h1>
          <p className="text-xs text-maroon-200 font-sans max-w-md mx-auto">
            Thank you for your purchase. Your order has been placed successfully and is being processed.
          </p>
          <div className="inline-block bg-maroon-800 border border-maroon-700 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-cream tracking-wide">
            Order #{order.orderNumber}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900 text-xs font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>
              Payment Method: <strong>Cash on Delivery</strong> (Pay ৳{order.total.toFixed(2)} upon delivery)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-2">
              <h3 className="font-semibold text-maroon-900 border-b border-maroon-200/60 pb-1 flex items-center space-x-1.5">
                <User className="w-3.5 h-3.5 text-maroon-700" />
                <span>Customer Contact</span>
              </h3>
              <p className="text-maroon-800 font-medium">{order.customerName}</p>
              <p className="text-maroon-700 flex items-center space-x-1">
                <Phone className="w-3 h-3 text-maroon-500" />
                <span>{order.phone}</span>
              </p>
            </div>

            <div className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-2">
              <h3 className="font-semibold text-maroon-900 border-b border-maroon-200/60 pb-1 flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-maroon-700" />
                <span>Shipping Address</span>
              </h3>
              <p className="text-maroon-800 font-medium line-clamp-2">{order.shippingAddress}</p>
              <p className="text-[11px] text-maroon-600 uppercase tracking-wider font-semibold">
                Area: {order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-serif font-bold text-maroon-900 border-b border-maroon-100 pb-2">
              Order Items ({items.length})
            </h3>
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {items.map((item: any) => (
                <div
                  key={item._id || item.id}
                  className="flex items-center justify-between p-3 bg-off-white rounded-xl border border-maroon-100 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white border border-maroon-200 rounded-md flex items-center justify-center text-maroon-700">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-maroon-900 line-clamp-1">
                        {item.productName || item.productId?.name || "Product"}
                      </h4>
                      <span className="text-[11px] text-maroon-600 font-mono">
                        Qty: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-maroon-900">
                    ৳{(item.unitPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-maroon-100 space-y-1.5 text-xs font-sans">
            <div className="flex justify-between text-maroon-700">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">৳{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-maroon-700">
              <span>Delivery Fee</span>
              <span className="font-mono font-semibold">৳{order.deliveryCharge.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-maroon-100 flex justify-between text-sm font-bold text-maroon-900">
              <span>Total Paid / Due</span>
              <span className="text-lg font-mono text-maroon-900">৳{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-3 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow-md transition-all flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
