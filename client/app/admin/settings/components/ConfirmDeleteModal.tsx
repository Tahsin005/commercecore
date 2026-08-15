"use client";

import { AlertTriangle, Loader2 } from "lucide-react";
import { DialogModal } from "@/components/ui/DialogModal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  isDeleting?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting = false,
}: ConfirmDeleteModalProps) {
  return (
    <DialogModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex items-center space-x-3 text-red-600">
        <AlertTriangle className="w-6 h-6 shrink-0" />
        <h3 id="dialog-title" className="font-serif font-bold text-base text-maroon-900">
          {title}
        </h3>
      </div>
      <p className="text-xs text-maroon-700">{description}</p>
      <div className="flex items-center justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 bg-off-white hover:bg-maroon-100 border border-maroon-200 text-maroon-900 text-xs font-semibold rounded-xl cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
        >
          {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          <span>Delete</span>
        </button>
      </div>
    </DialogModal>
  );
}
