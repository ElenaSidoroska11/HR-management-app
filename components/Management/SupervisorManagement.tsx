"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useSupervisors } from "@/lib/hooks/useSupervisors";
import { toast } from "sonner";
import { createSupervisor, updateSupervisor, deleteSupervisor } from "@/lib/firebase/firestore";
import { isDuplicateDisplayName } from "@/lib/utils";
import type { Supervisor } from "@/types/supervisor";
import { Button } from "../ui/button";

export default function SupervisorManagement() {
  const { supervisors, loading, error } = useSupervisors();

  const [newName, setNewName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const [editing, setEditing] = useState<Supervisor | null>(null);
  const [editName, setEditName] = useState("");
  const [editNameTouched, setEditNameTouched] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState<Supervisor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const trimmedNewName = newName.trim();
  const nameError = nameTouched && !trimmedNewName ? "Name is required." : "";

  const trimmedEditName = editName.trim();
  const editNameError = editNameTouched && !trimmedEditName ? "Name is required." : "";

  const resetAddForm = () => {
    setNewName("");
    setNameTouched(false);
  };

  const handleCreate = async () => {
    setNameTouched(true);
    if (!trimmedNewName) {
      return;
    }

    if (isDuplicateDisplayName(trimmedNewName, supervisors.map((s) => s.name))) {
      toast.error("Name already exists", {
        description: `A supervisor named "${trimmedNewName}" already exists.`,
      });
      return;
    }

    setIsCreating(true);
    try {
      await createSupervisor({
        name: trimmedNewName,
      });
      resetAddForm();
      toast.success("Supervisor added");
    } catch {
      toast.error("Could not add supervisor", {
        description: "Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (s: Supervisor) => {
    setEditing(s);
    setEditName(s.name);
    setEditNameTouched(false);
  };

  const closeEdit = () => {
    setEditing(null);
    setEditNameTouched(false);
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setEditNameTouched(true);
    if (!trimmedEditName) {
      return;
    }

    if (
      isDuplicateDisplayName(
        trimmedEditName,
        supervisors.map((s) => s.name),
        editing.name
      )
    ) {
      toast.error("Name already exists", {
        description: `A supervisor named "${trimmedEditName}" already exists.`,
      });
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateSupervisor(editing.id, {
        name: trimmedEditName,
      });
      closeEdit();
      toast.success("Supervisor updated");
    } catch {
      toast.error("Could not update supervisor", {
        description: "Please try again.",
      });
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await deleteSupervisor(deleting.id);
      setDeleting(null);
      toast.success("Supervisor removed");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not delete supervisor.";
      toast.error("Cannot delete", {
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Loading supervisors…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="w-full space-y-8 max-w-3xl">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Management</h1>
          <p className="mt-1 text-sm text-gray-600">Add and manage supervisors and projects here.</p>
        </div>

        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">Add supervisor</h2>
          <div className="space-y-2">
            <label htmlFor="supervisor-name" className="text-sm font-medium text-gray-800">
              Name
            </label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                id="supervisor-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                placeholder="Full name"
                aria-invalid={!!nameError}
                aria-describedby={nameError ? "supervisor-name-error" : undefined}
                className={`flex-1 bg-white text-gray-900 ${nameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreate();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="shrink-0 w-full rounded-full bg-gray-500 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
                {isCreating ? "Adding…" : "Add"}
              </Button>
            </div>
            {nameError && (
              <p id="supervisor-name-error" className="text-xs text-red-600">
                {nameError}
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">All supervisors</h2>
          {supervisors.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 bg-white/60 py-10 text-center text-sm text-gray-500">
              No supervisors yet. Add one above.
            </p>
          ) : (
            <ul className="divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {supervisors.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="font-medium text-gray-900">{s.name}</p>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4 text-gray-600 hover:text-gray-950 cursor-pointer" aria-hidden />
                    </button>
                    <button type="button" onClick={() => setDeleting(s)}>
                      <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700 cursor-pointer" aria-hidden />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit supervisor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label htmlFor="edit-name" className="text-sm font-medium text-gray-800">
                Name
              </label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => setEditNameTouched(true)}
                aria-invalid={!!editNameError}
                aria-describedby={editNameError ? "edit-name-error" : undefined}
                className={`bg-white text-gray-900 ${editNameError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveEdit();
                  }
                }}
              />
              {editNameError && (
                <p id="edit-name-error" className="text-xs text-red-600">
                  {editNameError}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={closeEdit}
              className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="rounded-full bg-gray-500 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-gray-600 disabled:opacity-50">
              {isSavingEdit ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete supervisor?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            {deleting ? (
              <>
                Remove <span className="font-medium text-gray-900">{deleting.name}</span> from the list? You
                can only delete supervisors who have no projects assigned.
              </>
            ) : null}
          </p>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200">
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
