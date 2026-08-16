"use client";

import React, { useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
  X,
  Building,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  useUserAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  Address,
} from "@/hooks/useAddressQueries";
import toast from "react-hot-toast";

interface SavedAddressesTabProps {
  isAuthenticated: boolean;
}

export function SavedAddressesTab({ isAuthenticated }: SavedAddressesTabProps) {
  const { t } = useLanguage();
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
      toast.success("Default address updated!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to set default address");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif font-bold text-lg text-maroon-900">Saved Delivery Addresses</h3>
          <p className="text-xs text-maroon-700">Manage your shipping addresses for fast 1-click checkout</p>
        </div>

        <button
          onClick={handleOpenAddAddress}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 bg-maroon-900 hover:bg-maroon-800 text-white text-xs font-semibold rounded-xl shadow transition-all cursor-pointer shrink-0"
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
        <div className="bg-white rounded-2xl border border-maroon-100 shadow-sm overflow-hidden w-full max-w-full">
          <div className="overflow-x-auto w-full max-w-full">
            <table className="w-full text-left text-xs text-maroon-900 border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-maroon-900 text-cream text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Label</th>
                  <th className="py-3.5 px-4">Full Address</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 bg-white">
                {addresses.map((addr) => (
                  <tr key={addr.id} className="hover:bg-maroon-50/50 transition-colors">
                    <td className="py-3.5 px-4 align-middle">
                      <span className="inline-flex items-center text-xs font-bold text-maroon-900 bg-maroon-100 px-2.5 py-1 rounded-md">
                        <Building className="w-3.5 h-3.5 mr-1.5 text-maroon-800" />
                        {addr.label || "Home"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 align-middle text-xs font-medium text-maroon-900 max-w-md">
                      {addr.fullAddress}
                    </td>

                    <td className="py-3.5 px-4 align-middle font-mono font-bold text-xs text-maroon-900">
                      {addr.city}
                    </td>

                    <td className="py-3.5 px-4 align-middle text-center">
                      {addr.isDefault ? (
                        <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
                          {t.profile.defaultBadge || "Default"}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSetDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-maroon-700 hover:text-maroon-900 underline cursor-pointer whitespace-nowrap"
                        >
                          {t.profile.setAsDefaultBtn || "Set as Default"}
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 align-middle text-right">
                      <div className="flex items-center justify-end space-x-1.5">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
    </div>
  );
}
