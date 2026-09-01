"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Edit2, X, Loader2, FileText, Plus } from "lucide-react";
import {
  useContentBlocksQuery,
  useUpsertContentBlockMutation,
  ContentBlockItem,
} from "@/hooks/useCmsQueries";
import { contentBlockFormSchema, ContentBlockFormInput } from "@/lib/validations/settings";
import { DialogModal } from "@/components/ui/DialogModal";

const DEFAULT_CORE_PAGES = [
  { key: "about_us", title: "About Us", defaultBody: "Welcome to Commerce Core! We provide high quality collections." },
  { key: "contact_us", title: "Contact Us", defaultBody: "Reach out to our customer support team for inquiries." },
  { key: "how_to_buy", title: "How to Buy", defaultBody: "Browse our collections, add items to cart, and checkout easily." },
  { key: "return_policy", title: "Return Policy", defaultBody: "Returns are accepted within 7 days of delivery." },
];

export function ContentBlocksTab() {
  const { data: contentBlocks = [], isLoading } = useContentBlocksQuery();
  const upsertBlockMut = useUpsertContentBlockMutation();

  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContentBlockFormInput>({
    resolver: zodResolver(contentBlockFormSchema),
    defaultValues: { key: "", title: "", body: "" },
  });

  const blockKey = watch("key");

  const openEditModal = (blk: { key: string; title: string; body: string }) => {
    reset({ key: blk.key, title: blk.title, body: blk.body });
    setBlockModalOpen(true);
  };

  const onSubmit = (data: ContentBlockFormInput) => {
    upsertBlockMut.mutate(
      { key: data.key.trim(), data: { title: data.title.trim(), body: data.body } },
      {
        onSuccess: () => {
          toast.success("Content block saved!");
          setBlockModalOpen(false);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save content block");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6 animate-pulse">
        <div className="border-b border-maroon-100 pb-4 space-y-2">
          <div className="h-5 w-56 bg-maroon-200/70 rounded-md" />
          <div className="h-3 w-80 bg-maroon-100/60 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 border border-maroon-100 rounded-xl bg-off-white/40 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-maroon-100 pb-2">
                  <div className="h-4 w-28 bg-maroon-200/70 rounded" />
                  <div className="h-4 w-20 bg-maroon-100/70 rounded-full" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-3 w-full bg-maroon-100/60 rounded" />
                  <div className="h-3 w-5/6 bg-maroon-100/60 rounded" />
                  <div className="h-3 w-4/6 bg-maroon-100/60 rounded" />
                </div>
              </div>
              <div className="h-9 w-full bg-maroon-200/60 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
      <div className="border-b border-maroon-100 pb-4">
        <h2 className="font-serif font-bold text-lg text-maroon-900">Static Content Pages (CMS)</h2>
        <p className="text-xs text-maroon-700">Manage page title and text content for the 4 core site pages (About Us, Contact Us, How to Buy, Return Policy).</p>
      </div>

      {contentBlocks.length === 0 ? (
        <div className="border-2 border-dashed border-maroon-200 rounded-2xl p-8 text-center space-y-4 bg-off-white">
          <div className="w-12 h-12 rounded-full bg-maroon-100 flex items-center justify-center text-maroon-800 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-maroon-900">No Content Blocks Found</h3>
            <p className="text-xs text-maroon-700 mt-1 max-w-md mx-auto">
              Initialize the 4 default static pages (About Us, Contact Us, How to Buy, Return Policy) to start editing content.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
            {DEFAULT_CORE_PAGES.map((page) => (
              <button
                key={page.key}
                onClick={() => openEditModal({ key: page.key, title: page.title, body: page.defaultBody })}
                className="px-4 py-2.5 bg-white border border-maroon-200 hover:bg-maroon-50 text-maroon-900 font-semibold text-xs rounded-xl shadow-xs flex items-center justify-between cursor-pointer"
              >
                <span>{page.title}</span>
                <Plus className="w-4 h-4 text-maroon-700" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {contentBlocks.map((blk) => (
            <div key={blk.key} className="p-5 border border-maroon-100 rounded-xl bg-off-white/40 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-maroon-100 pb-2">
                  <h3 className="font-bold text-sm text-maroon-900">{blk.title}</h3>
                  <span className="font-mono text-[10px] bg-maroon-100 text-maroon-800 font-bold px-2.5 py-0.5 rounded-full border border-maroon-200">
                    key: {blk.key}
                  </span>
                </div>
                <p className="text-xs text-maroon-700 leading-relaxed line-clamp-3 whitespace-pre-wrap">{blk.body}</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => openEditModal(blk)}
                  className="w-full py-2 bg-white hover:bg-maroon-50 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-lg shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-maroon-700" />
                  <span>Edit Page Content</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DialogModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        title="Edit Static Page Content"
        maxWidthClass="max-w-lg"
      >
        <div className="flex items-center justify-between border-b border-maroon-100 pb-3">
          <div className="flex items-center space-x-2">
            <h3 id="dialog-title" className="font-serif font-bold text-lg text-maroon-900">Edit Page Content</h3>
            <span className="font-mono text-xs bg-maroon-100 text-maroon-800 font-bold px-2.5 py-0.5 rounded-full border border-maroon-200">
              key: {blockKey}
            </span>
          </div>
          <button onClick={() => setBlockModalOpen(false)} className="text-maroon-500 hover:text-maroon-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-semibold text-maroon-900 mb-1">Page Title *</label>
            <input type="text" {...register("title")} placeholder="About Us" className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs" />
            {errors.title && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block font-semibold text-maroon-900 mb-1">Page Body Content *</label>
            <textarea rows={8} {...register("body")} placeholder="Write your page content here..." className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs resize-none leading-relaxed" />
            {errors.body && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.body.message}</p>}
          </div>
          <button type="submit" disabled={upsertBlockMut.isPending} className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-950 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50">
            {upsertBlockMut.isPending && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
            <span>Save Page Content</span>
          </button>
        </form>
      </DialogModal>
    </div>
  );
}
