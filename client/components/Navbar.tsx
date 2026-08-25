"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Tag,
  User,
  Search,
  Loader2,
  Package,
} from "lucide-react";

import InfiniteScroll from "react-infinite-scroll-component";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useInfiniteProductsQuery } from "@/hooks/useProductQueries";
import { getProductDisplayPricing } from "@/hooks/useProductCardActions";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { LogoutWarningModal } from "@/components/modals/LogoutWarningModal";
import { ClaimAccountModal } from "@/components/modals/ClaimAccountModal";
import { trackSearch } from "@/lib/meta-pixel";
import { trackGaSearch } from "@/lib/gtag";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout, isHydrated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { t, language, setLanguage } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [logoutWarningOpen, setLogoutWarningOpen] = useState(false);
  const [claimModalOpen, setClaimModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchQuery.trim();
      setDebouncedQuery(trimmed);
      setActiveIndex(-1);
      if (trimmed.length >= 2) {
        trackSearch(trimmed);
        trackGaSearch(trimmed);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: searchInfiniteData,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isFetchingNextPage,
    isError: isSearchError,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteProductsQuery({
    search: debouncedQuery,
    limit: 6,
  });

  const searchResults = useMemo(() => {
    if (!debouncedQuery || !searchInfiniteData?.pages) return [];
    return searchInfiniteData.pages.flatMap((page) => page?.data?.products || []);
  }, [debouncedQuery, searchInfiniteData]);

  const showDropdown = isSearchFocused && searchQuery.trim().length > 0;
  const isDebouncing = searchQuery.trim() !== debouncedQuery;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMoreProducts = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleSelectProduct = (productId: string) => {
    setIsSearchFocused(false);
    setActiveIndex(-1);
    setSearchQuery("");
    router.push(`/product/${productId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < searchResults.length) {
        e.preventDefault();
        handleSelectProduct(searchResults[activeIndex].id);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsSearchFocused(false);
      setActiveIndex(-1);
    }
  };

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

  const brandNameParts = (t.common.rupzonCollection || "Rupzon Collection").split(" ");
  const brandFirst = brandNameParts[0] || "Rupzon";
  const brandSecond = brandNameParts.slice(1).join(" ") || "Collection";

  return (
    <>
      <header className="sticky top-0 z-40 bg-maroon-900 text-white shadow-lg border-b border-maroon-800 font-sans relative">
        <MarqueeBanner />
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-8 lg:px-12 h-20 sm:h-22 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center space-x-3.5 shrink-0 group mr-2 sm:mr-4">
            <Image
              src="/logo.png"
              alt="Rupzon Collection Logo"
              width={76}
              height={76}
              className="w-14 h-14 sm:w-18 sm:h-18 object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
              priority
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-white group-hover:text-cream transition-colors whitespace-nowrap">
                {brandFirst}
              </span>
              <span className="font-serif text-xs sm:text-sm font-semibold tracking-wider text-maroon-200 uppercase group-hover:text-cream transition-colors whitespace-nowrap mt-0.5 sm:mt-1">
                {brandSecond}
              </span>
            </div>
          </Link>

          <div ref={searchRef} className="relative flex-1 max-w-md md:max-w-xl lg:max-w-2xl xl:max-w-3xl mx-2 sm:mx-6 lg:mx-8 z-30">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-cream/70 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                role="combobox"
                aria-expanded={showDropdown}
                aria-controls="search-results-listbox"
                aria-autocomplete="list"
                aria-label={t.home?.searchPlaceholder || "Search products, code..."}
                aria-activedescendant={
                  activeIndex >= 0 && searchResults[activeIndex]
                    ? `search-option-${searchResults[activeIndex].id}`
                    : undefined
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder={t.home?.searchPlaceholder || "Search products, code..."}
                className="w-full pl-10 pr-10 py-2.5 bg-maroon-800/80 border border-maroon-700 focus:border-cream rounded-full text-xs sm:text-sm text-white placeholder-cream/60 focus:outline-none focus:ring-1 focus:ring-cream/50 transition-all shadow-inner"
              />
              <div className="absolute right-3 flex items-center space-x-1">
                {(isSearchLoading || isSearchFetching || isDebouncing) && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cream/80" />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveIndex(-1);
                    }}
                    className="p-0.5 hover:bg-maroon-700 rounded-full text-cream/70 hover:text-white transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {showDropdown && (
              <div className="fixed inset-x-3 top-[6rem] sm:absolute sm:top-full sm:inset-x-auto sm:left-0 sm:right-0 sm:mt-2 bg-white text-maroon-900 rounded-2xl sm:rounded-xl shadow-2xl border border-maroon-100 overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-1 duration-150">
                {searchResults.length > 0 ? (
                  <div id="searchScrollableDiv" className="max-h-[60vh] sm:max-h-80 overflow-y-auto scrollbar-thin">
                    <div id="search-results-listbox" role="listbox" aria-label={t.navbar?.categories || "Search Results"}>
                      <InfiniteScroll
                        dataLength={searchResults.length}
                        next={fetchMoreProducts}
                        hasMore={Boolean(hasNextPage)}
                        scrollableTarget="searchScrollableDiv"
                        loader={
                          <div className="p-3 text-center text-xs text-maroon-800 font-semibold bg-maroon-50/60 flex items-center justify-center space-x-2 border-t border-maroon-100">
                            <Loader2 className="w-4 h-4 animate-spin text-maroon-900 shrink-0" />
                            <span>{t.common?.loading || "Loading more items..."}</span>
                          </div>
                        }
                        className="divide-y divide-maroon-50"
                      >
                        {searchResults.map((product, index) => {
                          const isSelected = activeIndex === index;
                          const {
                            regularPrice,
                            hasDiscount,
                            effectivePrice,
                          } = getProductDisplayPricing(product);
                          const hasImage = Boolean(product.images && product.images.length > 0);

                          return (
                            <button
                              key={product.id}
                              type="button"
                              role="option"
                              id={`search-option-${product.id}`}
                              aria-selected={isSelected}
                              onClick={() => handleSelectProduct(product.id)}
                              onMouseEnter={() => setActiveIndex(index)}
                              className={`w-full text-left p-3 sm:p-2.5 flex items-center space-x-3 cursor-pointer transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-200 ${
                                isSelected ? "bg-maroon-100/90" : "hover:bg-maroon-50/90"
                              }`}
                            >
                              <div className="relative w-12 h-12 sm:w-11 sm:h-11 rounded-xl sm:rounded-lg bg-off-white overflow-hidden shrink-0 border border-maroon-100 flex items-center justify-center">
                                {hasImage ? (
                                  <Image
                                    src={product.images![0]}
                                    alt={product.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <Package className="w-5 h-5 text-maroon-300" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-bold text-maroon-900 group-hover:text-maroon-700 truncate">
                                  {product.name}
                                </h4>
                                {product.categoryId && typeof product.categoryId === "object" && (
                                  <span className="text-[10px] text-maroon-600 font-medium block truncate">
                                    {product.categoryId.name}
                                  </span>
                                )}
                                <div className="flex items-baseline space-x-1.5 mt-0.5 font-mono text-xs font-bold text-maroon-900">
                                  <span>৳{effectivePrice.toFixed(2)}</span>
                                  {hasDiscount && (
                                    <span className="text-[10px] text-maroon-700/50 line-through font-normal">
                                      ৳{regularPrice.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </InfiniteScroll>
                    </div>
                  </div>
                ) : isSearchError ? (
                  <div className="p-4 text-center text-xs text-red-600 font-medium">
                    {t.common?.error || "An error occurred"}
                  </div>
                ) : isSearchLoading || isDebouncing ? (
                  <div className="p-4 flex items-center justify-center space-x-2 text-xs text-maroon-600 font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-maroon-800" />
                    <span>{t.common?.loading || "Searching..."}</span>
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-maroon-600 font-medium">
                    {t.navbar?.noProductsFoundFor
                      ? t.navbar.noProductsFoundFor(searchQuery)
                      : `No products found for "${searchQuery}"`}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-semibold text-xs rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer shadow-xs"
              title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            >
              <Globe className="w-3.5 h-3.5 text-cream" />
              <span className="font-mono uppercase">{language === "bn" ? "EN" : "বাংলা"}</span>
            </button>

            <button
              onClick={openCartDrawer}
              className="px-4 py-2.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-medium text-xs rounded-lg transition-all flex items-center space-x-2 cursor-pointer shadow-sm whitespace-nowrap"
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
              className="px-4 py-2.5 bg-maroon-800 hover:bg-maroon-700 active:scale-[0.98] border border-maroon-700 text-cream font-medium text-xs rounded-lg flex items-center space-x-2 shadow-sm whitespace-nowrap cursor-pointer transition-all"
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
                  <div className="flex items-center space-x-2 pl-2 border-l border-maroon-700">
                    <Link
                      href="/profile"
                      className="px-3 py-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-lg text-cream hover:text-white text-xs transition-all flex items-center space-x-1.5 cursor-pointer max-w-[140px]"
                      title={t.navbar.profileTooltip || "View Profile & Orders"}
                    >
                      <User className="w-3.5 h-3.5 text-cream shrink-0" />
                      <span className="font-medium truncate">{user.name}</span>
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="p-2 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white rounded-lg text-xs transition-all flex items-center space-x-1 cursor-pointer"
                      title={t.navbar.signOut}
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="px-4 py-2.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 text-cream hover:text-white font-medium text-xs rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t.navbar.signIn}</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2 animate-pulse">
                <div className="w-20 h-9 bg-maroon-800/80 border border-maroon-700/60 rounded-lg" />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <button
              onClick={toggleLanguage}
              className="hidden min-[500px]:flex p-2.5 bg-maroon-800 border border-maroon-700 rounded-lg text-cream font-bold text-xs items-center space-x-1"
              title={language === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
            >
              <Globe className="w-4 h-4 text-cream" />
              <span className="font-mono uppercase">{language === "bn" ? "EN" : "বাং"}</span>
            </button>

            <button
              onClick={openWishlistDrawer}
              className="hidden min-[500px]:flex relative p-2.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-lg text-cream items-center justify-center cursor-pointer transition-colors"
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
              className="relative p-2.5 bg-maroon-800 border border-maroon-700 rounded-lg text-cream flex items-center justify-center cursor-pointer"
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
              className="p-2.5 bg-maroon-800 hover:bg-maroon-700 border border-maroon-700 rounded-lg text-cream hover:text-white transition-all cursor-pointer"
              aria-label={t.navbar.toggleMenu}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 z-50 border-t border-b border-maroon-800 bg-maroon-900/95 backdrop-blur-md px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            {isHydrated && isAuthenticated && (
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-maroon-800 text-cream text-xs font-semibold uppercase tracking-wider"
              >
                <User className="w-4 h-4" />
                <span>{t.navbar.profile || "My Profile"}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                openWishlistDrawer();
              }}
              className="min-[500px]:hidden w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-maroon-800 text-cream text-xs font-semibold uppercase tracking-wider cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <Heart className={`w-4 h-4 text-cream ${wishlistCount > 0 ? "fill-cream" : ""}`} />
                <span>{t.navbar.wishlist}</span>
              </div>
              {isHydrated && wishlistCount > 0 && (
                <span className="bg-cream text-maroon-900 font-extrabold text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border border-maroon-900 shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                toggleLanguage();
              }}
              className="min-[500px]:hidden w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-maroon-800 text-cream text-xs font-semibold uppercase tracking-wider cursor-pointer text-left"
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-cream" />
                <span>{language === "bn" ? "English Version" : "বাংলা সংস্করণ"}</span>
              </div>
              <span className="font-mono text-[10px] bg-maroon-800 border border-maroon-700 px-2 py-0.5 rounded text-cream">
                {language === "bn" ? "EN" : "বাংলা"}
              </span>
            </button>

            <Link
              href="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-maroon-800 text-cream text-xs font-semibold uppercase tracking-wider"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.navbar.checkout}</span>
            </Link>


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
