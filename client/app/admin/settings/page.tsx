"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useUploadConfigsQuery,
  useCreateUploadConfigMutation,
  useUpdateUploadConfigMutation,
  useDeleteUploadConfigMutation,
  UploadConfig,
} from "@/hooks/useUploadConfigQueries";
import {
  uploadConfigSchema,
  UploadConfigInput,
} from "@/lib/validations/uploadConfig";
import { toast } from "react-hot-toast";
import {
  Settings,
  Plus,
  RefreshCw,
  Cloud,
  CheckCircle2,
  Activity,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  Zap,
} from "lucide-react";

const maskUploadUrl = (url: string = "") => {
  if (!url) return "";
  return url.replace(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/i, "cloudinary://$1:***@$3");
};

export default function AdminSettingsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<UploadConfig | null>(null);
  const [deletingConfig, setDeletingConfig] = useState<UploadConfig | null>(null);

  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const initialInputRef = useRef<HTMLInputElement | null>(null);

  const {
    data: configsRes,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useUploadConfigsQuery();

  const createMutation = useCreateUploadConfigMutation();
  const updateMutation = useUpdateUploadConfigMutation();
  const deleteMutation = useDeleteUploadConfigMutation();

  const configs = configsRes?.data?.configs || [];
  const stats = configsRes?.data?.stats || {
    totalConfigs: 0,
    activeConfigs: 0,
    totalLoad: 0,
  };

  const leastLoadedId = useMemo(() => {
    const activeConfigs = configs.filter((c) => c.isActive);
    if (activeConfigs.length === 0) return null;
    const sorted = [...activeConfigs].sort((a, b) => a.load - b.load);
    return sorted[0].id;
  }, [configs]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UploadConfigInput>({
    resolver: zodResolver(uploadConfigSchema),
    defaultValues: {
      name: "",
      uploadUrl: "",
      isActive: true,
    },
  });

  const { ref: nameRegisterRef, ...nameRegisterProps } = register("name");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCreateOpen) setIsCreateOpen(false);
        if (deletingConfig) setDeletingConfig(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCreateOpen, deletingConfig]);

  useEffect(() => {
    if (isCreateOpen) {
      setTimeout(() => initialInputRef.current?.focus(), 50);
    } else {
      triggerButtonRef.current?.focus();
    }
  }, [isCreateOpen]);

  const openCreateModal = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.currentTarget) triggerButtonRef.current = e.currentTarget;
    reset({
      name: "",
      uploadUrl: "",
      isActive: true,
    });
    setEditingConfig(null);
    setIsCreateOpen(true);
  };

  const openEditModal = (config: UploadConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    triggerButtonRef.current = e.currentTarget;
    reset({
      name: config.name || "",
      uploadUrl: config.uploadUrl,
      isActive: config.isActive,
    });
    setEditingConfig(config);
    setIsCreateOpen(true);
  };

  const openDeleteModal = (config: UploadConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    triggerButtonRef.current = e.currentTarget;
    setDeletingConfig(config);
  };

  const onSubmit = (data: UploadConfigInput) => {
    if (editingConfig) {
      updateMutation.mutate(
        { id: editingConfig.id, payload: data },
        {
          onSuccess: () => {
            toast.success("Upload configuration updated successfully");
            setIsCreateOpen(false);
            setEditingConfig(null);
          },
          onError: (err) => {
            toast.error(err.message || "Failed to update upload config");
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          toast.success("Upload configuration added successfully");
          setIsCreateOpen(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to create upload config");
        },
      });
    }
  };

  const handleToggleActive = (config: UploadConfig) => {
    updateMutation.mutate(
      {
        id: config.id,
        payload: { isActive: !config.isActive },
      },
      {
        onSuccess: () => {
          toast.success(
            `Config ${!config.isActive ? "activated" : "deactivated"} successfully`
          );
        },
        onError: (err) => {
          toast.error(err.message || "Failed to update status");
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingConfig) return;
    deleteMutation.mutate(deletingConfig.id, {
      onSuccess: () => {
        toast.success("Upload configuration deleted");
        setDeletingConfig(null);
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete upload config");
      },
    });
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-maroon-100 shadow-sm">
        <div>
          <div className="flex items-center space-x-2 text-maroon-800">
            <Settings className="w-6 h-6 text-maroon-700" />
            <h1 className="font-serif font-bold text-2xl text-maroon-900 tracking-tight">
              System Settings & Media Uploads
            </h1>
          </div>
          <p className="text-xs text-maroon-700 mt-1">
            Configure dynamic Cloudinary upload endpoints, load-balance image uploads, and manage storage accounts.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="px-4 py-2.5 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
          <span>{isRefetching ? "Refreshing..." : "Refresh Status"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Total Configured</p>
            <h3 className="font-serif font-bold text-2xl text-maroon-900 mt-1">
              {stats.totalConfigs}
            </h3>
            <p className="text-[11px] text-maroon-700 mt-0.5 font-medium">Upload endpoints</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-maroon-50 border border-maroon-200 flex items-center justify-center shrink-0">
            <Cloud className="w-6 h-6 text-maroon-800" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Active Endpoints</p>
            <h3 className="font-serif font-bold text-2xl text-emerald-800 mt-1">
              {stats.activeConfigs}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">Ready for load balancing</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-emerald-700" />
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-maroon-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-maroon-600">Total Upload Load</p>
            <h3 className="font-serif font-bold text-2xl text-maroon-900 mt-1">
              {stats.totalLoad.toLocaleString()}
            </h3>
            <p className="text-[11px] text-maroon-700 mt-0.5 font-medium">Processed upload operations</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-blue-700" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md overflow-hidden">
        <div className="p-6 border-b border-maroon-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif font-bold text-lg text-maroon-900">
              Cloudinary Upload Endpoints
            </h2>
            <p className="text-xs text-maroon-700 mt-0.5">
              The system automatically selects active endpoints with the lowest load for image uploads.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 bg-maroon-900 hover:bg-maroon-950 text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Upload Config</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-maroon-700 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-maroon-700" />
            <p className="text-xs font-medium">Fetching upload configurations...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-600 space-y-2">
            <AlertTriangle className="w-8 h-8 mx-auto" />
            <p className="text-xs font-semibold">Failed to load upload configs.</p>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : configs.length === 0 ? (
          <div className="p-12 text-center text-maroon-700 space-y-3">
            <Cloud className="w-12 h-12 mx-auto text-maroon-300" />
            <p className="text-sm font-bold text-maroon-900">No Upload Configurations Found</p>
            <p className="text-xs text-maroon-600 max-w-sm mx-auto">
              Add your first Cloudinary connection URL (e.g. cloudinary://key:secret@cloud_name) to start load-balancing image uploads.
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-maroon-900 text-white text-xs font-semibold rounded-lg shadow-xs hover:bg-maroon-950 transition-colors cursor-pointer"
            >
              Add First Config
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="bg-maroon-50/60 border-b border-maroon-100 text-[11px] font-bold text-maroon-900 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Account / Name</th>
                  <th className="py-3.5 px-4">Upload URL</th>
                  <th className="py-3.5 px-4 text-center">Load Count</th>
                  <th className="py-3.5 px-4 text-center">Active Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-maroon-100 text-xs">
                {configs.map((config) => {
                  const isLeastLoaded = config.id === leastLoadedId;

                  return (
                    <tr key={config.id} className="hover:bg-maroon-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-maroon-900">
                        <div className="flex items-center space-x-2">
                          <span>{config.name || "Default Account"}</span>
                          {isLeastLoaded && (
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Zap className="w-3 h-3 text-emerald-600" />
                              <span>Next Pick</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-maroon-800 max-w-[320px] truncate">
                        {maskUploadUrl(config.uploadUrl)}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-bold text-maroon-900">
                        <span className="bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-md">
                          {config.load}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(config)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            config.isActive ? "bg-emerald-600" : "bg-maroon-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                              config.isActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => openEditModal(config, e)}
                            className="p-1.5 text-maroon-700 hover:text-maroon-900 hover:bg-maroon-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Configuration"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => openDeleteModal(config, e)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Configuration"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="upload-config-modal-title"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsCreateOpen(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-6 z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-maroon-100 pb-4">
              <div className="flex items-center space-x-2">
                <Cloud className="w-5 h-5 text-maroon-700" />
                <h3 id="upload-config-modal-title" className="font-serif font-bold text-lg text-maroon-900">
                  {editingConfig ? "Edit Upload Config" : "Add Upload Config"}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                aria-label="Close modal"
                className="p-1 text-maroon-500 hover:text-maroon-800 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">
                  Account / Config Name
                </label>
                <input
                  type="text"
                  {...nameRegisterProps}
                  ref={(e) => {
                    nameRegisterRef(e);
                    initialInputRef.current = e;
                  }}
                  placeholder="e.g. Cloudinary Free Tier Account 1"
                  className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all placeholder:text-maroon-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-maroon-900 mb-1">
                  Upload URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("uploadUrl")}
                  placeholder="cloudinary://key:secret@cloud_name"
                  className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-maroon-700 transition-all font-mono placeholder:text-maroon-400"
                />
                {errors.uploadUrl && (
                  <p className="text-red-500 text-[11px] mt-1 font-medium">
                    {errors.uploadUrl.message}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  {...register("isActive")}
                  className="w-4 h-4 text-maroon-800 rounded border-maroon-300 focus:ring-maroon-700 cursor-pointer"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="font-semibold text-maroon-900 cursor-pointer"
                >
                  Enable for Load Balancing
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-maroon-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-maroon-900 hover:bg-maroon-950 text-white font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>{editingConfig ? "Save Changes" : "Create Config"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingConfig && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-config-modal-title"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setDeletingConfig(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-maroon-100 p-6 space-y-4 z-10 animate-in zoom-in-95 duration-200 font-sans">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 id="delete-config-modal-title" className="font-serif font-bold text-base text-maroon-900">
                  Delete Upload Config
                </h3>
                <p className="text-xs text-maroon-600 mt-0.5">
                  Are you sure you want to remove this endpoint?
                </p>
              </div>
            </div>

            <div className="p-3 bg-off-white rounded-xl border border-maroon-100 text-xs text-maroon-800 space-y-1">
              <div>
                Name: <span className="font-bold text-maroon-900">{deletingConfig.name || "Default Account"}</span>
              </div>
              <div className="font-mono text-[11px] text-maroon-700 truncate">
                {maskUploadUrl(deletingConfig.uploadUrl)}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setDeletingConfig(null)}
                className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-1.5"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Endpoint</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
