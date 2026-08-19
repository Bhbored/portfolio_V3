import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  skillKeys,
  skillQueries,
  updateCategory,
} from "../../skills/skills.service";
import PaginationControls from "../components/PaginationControls";
import type { SkillCategory, Writable } from "../../../shared/types";
import SidePannel from "../../../shared/components/SidePannel";
import Dialog from "../../../shared/components/Dialog";
import { useToast } from "../../../shared/components/Toast";
import {
  DataTableShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  TextField,
  thClass,
  tdClass,
  rowClass,
} from "../components/AdminForm";

const PAGE_SIZE = 10;

const emptyCategory = (): Writable<SkillCategory> => ({
  category: "",
  priority: 1,
});

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: categories = [] } = useQuery(skillQueries.categories());
  const { data: skills = [] } = useQuery(skillQueries.list());
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<Writable<SkillCategory>>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const nextPriority = useMemo(() => {
    const maxPriority = categories
      .filter((category) => category.id !== editingId)
      .reduce((max, category) => Math.max(max, category.priority), 0);
    return maxPriority + 1;
  }, [categories, editingId]);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: skillKeys.all });
  const failure = (action: string, error: unknown) =>
    toast.error({
      title: `Could not ${action} category`,
      description: error instanceof Error ? error.message : "Unknown error",
    });
  const create = useMutation({
    mutationFn: () => createCategory(draft),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Category created" });
      closePanel();
      setPage(1);
    },
    onError: (error) => failure("create", error),
  });
  const update = useMutation({
    mutationFn: () =>
      editingId
        ? updateCategory(editingId, draft)
        : Promise.reject(new Error("No category selected")),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Category updated" });
      closePanel();
    },
    onError: (error) => failure("update", error),
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Category deleted" });
      setDeleteTarget(null);
    },
    onError: (error) => failure("delete", error),
  });
  const rows = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setMode("create");
    setDraft(emptyCategory());
    setEditingId(null);
    setPanelOpen(true);
  };
  const openEdit = (category: SkillCategory) => {
    const { id, created_at: _c, updated_at: _u, ...row } = category;
    setMode("edit");
    setDraft(row);
    setEditingId(id);
    setPanelOpen(true);
  };
  const save = () => (mode === "create" ? create.mutate() : update.mutate());
  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill categories"
        description="Organize skills into groups and control display order."
        action={
          <PrimaryButton onClick={openCreate}>
            <Plus className="size-4" /> Add category
          </PrimaryButton>
        }
      />
      <DataTableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-135 text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className={thClass}>Priority</th>
                <th className={thClass}>Category name</th>
                <th className={thClass}>Skills</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((category) => (
                <tr key={category.id} className={rowClass}>
                  <td className={`${tdClass} tabular-nums`}>{category.priority}</td>
                  <td className={tdClass}>{category.category}</td>
                  <td className={`${tdClass} tabular-nums`}>
                    {
                      skills.filter(
                        (skill) => skill.skill_category_id === category.id,
                      ).length
                    }
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      aria-label={`Edit ${category.category}`}
                      onClick={() => openEdit(category)}
                      className="mr-2 cursor-pointer text-primary"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${category.category}`}
                      onClick={() =>
                        setDeleteTarget({
                          id: category.id,
                          label: category.category,
                        })
                      }
                      className="cursor-pointer text-secondary"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className={`${tdClass} py-8 text-center text-on-surface-variant`}
                  >
                    No categories yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="px-4">
          <PaginationControls
            currentPage={page}
            pageSize={PAGE_SIZE}
            totalItems={categories.length}
            onPageChange={setPage}
          />
        </div>
      </DataTableShell>
      <SidePannel
        open={panelOpen}
        onClose={closePanel}
        title={mode === "create" ? "Add category" : "Edit category"}
        widthClassName="w-full max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={closePanel}>Cancel</SecondaryButton>
            <PrimaryButton
              onClick={save}
              disabled={
                !draft.category.trim() || create.isPending || update.isPending
              }
            >
              Save
            </PrimaryButton>
          </div>
        }
      >
        <div className="space-y-5">
          <TextField
            label="Category name"
            value={draft.category}
            onChange={(category) => setDraft((current) => ({ ...current, category }))}
            required
          />
          <label className="block">
            <span className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
              Priority
            </span>
            <input
              className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low/40 px-3 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
              type="number"
              min={1}
              step={1}
              value={draft.priority}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  priority: Math.max(1, Number(event.target.value) || 1),
                }))
              }
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-on-surface-variant">
                Next available priority: {nextPriority}
              </p>
              <button
                type="button"
                onClick={() =>
                  setDraft((current) => ({ ...current, priority: nextPriority }))
                }
                className="cursor-pointer font-label text-xs uppercase tracking-widest text-primary hover:text-secondary"
              >
                Use next
              </button>
            </div>
          </label>
        </div>
      </SidePannel>
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete category?"
        description={`This will permanently delete ${deleteTarget?.label ?? "this category"}.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        confirming={remove.isPending}
      />
    </div>
  );
}
