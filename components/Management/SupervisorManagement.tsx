'use client';

import { useState } from 'react';
import { Pencil, Trash2, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSupervisors } from '@/lib/hooks/useSupervisors';
import { useToast } from '@/lib/hooks/use-toast';
import {
  createSupervisor,
  updateSupervisor,
  deleteSupervisor,
} from '@/lib/firebase/firestore';
import type { Supervisor } from '@/types/supervisor';

export default function SupervisorManagement() {
  const { supervisors, loading, error } = useSupervisors();
  const { toast } = useToast();

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [editing, setEditing] = useState<Supervisor | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState<Supervisor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const resetAddForm = () => {
    setNewName('');
    setNewEmail('');
  };

  const handleCreate = async () => {
    const name = newName.trim();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a supervisor name.',
      });
      return;
    }

    setIsCreating(true);
    try {
      await createSupervisor({
        name,
        ...(newEmail.trim() ? { email: newEmail.trim() } : {}),
      });
      resetAddForm();
      toast({ title: 'Supervisor added' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add supervisor. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (s: Supervisor) => {
    setEditing(s);
    setEditName(s.name);
    setEditEmail(typeof s.email === 'string' ? s.email : '');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    const name = editName.trim();
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a supervisor name.',
      });
      return;
    }

    setIsSavingEdit(true);
    try {
      await updateSupervisor(editing.id, {
        name,
        email: editEmail.trim(),
      });
      setEditing(null);
      toast({ title: 'Supervisor updated' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update supervisor. Please try again.',
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
      toast({ title: 'Supervisor removed' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not delete supervisor.';
      toast({
        variant: 'destructive',
        title: 'Cannot delete',
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
      <div className="mx-auto max-w-3xl space-y-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Supervisors</h1>
            <p className="mt-1 text-sm text-gray-600">
              Add supervisors here so they appear when you create projects.
            </p>
          </div>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <UserPlus className="h-4 w-4 text-blue-600" aria-hidden />
              Add supervisor
            </h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <label htmlFor="supervisor-name" className="text-sm font-medium text-gray-800">
                  Name
                </label>
                <Input
                  id="supervisor-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="bg-white text-gray-900"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label htmlFor="supervisor-email" className="text-sm font-medium text-gray-800">
                  Email <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <Input
                  id="supervisor-email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="bg-white text-gray-900"
                />
              </div>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="shrink-0 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? 'Adding…' : 'Add'}
              </button>
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
                    className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{s.name}</p>
                      {s.email ? (
                        <p className="truncate text-sm text-gray-600">{s.email}</p>
                      ) : (
                        <p className="text-sm text-gray-400">No email</p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(s)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
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
                className="bg-white text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-email" className="text-sm font-medium text-gray-800">
                Email <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="bg-white text-gray-900"
              />
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              disabled={isSavingEdit}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSavingEdit ? 'Saving…' : 'Save'}
            </button>
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
                Remove <span className="font-medium text-gray-900">{deleting.name}</span> from
                the list? You can only delete supervisors who have no projects assigned.
              </>
            ) : null}
          </p>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting…' : 'Delete'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
