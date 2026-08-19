import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createProject,
  deleteProject,
  projectKeys,
  projectQueries,
  sortProjectsByHierarchy,
  updateProject,
} from "../../projects/projects.service";
import { getProjectCategoryName } from "../../../../lib/project-category";
import {
  ProjectCategory,
  type Project,
  type Writable,
} from "../../../shared/types";
import SidePannel from "../../../shared/components/SidePannel";
import Dialog from "../../../shared/components/Dialog";
import { useToast } from "../../../shared/components/Toast";
import MediaImage from "../../../shared/components/MediaImage";
import PaginationControls from "../components/PaginationControls";
import {
  ImageUploadField,
  MultiImageUploadField,
} from "../components/ImageUploadField";
import {
  DataTableShell,
  PageHeader,
  PrimaryButton,
  SecondaryButton,
  SelectField,
  TagListField,
  TextAreaField,
  TextField,
  thClass,
  tdClass,
  rowClass,
} from "../components/AdminForm";

const PAGE_SIZE = 10;
const blankProject = (nextHierarchy = 1): Writable<Project> => ({
  title: "",
  description: "",
  image_url: "",
  project_category: ProjectCategory.WebApplication,
  hierarchy: nextHierarchy,
  github_url: "",
  live_url: "",
  technologies: [],
  key_features: [],
  screenshots: [],
});

