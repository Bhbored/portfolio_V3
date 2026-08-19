import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createSkill,
  deleteSkill,
  skillKeys,
  skillQueries,
  updateSkill,
} from "../../skills/skills.service";
import { getIcon, getIconOptions } from "../../../shared/data/icons";
import { certificateQueries } from "../../certificates/certificates.service";
import PaginationControls from "../components/PaginationControls";
import type { Skill, Writable } from "../../../shared/types";
import SidePannel from "../../../shared/components/SidePannel";
import Dialog from "../../../shared/components/Dialog";
import { useToast } from "../../../shared/components/Toast";
import {
  DataTableShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  TagListField,
  TextField,
  thClass,
  tdClass,
  rowClass,
} from "../components/AdminForm";

const PAGE_SIZE = 10;
const emptySkill = (): Writable<Skill> => ({
  title: "",
  icon: 51,
  priority: 1,
  skill_category_id: null,
  certificate_id: null,
  mastery_level: 50,
  is_new: false,
  details: [],
});

function SkillForm({
  value,
  onChange,
  categories,
  certificates,
  nextPriority,
  onUseNextPriority,
}: Readonly<{
  value: Writable<Skill>;
  onChange: (value: Writable<Skill>) => void;
  categories: { id: string; category: string }[];
  certificates: { id: string; title: string }[];
  nextPriority: number;
  onUseNextPriority: () => void;
}>) {
  const [search, setSearch] = useState("");
  const [iconMenuOpen, setIconMenuOpen] = useState(false);
  const iconMenuRef = useRef<HTMLDivElement>(null);
  const options = useMemo(
    () =>
      getIconOptions().filter((option) =>
        option.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  );
  const Icon = getIcon(value.icon);
  const selectedIconName =
    getIconOptions().find((option) => option.id === value.icon)?.name ??
    "Select icon";
  const change = <K extends keyof Writable<Skill>>(
    key: K,
    item: Writable<Skill>[K],
  ) => onChange({ ...value, [key]: item });
  useEffect(() => {
    if (!iconMenuOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!iconMenuRef.current) return;
      if (!iconMenuRef.current.contains(event.target as Node)) {
        setIconMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [iconMenuOpen]);
  return (
    <div className="space-y-5">
      <TextField
        label="Title"
        value={value.title}
        onChange={(item) => change("title", item)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <TextField
            label="Search icons"
            value={search}
            onChange={setSearch}
            placeholder="Search icon names"
          />
          <div className="flex items-center gap-2 text-sm text-primary">
            <Icon className="size-4" /> Selected icon
          </div>
          <div ref={iconMenuRef} className="relative">
            <label className="block">
              <span className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Icon
              </span>
              <button
                type="button"
                onClick={() => setIconMenuOpen((open) => !open)}
                className="flex w-full cursor-pointer items-center justify-between rounded-md border border-outline-variant/40 bg-surface-container-highest/70 px-3 py-3 text-left font-body text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon className="size-4" />
                  {selectedIconName}
                </span>
                <span className="text-on-surface-variant">▼</span>
              </button>
            </label>
            {iconMenuOpen ? (
              <div className="absolute z-20 mt-2 max-h-56 w-full overflow-y-auto rounded-md border border-outline-variant/40 bg-surface-container-high shadow-lg">
                {options.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-on-surface-variant">
                    No icons found.
                  </p>
                ) : (
                  options.map((option) => {
                    const OptionIcon = getIcon(option.id);
                    const selected = option.id === value.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          change("icon", option.id);
                          setIconMenuOpen(false);
                        }}
                        className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                          selected
                            ? "bg-primary/15 text-primary"
                            : "text-on-surface hover:bg-surface-container-highest"
                        }`}
                      >
                        <OptionIcon className="size-4 shrink-0" />
                        <span>{option.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            ) : null}
          </div>
        </div>
        <SelectField
          label="Category"
          value={value.skill_category_id ?? ""}
          onChange={(item) => change("skill_category_id", item || null)}
        >
          <option value="">No category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.category}
            </option>
          ))}
        </SelectField>
        <label className="block">
          <span className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
            Priority
          </span>
          <input
            className="w-full rounded-md border border-outline-variant/40 bg-surface-container-low/40 px-3 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            type="number"
            min={1}
            step={1}
            value={value.priority}
            onChange={(event) =>
              change("priority", Math.max(1, Number(event.target.value) || 1))
            }
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-on-surface-variant">
              Next in selected category: {nextPriority}
            </p>
            <button
              type="button"
              onClick={onUseNextPriority}
              className="cursor-pointer font-label text-xs uppercase tracking-widest text-primary hover:text-secondary"
            >
              Use next
            </button>
          </div>
        </label>
        <SelectField
          label="Certificate"
          value={value.certificate_id ?? ""}
          onChange={(item) => change("certificate_id", item || null)}
        >
          <option value="">No certificate</option>
          {certificates.map((certificate) => (
            <option key={certificate.id} value={certificate.id}>
              {certificate.title}
            </option>
          ))}
        </SelectField>
      </div>
      <label className="block">
        <span className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">
          Mastery: {value.mastery_level}%
        </span>
        <input
          className="w-full accent-primary"
          type="range"
          min="0"
          max="100"
          step="5"
          value={value.mastery_level}
          onChange={(event) =>
            change("mastery_level", Number(event.target.value))
          }
        />
      </label>
      <label className="flex items-center gap-3 text-sm text-on-surface">
        <input
          className="size-4 accent-primary"
          type="checkbox"
          checked={value.is_new}
          onChange={(event) => change("is_new", event.target.checked)}
        />{" "}
        Mark as new
      </label>
      <TagListField
        label="Details"
        items={value.details}
        onChange={(items) => change("details", items)}
        placeholder="Add a detail and press Enter"
      />
    </div>
  );
}

export default function SkillsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: skills = [] } = useQuery(skillQueries.list());
  const { data: categories = [] } = useQuery(skillQueries.categories());
  const { data: certificates = [] } = useQuery(certificateQueries.list());
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<Writable<Skill>>(emptySkill);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [certificateFilter, setCertificateFilter] = useState<
    "all" | "with" | "without"
  >("all");
  const [newFilter, setNewFilter] = useState<"all" | "new" | "not-new">("all");
  const nextPriority = useMemo(() => {
    if (!draft.skill_category_id) return 1;
    const maxInCategory = skills
      .filter(
        (skill) =>
          skill.skill_category_id === draft.skill_category_id &&
          skill.id !== editingId,
      )
      .reduce((max, skill) => Math.max(max, skill.priority), 0);
    return maxInCategory + 1;
  }, [draft.skill_category_id, editingId, skills]);
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: skillKeys.all });
  const create = useMutation({
    mutationFn: () => createSkill(draft),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Skill created" });
      setPanelOpen(false);
      setPage(1);
    },
    onError: (error) =>
      toast.error({
        title: "Could not create skill",
        description: error instanceof Error ? error.message : "Unknown error",
      }),
  });
  const update = useMutation({
    mutationFn: ({ id, row }: { id: string; row: Writable<Skill> }) =>
      updateSkill(id, row),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Skill updated" });
      closePanel();
    },
    onError: (error) =>
      toast.error({
        title: "Could not update skill",
        description: error instanceof Error ? error.message : "Unknown error",
      }),
  });
  const remove = useMutation({
    mutationFn: deleteSkill,
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Skill deleted" });
      setDeleteTarget(null);
    },
    onError: (error) =>
      toast.error({
        title: "Could not delete skill",
        description: error instanceof Error ? error.message : "Unknown error",
      }),
  });
  const filteredSkills = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return skills.filter((skill) => {
      const categoryName =
        categories.find((category) => category.id === skill.skill_category_id)
          ?.category ?? "";
      const matchesSearch =
        !term ||
        skill.title.toLowerCase().includes(term) ||
        categoryName.toLowerCase().includes(term) ||
        skill.details.some((detail) => detail.toLowerCase().includes(term));
      const matchesCategory =
        !categoryFilter || skill.skill_category_id === categoryFilter;
      const matchesCertificate =
        certificateFilter === "all" ||
        (certificateFilter === "with" && Boolean(skill.certificate_id)) ||
        (certificateFilter === "without" && !skill.certificate_id);
      const matchesNew =
        newFilter === "all" ||
        (newFilter === "new" && skill.is_new) ||
        (newFilter === "not-new" && !skill.is_new);
      return (
        matchesSearch && matchesCategory && matchesCertificate && matchesNew
      );
    });
  }, [skills, categories, searchTerm, categoryFilter, certificateFilter, newFilter]);
  const rows = filteredSkills.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => {
    setPage(1);
  }, [searchTerm, categoryFilter, certificateFilter, newFilter]);
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredSkills.length / PAGE_SIZE));
    if (page > totalPages) setPage(totalPages);
  }, [filteredSkills.length, page]);
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    categoryFilter.length > 0 ||
    certificateFilter !== "all" ||
    newFilter !== "all";
  const save = () =>
    mode === "create"
      ? create.mutate()
      : editingId && update.mutate({ id: editingId, row: draft });
  const openCreate = () => {
    setMode("create");
    setDraft(emptySkill());
    setEditingId(null);
    setPanelOpen(true);
  };
  const openEdit = (skill: Skill) => {
    const { id, created_at: _c, updated_at: _u, ...row } = skill;
    setMode("edit");
    setEditingId(id);
    setDraft(row);
    setPanelOpen(true);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Skills"
        description="Edit portfolio skills and their metadata."
        action={
          <PrimaryButton onClick={openCreate}>
            <Plus className="size-4" /> Add skill
          </PrimaryButton>
        }
      />
      <DataTableShell>
        <div className="grid gap-4 border-b border-white/10 px-4 py-4 sm:grid-cols-2 lg:grid-cols-5">
          <TextField
            label="Search"
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Title, category, details..."
          />
          <SelectField
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.category}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Certificate"
            value={certificateFilter}
            onChange={(value) =>
              setCertificateFilter(value as "all" | "with" | "without")
            }
          >
            <option value="all">All</option>
            <option value="with">With certificate</option>
            <option value="without">Without certificate</option>
          </SelectField>
          <SelectField
            label="Status"
            value={newFilter}
            onChange={(value) =>
              setNewFilter(value as "all" | "new" | "not-new")
            }
          >
            <option value="all">All</option>
            <option value="new">New only</option>
            <option value="not-new">Not new</option>
          </SelectField>
          <div className="flex items-end">
            <SecondaryButton
              disabled={!hasActiveFilters}
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
                setCertificateFilter("all");
                setNewFilter("all");
              }}
            >
              Clear filters
            </SecondaryButton>
          </div>
        </div>
      </DataTableShell>
      <DataTableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Icon",
                  "Title",
                  "Category",
                  "Priority",
                  "Certificate",
                  "Mastery",
                  "Details",
                  "Actions",
                ].map((header) => (
                  <th key={header} className={thClass}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((skill) => {
                const Icon = getIcon(skill.icon);
                return (
                  <tr key={skill.id} className={rowClass}>
                    <td className={tdClass}>
                      <Icon className="size-5 text-primary" />
                    </td>
                    <td className={tdClass}>{skill.title}</td>
                    <td className={tdClass}>
                      {categories.find(
                        (category) => category.id === skill.skill_category_id,
                      )?.category ?? "—"}
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {skill.priority}
                    </td>
                    <td className={tdClass}>
                      {certificates.find(
                        (certificate) =>
                          certificate.id === skill.certificate_id,
                      )?.title ?? "—"}
                    </td>
                    <td className={`${tdClass} tabular-nums`}>
                      {skill.mastery_level}%
                    </td>
                    <td className={tdClass}>
                      {skill.details.join(", ") || "—"}
                    </td>
                    <td className={tdClass}>
                      <button
                        type="button"
                        aria-label={`Edit ${skill.title}`}
                        onClick={() => openEdit(skill)}
                        className="mr-2 cursor-pointer text-primary"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${skill.title}`}
                        onClick={() =>
                          setDeleteTarget({ id: skill.id, label: skill.title })
                        }
                        className="cursor-pointer text-secondary"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className={`${tdClass} py-8 text-center text-on-surface-variant`}
                  >
                    No skills match current filters.
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
            totalItems={filteredSkills.length}
            onPageChange={setPage}
          />
        </div>
      </DataTableShell>
      <SidePannel
        open={panelOpen}
        onClose={closePanel}
        title={mode === "create" ? "Add skill" : "Edit skill"}
        widthClassName="w-full max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={closePanel}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={save}
              disabled={create.isPending || update.isPending}
            >
              {mode === "create" ? "Save skill" : "Save changes"}
            </PrimaryButton>
          </div>
        }
      >
        <SkillForm
          value={draft}
          onChange={setDraft}
          categories={categories}
          certificates={certificates}
          nextPriority={nextPriority}
          onUseNextPriority={() =>
            setDraft((current) => ({ ...current, priority: nextPriority }))
          }
        />
      </SidePannel>
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete skill?"
        description={`This will permanently delete ${deleteTarget?.label ?? "this skill"}.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        confirming={remove.isPending}
      />
    </div>
  );
}
