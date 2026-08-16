"use client";

import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Plus,
  Tag,
  Star,
  Settings,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShieldCheck,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
} from "lucide-react";

import { useAdminOrdersQuery, OrderStatus } from "@/hooks/useAdminOrderQueries";
import { useProductsQuery } from "@/hooks/useProductQueries";
import { useCategoriesQuery } from "@/hooks/useCategoryQueries";
import { useAdminReviewsQuery } from "@/hooks/useReviewQueries";
import { useAdminUsersQuery } from "@/hooks/useUserQueries";

const statusColorMap: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200" },
  PROCESSING: { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-200" },
  SHIPPED: { bg: "bg-indigo-50", text: "text-indigo-900", border: "border-indigo-200" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-900", border: "border-red-200" },
  RETURNED: { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-300" },
};

export default function AdminDashboardPage() {
  const { data: ordersRes, isLoading: isOrdersLoading, error: ordersError, refetch: refetchOrders } = useAdminOrdersQuery({
    limit: 6,
  });

  const { data: productsRes, isLoading: isProductsLoading, error: productsError, refetch: refetchProducts } = useProductsQuery();
  const { data: categoriesRes, error: categoriesError, refetch: refetchCategories } = useCategoriesQuery();
  const { data: reviewsRes, error: reviewsError, refetch: refetchReviews } = useAdminReviewsQuery();
  const { data: usersRes, isLoading: isUsersLoading, error: usersError, refetch: refetchUsers } = useAdminUsersQuery();

  const handleRefreshAll = () => {
    refetchOrders();
    refetchProducts();
    refetchCategories();
    refetchReviews();
    refetchUsers();
  };

  const ordersData = ordersRes?.data;
  const orders = ordersData?.orders || [];
  const stats = ordersData?.stats;

  const rawProducts = productsRes?.data;
  const products = Array.isArray(rawProducts) ? rawProducts : rawProducts?.products || [];
  const totalProducts = products.length;
  const outOfStockCount = products.filter((p) => (p.quantity || 0) <= 0).length;
  const categoriesCount = categoriesRes?.data?.length || 0;
  const reviewsCount = reviewsRes?.stats?.total ?? reviewsRes?.reviews?.length ?? 0;

  const userData = usersRes?.data;
  const userStats = userData?.stats;
  const recentUsers = userData?.users || [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-maroon-900">
            Executive Admin Control Panel
          </h1>
          <p className="text-xs text-maroon-700 mt-1">
            Real-time store metrics, order fulfillment updates, customer analytics, and catalog health
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleRefreshAll}
            className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 font-medium text-xs rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Refresh Dashboard Stats"
          >
            <RefreshCw className="w-3.5 h-3.5 text-maroon-700" />
            <span>Refresh Stats</span>
          </button>

          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-maroon-900 hover:bg-maroon-800 active:scale-[0.98] text-white font-medium text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cream" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-maroon-600 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl font-bold font-mono text-maroon-900 block">
              {ordersError ? "Unavailable" : isOrdersLoading ? "..." : `৳${stats?.totalRevenue ? stats.totalRevenue.toFixed(2) : "0.00"}`}
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <TrendingUp className="w-3 h-3 mr-1 text-emerald-700" /> Confirmed Sales
            </span>
          </div>
          <div className="p-3 bg-maroon-50 border border-maroon-200/80 rounded-xl text-maroon-800 group-hover:scale-105 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-maroon-600 uppercase tracking-wider block">
              Total Orders
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 block">
              {ordersError ? "Unavailable" : isOrdersLoading ? "..." : stats?.totalOrders ?? 0}
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              <Clock className="w-3 h-3 mr-1 text-amber-700" /> {ordersError ? 0 : stats?.pendingOrders ?? 0} Pending
            </span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-800 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-maroon-600 uppercase tracking-wider block">
              Products Catalog
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 block">
              {productsError ? "Unavailable" : isProductsLoading ? "..." : totalProducts}
            </span>
            <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${
              productsError || outOfStockCount > 0
                ? "bg-red-50 text-red-900 border-red-200"
                : "bg-emerald-50 text-emerald-900 border-emerald-200"
            }`}>
              <AlertTriangle className="w-3 h-3 mr-1 text-red-600" /> {productsError ? "Error" : `${outOfStockCount} Out of Stock`}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-800 group-hover:scale-105 transition-transform">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-maroon-600 uppercase tracking-wider block">
              Customer Accounts
            </span>
            <span className="text-2xl font-bold font-serif text-maroon-900 block">
              {usersError ? "Unavailable" : isUsersLoading ? "..." : userStats?.totalUsers ?? 0}
            </span>
            <span className="inline-flex items-center text-[10px] font-semibold text-purple-900 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              <UserCheck className="w-3 h-3 mr-1 text-purple-700" /> {usersError ? "Unavailable" : `${userStats?.registeredUsers ?? 0} Password / ${userStats?.guestUsers ?? 0} Guest`}
            </span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200/80 rounded-xl text-purple-800 group-hover:scale-105 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        <Link
          href="/admin/orders"
          className="p-3.5 bg-white hover:bg-maroon-50 border border-maroon-100 rounded-xl shadow-2xs flex items-center space-x-3 text-maroon-900 hover:text-maroon-800 transition-all cursor-pointer group"
        >
          <div className="p-2 bg-amber-100 text-amber-900 rounded-lg group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Orders</span>
            <span className="text-[10px] text-maroon-600">Fulfillment & Status</span>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="p-3.5 bg-white hover:bg-maroon-50 border border-maroon-100 rounded-xl shadow-2xs flex items-center space-x-3 text-maroon-900 hover:text-maroon-800 transition-all cursor-pointer group"
        >
          <div className="p-2 bg-emerald-100 text-emerald-900 rounded-lg group-hover:scale-110 transition-transform">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Products</span>
            <span className="text-[10px] text-maroon-600">{productsError ? "Unavailable" : `${totalProducts} active items`}</span>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="p-3.5 bg-white hover:bg-maroon-50 border border-maroon-100 rounded-xl shadow-2xs flex items-center space-x-3 text-maroon-900 hover:text-maroon-800 transition-all cursor-pointer group"
        >
          <div className="p-2 bg-blue-100 text-blue-900 rounded-lg group-hover:scale-110 transition-transform">
            <Tag className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Categories</span>
            <span className="text-[10px] text-maroon-600">{categoriesError ? "Unavailable" : `${categoriesCount} categories`}</span>
          </div>
        </Link>

        <Link
          href="/admin/reviews"
          className="p-3.5 bg-white hover:bg-maroon-50 border border-maroon-100 rounded-xl shadow-2xs flex items-center space-x-3 text-maroon-900 hover:text-maroon-800 transition-all cursor-pointer group"
        >
          <div className="p-2 bg-amber-100 text-amber-900 rounded-lg group-hover:scale-110 transition-transform">
            <Star className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Reviews</span>
            <span className="text-[10px] text-maroon-600">{reviewsError ? "Unavailable" : `${reviewsCount} reviews`}</span>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="p-3.5 bg-white hover:bg-maroon-50 border border-maroon-100 rounded-xl shadow-2xs flex items-center space-x-3 text-maroon-900 hover:text-maroon-800 transition-all cursor-pointer group"
        >
          <div className="p-2 bg-purple-100 text-purple-900 rounded-lg group-hover:scale-110 transition-transform">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold block">Settings</span>
            <span className="text-[10px] text-maroon-600">Site & CMS Config</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden">
            <div className="p-5 border-b border-maroon-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base text-maroon-900">Recent Customer Orders</h3>
                <p className="text-xs text-maroon-700">Latest checkout requests submitted nationwide</p>
              </div>
              <Link
                href="/admin/orders"
                className="inline-flex items-center space-x-1 text-xs font-bold text-maroon-900 hover:text-maroon-700 bg-maroon-50 hover:bg-maroon-100 px-3 py-1.5 rounded-lg border border-maroon-200 transition-colors cursor-pointer"
              >
                <span>View All Orders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {isOrdersLoading ? (
              <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-2">
                <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
                <p className="text-xs font-medium">Loading recent orders...</p>
              </div>
            ) : ordersError ? (
              <div className="p-8 text-center text-maroon-900 space-y-2">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <p className="font-serif font-bold text-base">Failed to load orders</p>
                <p className="text-xs text-maroon-700">{ordersError.message || "An error occurred"}</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-maroon-700 space-y-2">
                <ShoppingBag className="w-12 h-12 text-maroon-300 mx-auto" />
                <p className="font-serif font-bold text-base text-maroon-900">No Orders Found</p>
                <p className="text-xs text-maroon-600">When customers place orders, they will appear here live.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-maroon-900 font-sans">
                  <thead className="bg-maroon-900 text-white font-serif uppercase tracking-wider text-[11px] border-b border-maroon-800">
                    <tr>
                      <th className="py-3 px-5 font-semibold">Order #</th>
                      <th className="py-3 px-5 font-semibold">Customer</th>
                      <th className="py-3 px-5 font-semibold">Phone</th>
                      <th className="py-3 px-5 font-semibold">Total</th>
                      <th className="py-3 px-5 font-semibold text-center">Status</th>
                      <th className="py-3 px-5 font-semibold text-right">Date</th>
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
                          <td className="py-3.5 px-5 font-mono font-bold text-maroon-900">
                            <Link href="/admin/orders" className="hover:underline">
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className="font-bold text-maroon-900 block">{order.customerName}</span>
                            <span className="text-[10px] text-maroon-600 capitalize">
                              {order.deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 font-mono text-maroon-800">{order.phone}</td>
                          <td className="py-3.5 px-5 font-mono font-bold text-maroon-900">
                            ৳{order.total.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right font-mono text-[11px] text-maroon-600">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-maroon-800" />
                <h3 className="font-serif font-bold text-base text-maroon-900">Users Info</h3>
              </div>
              <span className="text-xs font-mono font-bold text-maroon-900 bg-maroon-100 px-2.5 py-0.5 rounded-md">
                {usersError ? "Unavailable" : isUsersLoading ? "..." : `${userStats?.totalUsers ?? 0} Accounts`}
              </span>
            </div>

            {usersError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-1">
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                <p className="text-xs font-bold text-red-900">Failed to load user accounts</p>
                <p className="text-[10px] text-red-700">{usersError.message || "An error occurred"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wider block">
                      Registered (Password)
                    </span>
                    <span className="text-xl font-bold font-serif text-purple-950 block">
                      {isUsersLoading ? "..." : userStats?.registeredUsers ?? 0}
                    </span>
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                      Guest Checkouts
                    </span>
                    <span className="text-xl font-bold font-serif text-amber-950 block">
                      {isUsersLoading ? "..." : userStats?.guestUsers ?? 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-maroon-900 uppercase tracking-wider block">
                    Recent Registered &amp; Guest Accounts
                  </span>

                  {isUsersLoading ? (
                    <div className="p-4 text-center text-maroon-600">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto text-maroon-700" />
                    </div>
                  ) : recentUsers.length === 0 ? (
                    <p className="text-xs text-maroon-600 italic">No user accounts created yet.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {recentUsers.map((u) => (
                        <div
                          key={u.id}
                          className="p-2.5 bg-off-white border border-maroon-100 rounded-xl flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5 truncate mr-2">
                            <span className="font-bold text-maroon-900 block truncate">{u.name}</span>
                            <span className="text-[10px] text-maroon-600 font-mono block truncate">
                              {u.email || u.phone}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            {u.hasPassword ? (
                              <span className="inline-flex items-center text-[9px] font-bold text-purple-900 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                                <ShieldCheck className="w-2.5 h-2.5 mr-0.5 text-purple-700" /> Password
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-[9px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                                <Clock className="w-2.5 h-2.5 mr-0.5 text-amber-700" /> Guest
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-maroon-800" />
                <h3 className="font-serif font-bold text-base text-maroon-900">Inventory Health</h3>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-bold text-maroon-800 hover:text-maroon-900 underline cursor-pointer"
              >
                Manage Stock
              </Link>
            </div>

            {productsError ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center space-y-1">
                <AlertTriangle className="w-5 h-5 text-red-600 mx-auto" />
                <p className="text-xs font-bold text-red-900">Failed to load inventory status</p>
                <p className="text-[10px] text-red-700">{productsError.message || "An error occurred"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-maroon-700">Stock Status Ratio</span>
                  <span className="font-mono text-maroon-900">
                    {totalProducts - outOfStockCount} / {totalProducts} In Stock
                  </span>
                </div>

                <div className="w-full h-2.5 bg-red-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-600 h-full transition-all"
                    style={{
                      width: `${totalProducts > 0 ? ((totalProducts - outOfStockCount) / totalProducts) * 100 : 100}%`,
                    }}
                  />
                </div>

                {outOfStockCount > 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-900 text-xs font-semibold">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{outOfStockCount} product(s) currently require stock replenishment.</span>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-emerald-900 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>All catalog items have available inventory units.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
