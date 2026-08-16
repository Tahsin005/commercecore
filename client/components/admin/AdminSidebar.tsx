"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Star,
  Settings,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Categories", href: "/admin/categories", icon: Tag },
    { label: "Reviews", href: "/admin/reviews", icon: Star },
    { label: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <>
      {!collapsed && (
        <div
          onClick={onToggleCollapse}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs transition-opacity animate-in fade-in"
        />
      )}

      <div className={`shrink-0 transition-all duration-300 ${collapsed ? "w-16" : "w-16 lg:w-64"}`}>
        <aside
          className={`bg-maroon-900 text-white border-r border-maroon-800 transition-all duration-300 flex flex-col justify-between h-screen fixed top-0 left-0 overflow-hidden ${
            collapsed
              ? "w-16 z-30"
              : "z-50 w-64 shadow-2xl lg:z-30 lg:w-64"
          }`}
        >
          <div>
            {collapsed ? (
              <div className="h-16 border-b border-maroon-800 flex items-center justify-center px-2">
                <button
                  onClick={onToggleCollapse}
                  className="p-2 bg-maroon-800 hover:bg-maroon-700 text-cream hover:text-white border border-maroon-700 rounded-lg transition-colors cursor-pointer flex items-center justify-center shadow-xs"
                  title="Expand Admin Sidebar"
                >
                  <ChevronRight className="w-4 h-4 text-cream" />
                </button>
              </div>
            ) : (
              <div className="h-16 border-b border-maroon-800 flex items-center justify-between px-4">
                <Link href="/admin" className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-1 bg-white rounded-md shrink-0">
                    <Image
                      src="/logo.png"
                      alt="CommerceCore Admin"
                      width={28}
                      height={28}
                      className="w-6 h-6 object-contain"
                    />
                  </div>
                  <span className="font-serif font-bold text-lg text-white truncate tracking-tight">
                    Admin Panel
                  </span>
                </Link>

                <button
                  onClick={onToggleCollapse}
                  className="p-1.5 text-maroon-200 hover:text-white hover:bg-maroon-800 rounded-md transition-colors cursor-pointer flex items-center justify-center shrink-0"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}

            <nav className="p-3 space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                      isActive
                        ? "bg-cream text-maroon-900 font-bold shadow-sm"
                        : "text-maroon-200 hover:bg-maroon-800 hover:text-white"
                    }`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-maroon-900" : "text-cream/80"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-maroon-800">
            <Link
              href="/"
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-maroon-800/80 hover:bg-maroon-800 text-cream transition-all border border-maroon-700/80 ${
                collapsed ? "justify-center" : ""
              }`}
              title="Return to Customer Storefront"
            >
              <ExternalLink className="w-4 h-4 shrink-0 text-cream" />
              {!collapsed && <span className="truncate">View Storefront</span>}
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
