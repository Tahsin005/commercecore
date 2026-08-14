import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Heart,
  ArrowRight,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-maroon-900 text-white border-t border-maroon-800 font-sans mt-auto">
      <div className="border-b border-maroon-800/80 bg-maroon-900/80 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
          <div className="flex items-center space-x-3 p-3.5 bg-maroon-900/50 rounded-xl border border-maroon-800/80 shadow-xs">
            <div className="p-2.5 bg-maroon-800/90 border border-maroon-700 rounded-lg text-cream shrink-0">
              <Truck className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Fast Nationwide Delivery</h4>
              <p className="text-[11px] text-maroon-200 mt-0.5">Inside Dhaka ৳60 &bull; Outside Dhaka ৳120</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 bg-maroon-900/50 rounded-xl border border-maroon-800/80 shadow-xs">
            <div className="p-2.5 bg-maroon-800/90 border border-maroon-700 rounded-lg text-cream shrink-0">
              <CreditCard className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Cash on Delivery</h4>
              <p className="text-[11px] text-maroon-200 mt-0.5">Pay safely when you receive your package</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3.5 bg-maroon-900/50 rounded-xl border border-maroon-800/80 shadow-xs sm:col-span-2 md:col-span-1">
            <div className="p-2.5 bg-maroon-800/90 border border-maroon-700 rounded-lg text-cream shrink-0">
              <ShieldCheck className="w-5 h-5 text-cream" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">100% Authentic Quality</h4>
              <p className="text-[11px] text-maroon-200 mt-0.5">Curated premium fabrics &amp; products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8">
        {/* Brand Column */}
        <div className="sm:col-span-2 md:col-span-5 space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-cream transition-colors shrink-0">
              <Image
                src="/logo.png"
                alt="CommerceCore Logo"
                width={32}
                height={32}
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white group-hover:text-cream transition-colors">
              CommerceCore
            </span>
          </Link>

          <p className="text-xs text-maroon-200 leading-relaxed max-w-sm font-sans">
            CommerceCore is a premium full-stack e-commerce platform delivering high quality collections, seamless variant ordering, and fast Cash-on-Delivery nationwide.
          </p>
        </div>

        {/* Quick Navigation Links */}
        <div className="md:col-span-3 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cream font-serif">Quick Navigation</h4>
          <ul className="space-y-2.5 text-xs text-maroon-200 font-sans">
            <li>
              <Link href="/" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>Shop Products</span>
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>View Checkout</span>
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>Account Login</span>
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-white transition-colors flex items-center space-x-1.5">
                <ArrowRight className="w-3 h-3 text-cream/70 shrink-0" />
                <span>Register Account</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Support & Shipping info */}
        <div className="md:col-span-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cream font-serif">Delivery &amp; Support</h4>
          <p className="text-xs text-maroon-200 leading-relaxed font-sans">
            Need help with your order? Our support team ensures quick dispatch and real-time order receipts upon checkout.
          </p>
          <div className="pt-1">
            <span className="inline-block text-[11px] font-semibold text-cream bg-maroon-800 border border-maroon-700 px-3 py-1.5 rounded-md shadow-xs">
              Order Helpline: Support Active 24/7
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Strip */}
      <div className="border-t border-maroon-800/80 bg-maroon-900 py-4 text-xs text-maroon-200 font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p>&copy; {new Date().getFullYear()} CommerceCore. All rights reserved.</p>
          <p className="flex items-center justify-center space-x-1 text-[11px] text-maroon-200">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for seamless e-commerce</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
