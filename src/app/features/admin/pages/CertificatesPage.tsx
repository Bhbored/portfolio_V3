import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  createCertificate,
  deleteCertificate,
  certificateKeys,
  certificateQueries,
  getTop3SkillsByCertificateId,
  updateCertificate,
  type CertificateRow,
} from "../../certificates/certificates.service";
import { skillQueries } from "../../skills/skills.service";
import PaginationControls from "../components/PaginationControls";
import SidePannel from "../../../shared/components/SidePannel";
import Dialog from "../../../shared/components/Dialog";
import { useToast } from "../../../shared/components/Toast";
import type { Writable } from "../../../shared/types";
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

const emptyCertificate = (): Writable<CertificateRow> => ({
  title: "",
  issuer: "",
  year: "",
  link: null,
  priority: 1,
});

export default function CertificatesPage() {
  const client = useQueryClient();
  const toast = useToast();
  const { data: certificates = [] } = useQuery(certificateQueries.list());
  const { data: skills = [] } = useQuery(skillQueries.list());
  const [page, setPage] = useState(1);
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [draft, setDraft] = useState<Writable<CertificateRow>>(emptyCertificate);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const nextPriority = useMemo(() => {
    const maxPriority = certificates
      .filter((certificate) => certificate.id !== editingId)
      .reduce((max, certificate) => Math.max(max, certificate.priority), 0);
    return maxPriority + 1;
  }, [certificates, editingId]);
  const invalidate = () =>
    client.invalidateQueries({ queryKey: certificateKeys.all });
  const fail = (error: unknown) =>
    toast.error({
      title: "Could not save certificate",
      description: error instanceof Error ? error.message : "Unknown error",
    });
  const create = useMutation({
    mutationFn: () => createCertificate(draft),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Certificate created" });
      closePanel();
      setPage(1);
    },
    onError: fail,
  });
  const update = useMutation({
    mutationFn: () =>
      editingId
        ? updateCertificate(editingId, draft)
        : Promise.reject(new Error("No certificate selected")),
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Certificate updated" });
      closePanel();
    },
    onError: fail,
  });
  const remove = useMutation({
    mutationFn: deleteCertificate,
    onSuccess: async () => {
      await invalidate();
      toast.success({ title: "Certificate deleted" });
      setDeleteTarget(null);
    },
    onError: (error) =>
      toast.error({
        title: "Could not delete certificate",
        description: error instanceof Error ? error.message : "Unknown error",
      }),
  });
  const rows = certificates.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const openCreate = () => {
    setMode("create");
    setDraft(emptyCertificate());
    setEditingId(null);
    setPanelOpen(true);
  };
  const openEdit = (row: CertificateRow) => {
    const { id, created_at: _c, updated_at: _u, ...item } = row;
    setMode("edit");
    setEditingId(id);
    setDraft(item);
    setPanelOpen(true);
  };
  return (
    <div className="space-y-6">
      <PageHeader
        title="Certificates"
        description="Manage certifications, linked skills, and display order."
        action={
          <PrimaryButton onClick={openCreate}>
            <Plus className="size-4" /> Add certificate
          </PrimaryButton>
        }
      />
      <DataTableShell>
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left">
            <thead>
              <tr className="border-b border-white/10">
                {[
                  "Priority",
                  "Title",
                  "Issuer",
                  "Year",
                  "Link",
                  "Top skills",
                  "Actions",
                ].map((item) => (
                  <th key={item} className={thClass}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className={rowClass}>
                  <td className={`${tdClass} tabular-nums`}>{row.priority}</td>
                  <td className={tdClass}>{row.title}</td>
                  <td className={tdClass}>{row.issuer}</td>
                  <td className={tdClass}>{row.year}</td>
                  <td className={tdClass}>
                    {row.link ? (
                      <a
                        className="text-primary underline"
                        href={row.link}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className={tdClass}>
                    {getTop3SkillsByCertificateId(skills, row.id)
                      .map((skill) => skill.title)
                      .join(", ") || "—"}
                  </td>
                  <td className={tdClass}>
                    <button
                      type="button"
                      className="mr-2 cursor-pointer text-primary"
                      onClick={() => openEdit(row)}
                      aria-label={`Edit ${row.title}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      className="cursor-pointer text-secondary"
                      onClick={() =>
                        setDeleteTarget({ id: row.id, label: row.title })
                      }
                      aria-label={`Delete ${row.title}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className={`${tdClass} py-8 text-center text-on-surface-variant`}
                  >
                    No certificates yet.
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
            totalItems={certificates.length}
            onPageChange={setPage}
          />
        </div>
      </DataTableShell>
      <SidePannel
        open={panelOpen}
        onClose={closePanel}
        title={mode === "create" ? "Add certificate" : "Edit certificate"}
        widthClassName="w-full max-w-xl"
        footer={
          <div className="flex justify-end gap-3">
            <SecondaryButton onClick={closePanel}>Cancel</SecondaryButton>
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
        <div className="space-y-5">
          <TextField
            label="Title"
            value={draft.title}
            onChange={(value) => setDraft({ ...draft, title: value })}
            required
          />
          <TextField
            label="Issuer"
            value={draft.issuer}
            onChange={(value) => setDraft({ ...draft, issuer: value })}
            required
          />
          <TextField
            label="Year"
            value={draft.year}
            onChange={(value) => setDraft({ ...draft, year: value })}
          />
          <TextField
            label="Link"
            type="url"
            value={draft.link ?? ""}
            onChange={(value) => setDraft({ ...draft, link: value || null })}
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
                setDraft({
                  ...draft,
                  priority: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-on-surface-variant">
                Next available priority: {nextPriority}
              </p>
              <button
                type="button"
                onClick={() => setDraft({ ...draft, priority: nextPriority })}
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
        title="Delete certificate?"
        description={`This will permanently delete ${deleteTarget?.label ?? "this certificate"}.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
        confirming={remove.isPending}
      />
    </div>
  );
}
