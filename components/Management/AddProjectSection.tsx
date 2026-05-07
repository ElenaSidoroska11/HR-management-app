"use client";

import { FolderPlus } from "lucide-react";

interface AddProjectSectionProps {
  onOpenDialog: () => void;
  disabled?: boolean;
}

export default function AddProjectSection({ onOpenDialog, disabled }: AddProjectSectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 max-w-3xl bg-white p-5 shadow-sm">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">Add project</h2>
      <p className="mb-4 text-sm text-gray-600">
        Create a project and assign it to a supervisor. It will show as a column under that supervisor on the
        Projects tab.
      </p>
      <button
        type="button"
        onClick={onOpenDialog}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-full bg-gray-500 px-4 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50">
        <FolderPlus className="h-4 w-4" aria-hidden />
        Add project
      </button>
    </section>
  );
}
