"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import {
  useAdminContactChannelsQuery,
  useCreateContactChannelMutation,
  useUpdateContactChannelMutation,
  useDeleteContactChannelMutation,
  ContactChannelItem,
} from "@/hooks/useCmsQueries";
import { contactChannelFormSchema, ContactChannelFormInput } from "@/lib/validations/settings";

export function ContactChannelsTab() {
  const { data: contactChannels = [], isLoading } = useAdminContactChannelsQuery();
  const createChannelMut = useCreateContactChannelMutation();
  const updateChannelMut = useUpdateContactChannelMutation();
  const deleteChannelMut = useDeleteContactChannelMutation();

  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<ContactChannelItem | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactChannelFormInput>({
    resolver: zodResolver(contactChannelFormSchema),
    defaultValues: { label: "", phoneNumber: "", type: "call", sortOrder: 0 },
  });

  const openCreateModal = () => {
    setEditingChannel(null);
    reset({ label: "", phoneNumber: "", type: "call", sortOrder: contactChannels.length + 1 });
    setChannelModalOpen(true);
  };

  const openEditModal = (ch: ContactChannelItem) => {
    setEditingChannel(ch);
    reset({ label: ch.label, phoneNumber: ch.phoneNumber, type: ch.type, sortOrder: ch.sortOrder });
    setChannelModalOpen(true);
  };

  const onSubmit = (data: ContactChannelFormInput) => {
    if (editingChannel) {
      updateChannelMut.mutate(
        { id: editingChannel.id, data: { label: data.label.trim(), phoneNumber: data.phoneNumber.trim(), type: data.type, sortOrder: data.sortOrder } },
        { onSuccess: () => { toast.success("Contact channel updated!"); setChannelModalOpen(false); } }
      );
    } else {
      createChannelMut.mutate(
        { label: data.label.trim(), phoneNumber: data.phoneNumber.trim(), type: data.type, sortOrder: data.sortOrder, isActive: true },
        { onSuccess: () => { toast.success("Contact channel created!"); setChannelModalOpen(false); } }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-maroon-700">
        Loading contact channels...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
        <div>
          <h2 className="font-serif font-bold text-lg text-maroon-900">Contact Channels &amp; Helplines</h2>
          <p className="text-xs text-maroon-700">Configure Bkash, WhatsApp, Nagad, and Call Us support channels.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-maroon-900 hover:bg-maroon-950 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Channel</span>
        </button>
      </div>

      <div className="divide-y divide-maroon-100 border border-maroon-100 rounded-xl overflow-hidden">
        {contactChannels.map((ch) => (
          <div key={ch.id} className="p-4 flex items-center justify-between text-xs bg-white">
            <div className="space-y-0.5">
              <span className="font-bold text-maroon-900">{ch.label}</span>
              <p className="font-mono text-maroon-700">{ch.phoneNumber} ({ch.type.toUpperCase()})</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="bg-off-white text-maroon-800 px-2 py-1 rounded border font-mono">Order: {ch.sortOrder}</span>
              <button onClick={() => openEditModal(ch)} className="p-1 text-maroon-700 hover:text-maroon-900">
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteChannelMut.mutate(ch.id, { onSuccess: () => toast.success("Channel deleted") })}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {channelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 border border-maroon-100 shadow-2xl relative">
            <button onClick={() => setChannelModalOpen(false)} className="absolute top-4 right-4 text-maroon-500 hover:text-maroon-800">
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif font-bold text-lg text-maroon-900">{editingChannel ? "Edit Contact Channel" : "Add Contact Channel"}</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Label *</label>
                <input type="text" {...register("label")} placeholder="Bkash Personal" className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs" />
                {errors.label && <p className="text-red-500 text-[11px] mt-1">{errors.label.message}</p>}
              </div>
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Phone Number *</label>
                <input type="text" {...register("phoneNumber")} placeholder="01700000000" className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono" />
                {errors.phoneNumber && <p className="text-red-500 text-[11px] mt-1">{errors.phoneNumber.message}</p>}
              </div>
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Type</label>
                <select {...register("type")} className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs">
                  <option value="call">Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="bkash">Bkash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Sort Order</label>
                <input type="number" {...register("sortOrder", { valueAsNumber: true })} className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono" />
              </div>
              <button type="submit" disabled={createChannelMut.isPending || updateChannelMut.isPending} className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-950 text-white font-semibold rounded-xl flex items-center justify-center space-x-2">
                {(createChannelMut.isPending || updateChannelMut.isPending) && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
                <span>Save Channel</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
