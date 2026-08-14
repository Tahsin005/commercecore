"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Heart,
  LogIn,
  LogOut,
  Menu,
  X,
  Home as HomeIcon,
  ShoppingBag,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { CartDrawer } from "@/components/CartDrawer";

export function Navbar() {
  const { user, isAuthenticated, logout, isHydrated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const openCartDrawer = () => {
    closeMobileMenu();
    setCartDrawerOpen(true);
  };

  return (
    <>
      <header className="bg-maroon-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group" onClick={closeMobileMenu}>
            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-cream transition-colors">
              <Image
                src="/logo.png"
                alt="CommerceCore Logo"
                width={36}
                height={36}
                className="w-7 h-7 object-contain"
                priority
              />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-cream transition-colors">
              CommerceCore
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 text-xs font-semibold uppercase tracking-wider text-cream/90">
            <Link
              href="/"
              className="hover:text-white transition-colors flex items-center space-x-1 py-1"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <Link
              href="/checkout"
              className="hover:text-white transition-colors flex items-center space-x-1 py-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Checkout</span>
            </Link>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={openCartDrawer}
              className="relative p-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-md text-cream hover:text-white transition-all flex items-center space-x-1.5 cursor-pointer"
              title="Open Cart Drawer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-xs font-semibold">Cart</span>
              {!isHydrated ? (
                <span className="bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse inline-block" />
              ) : cartCount > 0 ? (
                <span className="bg-cream text-maroon-900 font-extrabold text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {cartCount}
                </span>
              ) : null}
            </button>

            <div
              className="relative p-2 bg-maroon-800 border border-maroon-700 rounded-md text-cream flex items-center space-x-1.5"
              title="Wishlist Items"
            >
              <Heart className={`w-4 h-4 text-cream ${wishlistCount > 0 ? "fill-cream" : ""}`} />
              <span className="text-xs font-semibold hidden lg:inline">Wishlist</span>
              {!isHydrated ? (
                <span className="bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse inline-block" />
              ) : wishlistCount > 0 ? (
                <span className="bg-cream text-maroon-900 font-extrabold text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {wishlistCount}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-cream/70 bg-maroon-900/60 px-1.5 py-0.2 rounded-full border border-maroon-700/80">
                  0
                </span>
              )}
            </div>

            {isHydrated ? (
              <div className="flex items-center space-x-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3 pl-2 border-l border-maroon-700">
                    <span className="text-xs font-medium text-cream truncate max-w-[120px]">
                      Hi, {user.name}
                    </span>
                    <button
                      onClick={logout}
                      className="p-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white rounded-md text-xs transition-all flex items-center space-x-1 cursor-pointer"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-medium text-xs rounded-md transition-all flex items-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-20 h-8 bg-maroon-800/80 border border-maroon-700/60 rounded-md" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 md:hidden">
            <div
              className="relative p-2 bg-maroon-800 border border-maroon-700 rounded-md text-cream flex items-center justify-center"
              title="Wishlist Items"
            >
              <Heart className={`w-4 h-4 text-cream ${wishlistCount > 0 ? "fill-cream" : ""}`} />
              {!isHydrated ? (
                <span className="absolute -top-1.5 -right-1.5 bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse" />
              ) : wishlistCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-cream text-maroon-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {wishlistCount}
                </span>
              ) : null}
            </div>

            <button
              onClick={openCartDrawer}
              className="relative p-2 bg-maroon-800 border border-maroon-700 rounded-md text-cream flex items-center justify-center cursor-pointer"
              title="Open Cart Drawer"
            >
              <ShoppingCart className="w-4 h-4" />
              {!isHydrated ? (
                <span className="absolute -top-1.5 -right-1.5 bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse" />
              ) : cartCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-cream text-maroon-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {cartCount}
                </span>
              ) : null}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="p-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-md text-cream hover:text-white transition-all cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-maroon-950 border-t border-maroon-800 px-4 py-4 space-y-3 shadow-inner font-sans animate-in slide-in-from-top duration-200">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-cream">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="px-3 py-2 bg-maroon-900/60 hover:bg-maroon-800 rounded-md flex items-center space-x-2"
              >
                <HomeIcon className="w-4 h-4 text-cream" />
                <span>Home</span>
              </Link>

              <button
                onClick={openCartDrawer}
                className="px-3 py-2 bg-maroon-900/60 hover:bg-maroon-800 rounded-md flex items-center justify-between text-left text-cream cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-4 h-4 text-cream" />
                  <span>View Cart Drawer</span>
                </div>
                {isHydrated && cartCount > 0 ? (
                  <span className="bg-cream text-maroon-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    {cartCount} Items
                  </span>
                ) : !isHydrated ? (
                  <span className="bg-maroon-800 w-12 h-5 rounded-full animate-pulse" />
                ) : null}
              </button>

              <Link
                href="/checkout"
                onClick={closeMobileMenu}
                className="px-3 py-2 bg-maroon-900/60 hover:bg-maroon-800 rounded-md flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-cream" />
                <span>Checkout</span>
              </Link>
            </nav>

            {isHydrated ? (
              <div className="pt-3 border-t border-maroon-800/80 flex items-center justify-between">
                {isAuthenticated && user ? (
                  <>
                    <span className="text-xs font-medium text-cream">
                      Signed in as <strong className="text-white">{user.name}</strong>
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="px-3 py-1.5 bg-maroon-800 hover:bg-maroon-700 text-cream rounded-md text-xs flex items-center space-x-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={closeMobileMenu}
                    className="w-full py-2 bg-maroon-800 hover:bg-maroon-700 text-cream text-center rounded-md text-xs font-semibold flex items-center justify-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="pt-3 border-t border-maroon-800/80 flex items-center justify-between animate-pulse">
                <div className="w-28 h-6 bg-maroon-800/80 rounded-md" />
                <div className="w-16 h-6 bg-maroon-800/80 rounded-md" />
              </div>
            )}
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
    </>
  );
}
