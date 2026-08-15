"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import {
  Cloud,
  CheckCircle2,
  Activity,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  useUploadConfigsQuery,
  useCreateUploadConfigMutation,
  useDeleteUploadConfigMutation,
  UploadConfig,
} from "@/hooks/useUploadConfigQueries";
import {
  uploadConfigSchema,
  UploadConfigInput,
} from "@/lib/validations/uploadConfig";

const maskUploadUrl = (url: string = "") => {
  if (!url) return "";
  return url.replace(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i, "cloudinary://$1:***@$3");
};

export function MediaUploadsTab() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deletingConfig, setDeletingConfig] = useState<UploadConfig | null>(null);

  const { data: configsRes, isLoading, error, refetch } = useUploadConfigsQuery();
  const createConfigMutation = useCreateUploadConfigMutation();
  const deleteConfigMutation = useDeleteUploadConfigMutation();

  const configs = configsRes?.data?.configs || [];
  const stats = configsRes?.data?.stats || { totalConfigs: 0, activeConfigs: 0, totalLoad: 0 };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<UploadConfigInput>({
    resolver: zodResolver(uploadConfigSchema),
    defaultValues: { name: "", uploadUrl: "", isActive: true },
  });

  const onSubmit = (data: UploadConfigInput) => {
    createConfigMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Upload configuration added successfully");
        setIsCreateOpen(false);
        reset({ name: "", uploadUrl: "", isActive: true });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create upload config");
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingConfig) return;
    deleteConfigMutation.mutate(deletingConfig.id, {
      onSuccess: () => {
        toast.success("Upload configuration deleted");
        setDeletingConfig(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete upload config");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-maroon-700">
        Loading media upload endpoints...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Total Configured</p>
            <h3 className="font-serif font-bold text-2xl text-maroon-900 mt-1">{stats.totalConfigs}</h3>
          </div>
          <Cloud className="w-6 h-6 text-maroon-800" />
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Active Endpoints</p>
            <h3 className="font-serif font-bold text-2xl text-emerald-800 mt-1">{stats.activeConfigs}</h3>
          </div>
          <CheckCircle2 className="w-6 h-6 text-emerald-700" />
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Upload Load</p>
            <h3 className="font-serif font-bold text-2xl text-maroon-900 mt-1">{stats.totalLoad.toLocaleString()}</h3>
          </div>
          <Activity className="w-6 h-6 text-blue-700" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
          <h2 className="font-serif font-bold text-lg text-maroon-900">Cloudinary Upload Endpoints</h2>
          <button
            onClick={() => {
              reset({ name: "", uploadUrl: "", isActive: true });
              setIsCreateOpen(true);
            }}
            className="px-4 py-2 bg-maroon-900 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Endpoint</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-maroon-50/60 border-b border-maroon-100 font-bold text-maroon-900 uppercase tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Upload URL</th>
                <th className="py-3 px-4 text-center">Load Count</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-maroon-100">
              {configs.map((config) => (
                <tr key={config.id} className="hover:bg-maroon-50/40">
                  <td className="py-3 px-4 font-semibold text-maroon-900">{config.name || "Default Account"}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-maroon-800 max-w-[280px] truncate">{maskUploadUrl(config.uploadUrl)}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-maroon-900">{config.load}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${config.isActive ? "bg-emerald-100 text-emerald-800" : "bg-maroon-100 text-maroon-700"}`}>
                      {config.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setDeletingConfig(config)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-maroon-900">Add Upload Config</h3>
              <button onClick={() => setIsCreateOpen(false)} className="text-maroon-500 hover:text-maroon-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Account Name</label>
                <input type="text" {...register("name")} placeholder="e.g. Primary Account" className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs" />
              </div>
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Upload URL *</label>
                <input type="text" {...register("uploadUrl")} placeholder="cloudinary://..." className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs font-mono" />
                {errors.uploadUrl && <p className="text-red-600 text-[11px] mt-1 font-medium">{errors.uploadUrl.message}</p>}
              </div>
              <button type="submit" disabled={createConfigMutation.isPending} className="w-full py-2.5 bg-maroon-900 text-white font-semibold rounded-xl flex items-center justify-center space-x-2">
                {createConfigMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
                <span>Create Config</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {deletingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="font-serif font-bold text-base text-maroon-900">Delete Upload Config</h3>
            </div>
            <p className="text-xs text-maroon-700">Are you sure you want to remove endpoint "{deletingConfig.name || 'Default'}"?</p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button onClick={() => setDeletingConfig(null)} className="px-4 py-2 bg-off-white border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl">Cancel</button>
              <button onClick={handleDeleteConfirm} disabled={deleteConfigMutation.isPending} className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5">
                {deleteConfigMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
