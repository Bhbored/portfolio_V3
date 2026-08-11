import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  createExperience,
  deleteExperience,
  experienceKeys,
  experienceQueries,
  updateExperience,
} from "../../experience/experiences.service"
import PaginationControls from "../components/PaginationControls"
import type { Experience, Writable } from "../../../shared/types"
import SidePannel from "../../../shared/components/SidePannel"
import Dialog from "../../../shared/components/Dialog"
import { useToast } from "../../../shared/components/Toast"
import { DataTableShell, PageHeader, PrimaryButton, SecondaryButton, TagListField, TextField, thClass, tdClass, rowClass } from "../components/AdminForm"

const PAGE_SIZE = 10
const blank = (): Writable<Experience> => ({ title: "", company: "", period: "", description: [] })
function ExperienceForm({ value, onChange }: Readonly<{ value: Writable<Experience>; onChange: (value: Writable<Experience>) => void }>) {
  const change = <K extends keyof Writable<Experience>>(key: K, item: Writable<Experience>[K]) => onChange({ ...value, [key]: item })
  return <div className="space-y-5"><TextField label="Title" value={value.title} onChange={(item) => change("title", item)} required /><TextField label="Company" value={value.company} onChange={(item) => change("company", item)} required /><TextField label="Period" value={value.period} onChange={(item) => change("period", item)} /><TagListField label="Description bullets" items={value.description} onChange={(items) => change("description", items)} placeholder="Add a bullet and press Enter" /></div>
}
export default function ExperiencesPage() {
  const client = useQueryClient(); const toast = useToast(); const { data: experiences = [] } = useQuery(experienceQueries.list())
  const [page, setPage] = useState(1); const [panelOpen, setPanelOpen] = useState(false); const [mode, setMode] = useState<"create" | "edit">("create"); const [draft, setDraft] = useState<Writable<Experience>>(blank); const [editingId, setEditingId] = useState<string | null>(null); const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const invalidate = () => client.invalidateQueries({ queryKey: experienceKeys.all }); const failed = (error: unknown) => toast.error({ title: "Could not save experience", description: error instanceof Error ? error.message : "Unknown error" }); const create = useMutation({ mutationFn: () => createExperience(draft), onSuccess: async () => { await invalidate(); toast.success({ title: "Experience created" }); setPanelOpen(false) }, onError: failed }); const update = useMutation({ mutationFn: () => editingId ? updateExperience(editingId, draft) : Promise.reject(new Error("No experience selected")), onSuccess: async () => { await invalidate(); toast.success({ title: "Experience updated" }); setPanelOpen(false) }, onError: failed }); const remove = useMutation({ mutationFn: deleteExperience, onSuccess: async () => { await invalidate(); toast.success({ title: "Experience deleted" }); setDeleteTarget(null) }, onError: (error) => toast.error({ title: "Could not delete experience", description: error instanceof Error ? error.message : "Unknown error" }) }); const rows = experiences.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const openEdit = (row: Experience) => { const { id, created_at: _c, updated_at: _u, ...item } = row; if (!id) return; setMode("edit"); setEditingId(id); setDraft(item); setPanelOpen(true) }
  return <div className="space-y-6"><PageHeader title="Experience" description="Manage your professional experience." action={<PrimaryButton onClick={() => { setMode("create"); setDraft(blank()); setEditingId(null); setPanelOpen(true) }}><Plus className="size-4" /> Add experience</PrimaryButton>} /><DataTableShell><div className="overflow-x-auto"><table className="w-full min-w-[750px] text-left"><thead><tr className="border-b border-white/10">{["Title","Company","Period","Description","Actions"].map((item) => <th key={item} className={thClass}>{item}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={row.id} className={rowClass}><td className={tdClass}>{row.title}</td><td className={tdClass}>{row.company}</td><td className={tdClass}>{row.period}</td><td className={tdClass}>{row.description.join(" · ") || "—"}</td><td className={tdClass}>{row.id ? <><button type="button" className="mr-2 cursor-pointer text-primary" onClick={() => openEdit(row)} aria-label={`Edit ${row.title}`}><Pencil className="size-4" /></button><button type="button" className="cursor-pointer text-secondary" onClick={() => setDeleteTarget({ id: row.id!, label: row.title })} aria-label={`Delete ${row.title}`}><Trash2 className="size-4" /></button></> : "—"}</td></tr>)}{rows.length === 0 ? <tr><td colSpan={5} className={`${tdClass} py-8 text-center text-on-surface-variant`}>No experience yet.</td></tr> : null}</tbody></table></div><div className="px-4"><PaginationControls currentPage={page} pageSize={PAGE_SIZE} totalItems={experiences.length} onPageChange={setPage} /></div></DataTableShell><SidePannel open={panelOpen} onClose={() => setPanelOpen(false)} title={mode === "create" ? "Add experience" : "Edit experience"} widthClassName="w-full max-w-xl" footer={<div className="flex justify-end gap-3"><SecondaryButton onClick={() => setPanelOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={() => mode === "create" ? create.mutate() : update.mutate()} disabled={create.isPending || update.isPending}>Save</PrimaryButton></div>}><ExperienceForm value={draft} onChange={setDraft} /></SidePannel><Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete experience?" description={`This will permanently delete ${deleteTarget?.label ?? "this experience"}.`} variant="danger" confirmLabel="Delete" onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} confirming={remove.isPending} /></div>
}
