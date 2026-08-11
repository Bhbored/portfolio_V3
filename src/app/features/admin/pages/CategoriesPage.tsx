import { useState } from "react";
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
import type { SkillCategory } from "../../../shared/types";
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

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: categories = [] } = useQuery(skillQueries.categories());
  const { data: skills = [] } = useQuery(skillQueries.list());
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: skillKeys.all });
  const failure = (action: string, error: unknown) =>
    toast.error({
      title: `Could not ${action} category`,
      description: error instanceof Error ? error.message : "Unknown error",
    });
  const create = useMutation({
    mutationFn: () => createCategory({ category: draft }),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Category created" });
      setPanelOpen(false);
      setPage(Math.max(1, Math.ceil((categories.length + 1) / PAGE_SIZE)));
    },
    onError: (error) => failure("create", error),
  });
  const update = useMutation({
    mutationFn: () =>
      editingId
        ? updateCategory(editingId, { category: draft })
        : Promise.reject(new Error("No category selected")),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Category updated" });
      setPanelOpen(false);
    },
    onError: (error) => failure("update", error),
  });
  const remove = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Category deleted" });
      setDeleteTarget(null);
      if (categories.length - 1 <= (page - 1) * PAGE_SIZE && page > 1)
        setPage(page - 1);
    },
    onError: (error) => failure("delete", error),
  });
  const rows = categories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setMode("create");
    setDraft("");
    setEditingId(null);
    setPanelOpen(true);
  };
  const openEdit = (category: SkillCategory) => {
    setMode("edit");
    setDraft(category.category);
    setEditingId(category.id);
    setPanelOpen(true);
  };
  const save = () => (mode === "create" ? create.mutate() : update.mutate());
  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill categories"
        description="Organize skills into groups."
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
                <th className={thClass}>Category name</th>
                <th className={thClass}>Skills</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((category) => (
                <tr key={category.id} className={rowClass}>
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
                    colSpan={3}
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
        onClose={() => setPanelOpen(false)}
        title={mode === "create" ? "Add category" : "Edit category"}
        widthClassName="w-full max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setPanelOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={save}
              disabled={!draft.trim() || create.isPending || update.isPending}
            >
              Save
            </PrimaryButton>
          </div>
        }
      >
        <TextField
          label="Category name"
          value={draft}
          onChange={setDraft}
          required
        />
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
