"use client";

import { use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ArrowLeft,
  Package,
  MapPin,
  Phone,
  User,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import { useOrderDetailsQuery } from "@/hooks/useOrderQueries";
import { OrderSuccessSkeleton } from "@/components/skeletons";

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
    return <OrderSuccessSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
        <main className="flex-1 flex flex-col items-center justify-center p-4">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-off-white text-text-main flex flex-col font-sans">
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-maroon-100 overflow-hidden">
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
                  <span>Customer Details</span>
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
                <p className="text-maroon-800 font-medium leading-relaxed">{order.shippingAddress}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-maroon-600 bg-white px-2 py-0.5 rounded border border-maroon-200">
                  {order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-serif font-bold text-base text-maroon-900 flex items-center space-x-2">
                <ShoppingBag className="w-4 h-4 text-maroon-700" />
                <span>Order Summary Items</span>
              </h3>

              <div className="divide-y divide-maroon-100 border border-maroon-100 rounded-xl overflow-hidden bg-off-white/50">
                {items.map((item: any, idx: number) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-semibold text-maroon-900">{item.productName}</h4>
                        {item.size && (
                          <span className="text-[10px] font-bold font-mono text-maroon-700 bg-white border border-maroon-200 px-1.5 py-0.2 rounded-sm">
                            {item.size}
                          </span>
                        )}
                      </div>
                      <span className="text-maroon-600 text-[11px] font-mono">
                        ৳{item.unitPrice.toFixed(2)} × {item.quantity}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-maroon-900">
                      ৳{(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-off-white rounded-xl border border-maroon-100 space-y-2 text-xs font-sans">
              <div className="flex justify-between text-maroon-700">
                <span>Items Subtotal</span>
                <span className="font-mono font-semibold">৳{order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-maroon-700">
                <span>Delivery Charge</span>
                <span className="font-mono font-semibold">৳{order.deliveryCharge.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-maroon-200/60 flex justify-between text-sm font-bold text-maroon-900">
                <span>Grand Total</span>
                <span className="font-mono text-base text-maroon-900">৳{order.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-md shadow transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-cream" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
