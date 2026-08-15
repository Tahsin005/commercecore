"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Edit2, X, Loader2 } from "lucide-react";
import {
  useContentBlocksQuery,
  useUpsertContentBlockMutation,
  ContentBlockItem,
} from "@/hooks/useCmsQueries";
import { contentBlockFormSchema, ContentBlockFormInput } from "@/lib/validations/settings";

export function ContentBlocksTab() {
  const { data: contentBlocks = [], isLoading } = useContentBlocksQuery();
  const upsertBlockMut = useUpsertContentBlockMutation();

  const [blockModalOpen, setBlockModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContentBlockFormInput>({
    resolver: zodResolver(contentBlockFormSchema),
    defaultValues: { key: "", title: "", body: "" },
  });

  const blockKey = watch("key");

  const openEditModal = (blk: ContentBlockItem) => {
    reset({ key: blk.key, title: blk.title, body: blk.body });
    setBlockModalOpen(true);
  };

  const onSubmit = (data: ContentBlockFormInput) => {
    upsertBlockMut.mutate(
      { key: data.key.trim(), data: { title: data.title.trim(), body: data.body } },
      { onSuccess: () => { toast.success("Content block saved!"); setBlockModalOpen(false); } }
    );
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-semibold text-maroon-700">
        Loading content pages...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-maroon-100 shadow-md p-6 space-y-6">
      <div className="border-b border-maroon-100 pb-4">
        <h2 className="font-serif font-bold text-lg text-maroon-900">Static Content Pages (CMS)</h2>
        <p className="text-xs text-maroon-700">Manage page title and text content for the 4 core site pages (About Us, Contact Us, How to Buy, Return Policy).</p>
      </div>

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

      {blockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg space-y-4 border border-maroon-100 shadow-2xl relative">
            <button onClick={() => setBlockModalOpen(false)} className="absolute top-4 right-4 text-maroon-500 hover:text-maroon-800"><X className="w-5 h-5" /></button>
            <div className="flex items-center space-x-2 border-b border-maroon-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-maroon-900">Edit Static Page Content</h3>
              <span className="font-mono text-xs bg-maroon-100 text-maroon-800 font-bold px-2.5 py-0.5 rounded-full border border-maroon-200">
                key: {blockKey}
              </span>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Page Title *</label>
                <input type="text" {...register("title")} placeholder="About Us" className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs" />
                {errors.title && <p className="text-red-500 text-[11px] mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block font-semibold text-maroon-900 mb-1">Page Body Content *</label>
                <textarea rows={8} {...register("body")} placeholder="Write your page content here..." className="w-full px-3 py-2 bg-off-white text-maroon-900 border border-maroon-200 rounded-lg text-xs resize-none leading-relaxed" />
                {errors.body && <p className="text-red-500 text-[11px] mt-1">{errors.body.message}</p>}
              </div>
              <button type="submit" disabled={upsertBlockMut.isPending} className="w-full py-2.5 bg-maroon-900 hover:bg-maroon-950 text-white font-semibold rounded-xl flex items-center justify-center space-x-2">
                {upsertBlockMut.isPending && <Loader2 className="w-4 h-4 animate-spin text-cream" />}
                <span>Save Page Content</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