function ProjectForm({
  value,
  onChange,
  maxHierarchy,
  projects,
  editingId,
}: Readonly<{
  value: Writable<Project>;
  onChange: (value: Writable<Project>) => void;
  maxHierarchy: number;
  projects: readonly Project[];
  editingId: string | null;
}>) {
  const change = <K extends keyof Writable<Project>>(
    key: K,
    item: Writable<Project>[K],
  ) => onChange({ ...value, [key]: item });
  const folder =
    value.title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "projects";
  const hierarchyOptions = Array.from(
    { length: maxHierarchy },
    (_, i) => i + 1,
  );
  const swapWith = projects.find(
    (p) => p.id && p.id !== editingId && p.hierarchy === value.hierarchy,
  );
  return (
    <div className="space-y-5">
      <TextField
        label="Title"
        value={value.title}
        onChange={(item) => change("title", item)}
        required
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Category"
          value={value.project_category}
          onChange={(item) =>
            change("project_category", Number(item) as ProjectCategory)
          }
        >
          {Object.entries(ProjectCategory)
            .filter(([, item]) => typeof item === "number")
            .map(([name, item]) => (
              <option key={name} value={item}>
                {getProjectCategoryName(item as ProjectCategory)}
              </option>
            ))}
        </SelectField>
        <div>
          <SelectField
            label="Hierarchy (position)"
            value={value.hierarchy}
            onChange={(item) => change("hierarchy", Number(item))}
          >
            {hierarchyOptions.map((n) => {
              const owner = projects.find(
                (p) => p.id !== editingId && p.hierarchy === n,
              );
              return (
                <option key={n} value={n}>
                  {n}
                  {n === 1 ? " (first)" : n === maxHierarchy ? " (last)" : ""}
                  {owner ? ` — swap with ${owner.title}` : ""}
                </option>
              );
            })}
          </SelectField>
          {swapWith ? (
            <p className="mt-2 font-body text-xs text-on-surface-variant">
              Saving will swap positions with{" "}
              <span className="text-primary">{swapWith.title}</span>
              {editingId ? (
                <>
                  {" "}
                  (they take #
                  {projects.find((p) => p.id === editingId)?.hierarchy ?? "—"})
                </>
              ) : (
                <> (they move to #{maxHierarchy})</>
              )}
              .
            </p>
          ) : null}
        </div>
      </div>
      <TextAreaField
        label="Description"
        value={value.description}
        onChange={(item) => change("description", item)}
      />
      <ImageUploadField
        label="Cover image"
        value={value.image_url}
        onChange={(item) => change("image_url", item)}
        projectFolder={folder}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="GitHub URL"
          type="url"
          value={value.github_url}
          onChange={(item) => change("github_url", item)}
        />
        <TextField
          label="Live URL"
          type="url"
          value={value.live_url}
          onChange={(item) => change("live_url", item)}
        />
      </div>
      <TagListField
        label="Technologies"
        items={value.technologies}
        onChange={(items) => change("technologies", items)}
        placeholder="Technologies"
      />
      <TagListField
        label="Key features"
        items={value.key_features}
        onChange={(items) => change("key_features", items)}
        placeholder="Key features"
      />
      <MultiImageUploadField
        label="Screenshots"
        values={value.screenshots}
        onChange={(items) => change("screenshots", items)}
        projectFolder={folder}
      />
    </div>
  );
}

export default function ProjectsPage() {
  const client = useQueryClient();
  const toast = useToast();
  const { data: projectsData = [] } = useQuery(projectQueries.list());
  const projects = sortProjectsByHierarchy(projectsData);
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<Writable<Project>>(blankProject);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const invalidate = () =>
    client.invalidateQueries({ queryKey: projectKeys.all });
  const fail = (error: unknown) =>
    toast.error({
      title: "Could not save project",
      description: error instanceof Error ? error.message : "Unknown error",
    });
  const create = useMutation({
    mutationFn: () => createProject(draft),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Project created" });
      setPanelOpen(false);
    },
    onError: fail,
  });
  const update = useMutation({
    mutationFn: () =>
      editingId
        ? updateProject(editingId, draft)
        : Promise.reject(new Error("No project selected")),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Project updated" });
      setPanelOpen(false);
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: deleteProject,
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Project deleted" });
      setDeleteTarget(null);
    },
    onError: (error) =>
      toast.error({
        title: "Could not delete project",
        description: error instanceof Error ? error.message : "Unknown error",
      }),
  });
  const rows = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const maxHierarchy =
    mode === "create" ? projects.length + 1 : Math.max(projects.length, 1);
  const openEdit = (project: Project) => {
    const { id, created_at: _c, updated_at: _u, ...item } = project;
    if (!id) return;
    setMode("edit");
    setEditingId(id);
    setDraft({ ...item, hierarchy: item.hierarchy || 1 });
    setPanelOpen(true);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage portfolio projects and their media."
        action={
          <PrimaryButton
            onClick={() => {
              setMode("create");
              setDraft(blankProject(1));
              setEditingId(null);
              setPanelOpen(true);
            }}
          >
            <Plus className="size-4" /> Add project
          </PrimaryButton>
        }
      />
      <DataTableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 text-left">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "#",
                  "Image",
                  "Title",
                  "Category",
                  "Technologies",
                  "Actions",
                ].map((item) => (
                  <th key={item} className={thClass}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((project) => (
                <tr key={project.id} className={rowClass}>
                  <td className={`${tdClass} tabular-nums`}>
                    {project.hierarchy}
                  </td>
                  <td className={tdClass}>
                    {project.image_url ? (
                      <MediaImage
                        src={project.image_url}
                        alt=""
                        frame="none"
                        className="size-12 rounded-lg"
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={tdClass}>
                    <p>{project.title}</p>
                    <p className="max-w-72 truncate text-xs text-on-surface-variant">
                      {project.description}
                    </p>
                  </td>
                  <td className={tdClass}>
                    {getProjectCategoryName(project.project_category)}
                  </td>
                  <td className={tdClass}>
                    {project.technologies.join(", ") || "—"}
                  </td>
                  <td className={tdClass}>
                    {project.id ? (
                      <>
                        <button
                          type="button"
                          className="mr-2 cursor-pointer text-primary"
                          onClick={() => openEdit(project)}
                          aria-label={`Edit ${project.title}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          className="cursor-pointer text-secondary"
                          onClick={() =>
                            setDeleteTarget({
                              id: project.id!,
                              label: project.title,
                            })
                          }
                          aria-label={`Delete ${project.title}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className={`${tdClass} py-8 text-center text-on-surface-variant`}
                  >
                    No projects yet.
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
            totalItems={projects.length}
            onPageChange={setPage}
          />
        </div>
      </DataTableShell>
      <SidePannel
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        title={mode === "create" ? "Add project" : "Edit project"}
        widthClassName="w-full max-w-2xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={() => setPanelOpen(false)}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              onClick={() =>
                mode === "create" ? create.mutate() : update.mutate()
              }
              disabled={create.isPending || update.isPending}
            >
              Save
            </PrimaryButton>
          </div>
        }
      >
        <ProjectForm
          value={draft}
          onChange={setDraft}
          maxHierarchy={maxHierarchy}
          projects={projects}
          editingId={editingId}
        />
      </SidePannel>
      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete project?"
        description={`This will permanently delete ${deleteTarget?.label ?? "this project"}.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        confirming={remove.isPending}
      />
    </div>
  );
}
