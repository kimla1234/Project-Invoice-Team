"use client";

import { createPortal } from "react-dom";

interface ConfirmDeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmDeleteModal({
  open,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-dark-2">
        <h2 className="text-lg font-semibold text-dark dark:text-white">
          Delete Product
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Are you sure you want to delete this product?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100 dark:border-dark-3 dark:hover:bg-dark-3"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
