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
  LayoutDashboard,
  Globe,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { LogoutWarningModal } from "@/components/modals/LogoutWarningModal";
import { ClaimAccountModal } from "@/components/modals/ClaimAccountModal";

export function Navbar() {
  const { user, isAuthenticated, logout, isHydrated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { t, language, setLanguage } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [logoutWarningOpen, setLogoutWarningOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);
  const openCartDrawer = () => setCartDrawerOpen(true);
  const closeCartDrawer = () => setCartDrawerOpen(false);
  const openWishlistDrawer = () => setWishlistDrawerOpen(true);
  const closeWishlistDrawer = () => setWishlistDrawerOpen(false);

  const toggleLanguage = () => {
    setLanguage(language === "bn" ? "en" : "bn");
  };

  const handleLogoutClick = () => {
    if (user && user.hasPassword === false) {
      setLogoutWarningOpen(true);
    } else {
      logout();
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-maroon-900 text-white shadow-lg border-b border-maroon-800 font-sans">
        <MarqueeBanner />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 shrink-0 group mr-4">
            <div className="p-1.5 bg-white rounded-lg shadow-sm group-hover:bg-cream transition-colors shrink-0">
              <Image
                src="/logo.png"
                alt="CommerceCore Logo"
                width={36}
                height={36}
                className="w-7 h-7 object-contain"
              />
            </div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-cream transition-colors whitespace-nowrap">
              {t.common.commerceCore}
            </span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-5">
            <Link
              href="/"
              className="text-xs font-semibold uppercase tracking-wider text-cream/90 hover:text-white transition-colors flex items-center space-x-1.5 whitespace-nowrap"
            >
              <HomeIcon className="w-3.5 h-3.5" />
              <span>{t.navbar.home}</span>
            </Link>
            <Link
              href="/checkout"
              className="text-xs font-semibold uppercase tracking-wider text-cream/90 hover:text-white transition-colors flex items-center space-x-1.5 whitespace-nowrap"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t.navbar.checkout}</span>
            </Link>

            {isHydrated && isAuthenticated && user?.isAdmin && (
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-cream text-maroon-900 hover:bg-white font-bold text-xs rounded-md shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-maroon-900" />
                <span>{t.navbar.adminPanel}</span>
              </Link>
            )}
          </nav>

          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-semibold text-xs rounded-md transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            >
              <Globe className="w-3.5 h-3.5 text-cream" />
              <span className="font-mono uppercase">{language === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            <button
              onClick={openCartDrawer}
              className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-medium text-xs rounded-md transition-all flex items-center space-x-2 cursor-pointer shadow-sm whitespace-nowrap"
              title={t.navbar.openCart}
            >
              <ShoppingCart className="w-4 h-4 text-cream" />
              <span>{t.navbar.cart}</span>
              {!isHydrated ? (
                <span className="bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse" />
              ) : (
                <span className="bg-cream text-maroon-900 font-mono font-bold text-xs px-1.5 py-0.2 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={openWishlistDrawer}
              className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-700 active:scale-[0.98] border border-maroon-700 text-cream font-medium text-xs rounded-md flex items-center space-x-2 shadow-sm whitespace-nowrap cursor-pointer transition-all"
              title={t.navbar.wishlist}
            >
              <Heart className={`w-4 h-4 text-cream ${wishlistCount > 0 ? "fill-cream" : ""}`} />
              <span>{t.navbar.wishlist}</span>
              {!isHydrated ? (
                <span className="bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse" />
              ) : wishlistCount > 0 ? (
                <span className="bg-cream text-maroon-900 font-extrabold text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {wishlistCount}
                </span>
              ) : (
                <span className="text-[10px] font-bold text-cream/70 bg-maroon-900/60 px-1.5 py-0.2 rounded-full border border-maroon-700/80">
                  0
                </span>
              )}
            </button>

            {isHydrated ? (
              <div className="flex items-center space-x-2">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-2.5 pl-2 border-l border-maroon-700">
                    <span className="text-xs font-medium text-cream truncate max-w-[110px]" title={user.name}>
                      {t.navbar.hi}, {user.name}
                    </span>
                    <button
                      onClick={handleLogoutClick}
                      className="p-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white rounded-md text-xs transition-all flex items-center space-x-1 cursor-pointer"
                      title={t.navbar.signOut}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-3.5 py-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-medium text-xs rounded-md transition-all flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t.navbar.signIn}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-20 h-8 bg-maroon-800/80 border border-maroon-700/60 rounded-md" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={toggleLanguage}
              className="p-2 bg-maroon-800 border border-maroon-700 rounded-md text-cream font-bold text-xs flex items-center space-x-1"
              title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            >
              <Globe className="w-4 h-4 text-cream" />
              <span className="font-mono uppercase">{language === "bn" ? "EN" : "বাং"}</span>
            </button>

            <button
              onClick={openWishlistDrawer}
              className="relative p-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-md text-cream flex items-center justify-center cursor-pointer transition-colors"
              title={t.navbar.wishlist}
            >
              <Heart className={`w-4 h-4 text-cream ${wishlistCount > 0 ? "fill-cream" : ""}`} />
              {!isHydrated ? (
                <span className="absolute -top-1.5 -right-1.5 bg-maroon-700/80 w-4 h-4 rounded-full animate-pulse" />
              ) : wishlistCount > 0 ? (
                <span className="absolute -top-1.5 -right-1.5 bg-cream text-maroon-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {wishlistCount}
                </span>
              ) : null}
            </button>

            <button
              onClick={openCartDrawer}
              className="relative p-2 bg-maroon-800 border border-maroon-700 rounded-md text-cream flex items-center justify-center cursor-pointer"
              title={t.navbar.openCart}
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
              aria-label={t.navbar.toggleMenu}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-maroon-800 bg-maroon-900 px-4 py-4 space-y-3 animate-in slide-in-from-top duration-200">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-maroon-800 text-cream text-xs font-semibold uppercase tracking-wider"
            >
              <HomeIcon className="w-4 h-4" />
              <span>{t.navbar.home}</span>
            </Link>
            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-maroon-800 text-cream text-xs font-semibold uppercase tracking-wider"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.navbar.checkout}</span>
            </Link>

            {isHydrated && isAuthenticated && user?.isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-cream text-maroon-900 font-bold text-xs uppercase tracking-wider shadow-sm"
              >
                <LayoutDashboard className="w-4 h-4 text-maroon-900" />
                <span>{t.navbar.adminPanel}</span>
              </Link>
            )}

            <div className="pt-2 border-t border-maroon-800 flex items-center justify-between">
              {isHydrated ? (
                isAuthenticated && user ? (
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-cream font-medium">{t.navbar.hi}, {user.name}</span>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogoutClick();
                      }}
                      className="px-3 py-1.5 bg-maroon-800 border border-maroon-700 text-cream rounded-md text-xs font-medium flex items-center space-x-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.navbar.signOut}</span>
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2 bg-maroon-800 border border-maroon-700 text-cream text-center rounded-md text-xs font-medium flex items-center justify-center space-x-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t.navbar.signIn}</span>
                  </Link>
                )
              ) : (
                <div className="w-full h-8 bg-maroon-800/80 rounded animate-pulse" />
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawer isOpen={cartDrawerOpen} onClose={closeCartDrawer} />

      <WishlistDrawer isOpen={wishlistDrawerOpen} onClose={closeWishlistDrawer} />

      <LogoutWarningModal
        isOpen={logoutWarningOpen}
        onClose={() => setLogoutWarningOpen(false)}
        onConfirmLogout={() => logout()}
        onOpenClaimModal={() => setClaimModalOpen(true)}
      />

      <ClaimAccountModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
      />
    </>
  );
}
