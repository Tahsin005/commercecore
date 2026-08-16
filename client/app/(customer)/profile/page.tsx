"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  ShieldCheck,
  Lock,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  Loader2,
  X,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  useUserAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  Address,
} from "@/hooks/useAddressQueries";
import {
  useCustomerOrdersQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  Order,
  OrderItem,
} from "@/hooks/useProfileQueries";
import toast from "react-hot-toast";

const statusColorMap: Record<string, { bg: string; text: string; border: string }> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-200" },
  PROCESSING: { bg: "bg-blue-50", text: "text-blue-900", border: "border-blue-200" },
  SHIPPED: { bg: "bg-purple-50", text: "text-purple-900", border: "border-purple-200" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-900", border: "border-emerald-200" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-900", border: "border-red-200" },
  RETURNED: { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-300" },
};

type ProfileTab = "orders" | "addresses" | "info" | "security";

export default function CustomerProfilePage() {
  const { user, isAuthenticated, isHydrated } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");

  // Orders State & Query
  const [ordersPage, setOrdersPage] = useState(1);
  const { data: ordersRes, isLoading: isOrdersLoading } = useCustomerOrdersQuery(ordersPage, 6, isAuthenticated);
  const ordersData = ordersRes?.data;
  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Addresses State & Queries
  const { data: addressesRes, isLoading: isAddressesLoading } = useUserAddressesQuery(isAuthenticated);
  const addresses = addressesRes?.data || [];
  const createAddressMutation = useCreateAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const setDefaultAddressMutation = useSetDefaultAddressMutation();

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState({
    label: "Home",
    fullAddress: "",
    city: "Dhaka",
    isDefault: false,
  });

  // Profile Info Form
  const updateProfileMutation = useUpdateProfileMutation();
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Change Password Form
  const changePasswordMutation = useChangePasswordMutation();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  if (!isHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
        <p className="text-sm font-medium text-maroon-700">{t.common.loading || "Loading profile..."}</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-maroon-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-maroon-50 rounded-full flex items-center justify-center mx-auto text-maroon-900">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-serif font-bold text-maroon-900">Sign in to view your profile</h2>
          <p className="text-xs text-maroon-700">
            Please log in or register to access your saved delivery addresses, order history, and account settings.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/login?redirect=/profile"
            className="flex-1 px-5 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all text-center"
          >
            Login
          </Link>
          <Link
            href="/signup?redirect=/profile"
            className="flex-1 px-5 py-2.5 bg-off-white hover:bg-maroon-50 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-all text-center"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  // Address Modal Helpers
  const handleOpenAddAddress = () => {
    setEditingAddress(null);
    setAddressForm({
      label: "Home",
      fullAddress: "",
      city: "Dhaka",
      isDefault: addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({
      label: addr.label || "Home",
      fullAddress: addr.fullAddress,
      city: addr.city || "Dhaka",
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullAddress.trim()) {
      toast.error("Please enter a full delivery address");
      return;
    }

    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          id: editingAddress.id,
          payload: addressForm,
        });
        toast.success("Address updated successfully!");
      } else {
        await createAddressMutation.mutateAsync(addressForm);
        toast.success("New address added successfully!");
      }
      setIsAddressModalOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (window.confirm(t.profile.confirmDeleteDesc || "Are you sure you want to delete this address?")) {
      try {
        await deleteAddressMutation.mutateAsync(id);
        toast.success("Address removed");
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete address");
      }
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await setDefaultAddressMutation.mutateAsync(id);
      toast.success("Primary default address updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to set default address");
    }
  };

  // Profile Info Submit
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync(profileForm);
      toast.success(t.profile.profileUpdatedSuccess || "Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile info");
    }
  };

  // Password Submit
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(t.profile.passwordsDoNotMatch || "New passwords do not match!");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword || undefined,
        newPassword: passwordForm.newPassword,
      });
      toast.success(t.profile.passwordChangedSuccess || "Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
      <div className="bg-maroon-900 p-6 sm:p-8 rounded-3xl text-cream shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-maroon-800">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-maroon-800 border border-maroon-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-inner">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
                {user.name || "Customer Account"}
              </h1>
              <p className="text-xs text-maroon-200 font-mono flex items-center gap-2 mt-0.5">
                <span>{user.email || user.phone}</span>
                {user.isAdmin && (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Admin
                  </span>
                )}
              </p>
            </div>
          </div>
          <p className="text-xs text-maroon-200 pt-1 max-w-xl">
            {t.profile.subtitle || "Manage your profile details, delivery addresses, order history, and security settings."}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab("info")}
            className="px-4 py-2 bg-maroon-800 hover:bg-maroon-700 text-cream text-xs font-semibold rounded-xl border border-maroon-700 transition-all flex items-center space-x-1.5 cursor-pointer shadow-2xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-maroon-200/80 pb-3">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{t.profile.myOrdersTab || "My Orders"}</span>
        </button>

        <button
          onClick={() => setActiveTab("addresses")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "addresses"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.profile.myAddressesTab || "Saved Addresses"}</span>
        </button>

        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "info"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.profile.editProfileTab || "Profile Details"}</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-maroon-900 text-white shadow-md ring-2 ring-maroon-900/30"
              : "bg-white hover:bg-maroon-50 text-maroon-800 border border-maroon-200"
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t.profile.securityTab || "Security & Password"}</span>
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "orders" && (
          <div className="space-y-4">
            {isOrdersLoading ? (
              <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-2 bg-white rounded-2xl border border-maroon-100 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
                <p className="text-xs font-medium">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
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
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((order) => {
                    const statusStyle = statusColorMap[order.status] || {
                      bg: "bg-gray-100",
                      text: "text-gray-900",
                      border: "border-gray-200",
                    };

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-maroon-100 shadow-sm p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
                            <div>
                              <span className="text-[11px] text-maroon-600 font-mono block">
                                {t.profile.orderNumberLabel || "Order #"} <strong className="text-maroon-900 font-bold">{order.orderNumber}</strong>
                              </span>
                              <span className="text-[10px] text-maroon-500 font-mono block">
                                {new Date(order.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <span
                              className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-maroon-800 uppercase tracking-wider block">
                              Items Summary ({order.items?.length || 0})
                            </span>
                            <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                              {order.items?.map((item: OrderItem, idx: number) => {
                                const name = item.productName || item.name || "Item";
                                const price = item.unitPrice !== undefined && item.unitPrice !== null ? item.unitPrice : (item.price || 0);
                                const size = item.selectedVariantLabel || item.size || "Standard";
                                return (
                                  <div key={idx} className="flex items-center justify-between text-xs text-maroon-900">
                                    <span className="truncate pr-2">{name} ({size}) × {item.quantity}</span>
                                    <span className="font-mono font-semibold shrink-0">৳{(price * item.quantity).toFixed(2)}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-maroon-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-maroon-600 uppercase tracking-wider block">Total Amount</span>
                            <span className="text-base font-bold font-mono text-maroon-900">৳{order.total.toFixed(2)}</span>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-3.5 py-1.5 bg-maroon-50 hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            {t.profile.viewDetailsBtn || "View Details"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-maroon-900">Saved Delivery Addresses</h3>
                <p className="text-xs text-maroon-700">Manage your shipping addresses for fast 1-click checkout</p>
              </div>

              <button
                onClick={handleOpenAddAddress}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-cream" />
                <span>{t.profile.addAddressBtn || "Add New Address"}</span>
              </button>
            </div>

            {isAddressesLoading ? (
              <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-2 bg-white rounded-2xl border border-maroon-100 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-maroon-800" />
                <p className="text-xs font-medium">Loading addresses...</p>
              </div>
            ) : addresses.length === 0 ? (
              <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-maroon-100 shadow-sm">
                <div className="w-16 h-16 bg-maroon-50 rounded-full flex items-center justify-center mx-auto text-maroon-800">
                  <MapPin className="w-8 h-8" />
                </div>
                <h4 className="text-base font-serif font-bold text-maroon-900">
                  {t.profile.noAddressesTitle || "No Saved Addresses"}
                </h4>
                <p className="text-xs text-maroon-700 max-w-sm mx-auto">
                  {t.profile.noAddressesDesc || "Save your delivery addresses here for faster checkout."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`bg-white rounded-2xl p-5 border shadow-sm space-y-3 flex flex-col justify-between transition-all ${
                      addr.isDefault
                        ? "border-maroon-900 ring-2 ring-maroon-900/20 bg-maroon-50/20"
                        : "border-maroon-100 hover:border-maroon-300"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center text-xs font-bold text-maroon-900 bg-maroon-100 px-2.5 py-0.5 rounded-md">
                          <Building className="w-3.5 h-3.5 mr-1 text-maroon-800" />
                          {addr.label || "Home"}
                        </span>

                        {addr.isDefault && (
                          <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
                            {t.profile.defaultBadge || "Default"}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-maroon-800 leading-relaxed font-medium pt-1">
                        {addr.fullAddress}
                      </p>
                      <p className="text-xs font-bold text-maroon-900 font-mono">
                        {addr.city}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-maroon-100 flex items-center justify-between">
                      {!addr.isDefault ? (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-maroon-700 hover:text-maroon-900 underline cursor-pointer"
                        >
                          {t.profile.setAsDefaultBtn || "Set as Default"}
                        </button>
                      ) : (
                        <span className="text-[10px] text-maroon-600 italic">Primary Address</span>
                      )}

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleOpenEditAddress(addr)}
                          className="p-1.5 text-maroon-700 hover:text-maroon-900 hover:bg-maroon-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit address"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "info" && (
          <div className="max-w-xl bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">
                {t.profile.updateProfileTitle || "Update Profile Info"}
              </h3>
              <p className="text-xs text-maroon-700 mt-0.5">
                Update your account display name, primary email address, and contact number.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1 text-maroon-700" />
                  {t.profile.fullNameInput || "Full Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900 flex items-center">
                  <Mail className="w-3.5 h-3.5 mr-1 text-maroon-700" />
                  {t.profile.emailInput || "Email Address *"}
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-maroon-700" />
                  {t.profile.phoneInput || "Phone Number *"}
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full py-3 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? "Saving changes..." : (t.profile.saveProfileBtn || "Save Profile Changes")}
              </button>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="max-w-xl bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
            <div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">
                {t.profile.changePasswordTitle || "Account Security & Password"}
              </h3>
              <p className="text-xs text-maroon-700 mt-0.5">
                Change your account password to ensure your profile and order history remain secure.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {user.hasPassword && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-maroon-900">
                    {t.profile.currentPasswordInput || "Current Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 pr-10 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-600 hover:text-maroon-900 cursor-pointer"
                    >
                      {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900">
                  {t.profile.newPasswordInput || "New Password *"}
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? "text" : "password"}
                    required
                    minLength={6}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 pr-10 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-maroon-600 hover:text-maroon-900 cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900">
                  {t.profile.confirmPasswordInput || "Confirm New Password *"}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                />
              </div>

              <button
                type="submit"
                disabled={changePasswordMutation.isPending}
                className="w-full py-3 bg-maroon-900 hover:bg-maroon-800 text-white font-semibold text-xs rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
              >
                {changePasswordMutation.isPending ? "Updating password..." : (t.profile.changePasswordBtn || "Update Password")}
              </button>
            </form>
          </div>
        )}
      </div>

      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 border border-maroon-100 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setIsAddressModalOpen(false)}
              className="absolute right-4 top-4 text-maroon-700 hover:text-maroon-900 p-1.5 rounded-full hover:bg-maroon-50 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-serif font-bold text-lg text-maroon-900">
                {editingAddress
                  ? (t.profile.editAddressModalTitle || "Edit Delivery Address")
                  : (t.profile.addAddressModalTitle || "Add New Delivery Address")}
              </h3>
              <p className="text-xs text-maroon-700 mt-0.5">
                Save delivery locations for quick selecting during checkout.
              </p>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900">
                  {t.profile.addressLabelInput || "Address Label (e.g. Home, Office)"}
                </label>
                <input
                  type="text"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  placeholder="Home / Office / Apartment"
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900">
                  {t.profile.fullAddressInput || "Full Delivery Address *"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={addressForm.fullAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                  placeholder="House #, Road #, Flat/Floor, Area, Landmark"
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-maroon-900">
                  {t.profile.cityInput || "City *"}
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  placeholder="Dhaka / Chattogram / Sylhet etc."
                  className="w-full px-3.5 py-2.5 bg-off-white border border-maroon-200 rounded-xl text-xs text-maroon-900 focus:outline-none focus:ring-2 focus:ring-maroon-900/30"
                />
              </div>

              <label className="flex items-center space-x-2 text-xs font-medium text-maroon-900 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 rounded border-maroon-300 text-maroon-900 focus:ring-maroon-900"
                />
                <span>{t.profile.setAsDefaultCheckbox || "Set as my primary default delivery address"}</span>
              </label>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2.5 border border-maroon-200 text-maroon-800 hover:bg-maroon-50 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                  className="px-5 py-2.5 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer disabled:opacity-50"
                >
                  {createAddressMutation.isPending || updateAddressMutation.isPending
                    ? (t.profile.saving || "Saving...")
                    : (t.profile.saveAddressBtn || "Save Address")}
                </button>
              </div>
            </form>
          </div>
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
                  className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    (statusColorMap[selectedOrder.status] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" }).bg
                  } ${
                    (statusColorMap[selectedOrder.status] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" }).text
                  } ${
                    (statusColorMap[selectedOrder.status] || { bg: "bg-gray-100", text: "text-gray-900", border: "border-gray-200" }).border
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
                <span className="font-mono">৳{(selectedOrder.subtotal || selectedOrder.total - (selectedOrder.deliveryCharge || 0)).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-maroon-800">
                <span>Delivery Fee</span>
                <span className="font-mono">৳{(selectedOrder.deliveryCharge || 0).toFixed(2)}</span>
              </div>
              {Boolean(selectedOrder.discount && selectedOrder.discount > 0) && (
                <div className="flex items-center justify-between text-emerald-800 font-semibold">
                  <span>Discount</span>
                  <span className="font-mono">-৳{(selectedOrder.discount || 0).toFixed(2)}</span>
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
