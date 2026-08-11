import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import {
  createSkill,
  deleteSkill,
  skillKeys,
  skillQueries,
  updateSkill,
} from "../../skills/skills.service"
import { getIcon, getIconOptions } from "../../../shared/data/icons"
import { certificateQueries } from "../../certificates/certificates.service"
import PaginationControls from "../components/PaginationControls"
import type { Skill, Writable } from "../../../shared/types"
import SidePannel from "../../../shared/components/SidePannel"
import Dialog from "../../../shared/components/Dialog"
import { useToast } from "../../../shared/components/Toast"
import {
  DataTableShell, PageHeader, PrimaryButton, SecondaryButton, SelectField, TagListField,
  TextField, thClass, tdClass, rowClass,
} from "../components/AdminForm"

const PAGE_SIZE = 10
const emptySkill = (): Writable<Skill> => ({ title: "", icon: 51, skill_category_id: null, certificate_id: null, mastery_level: 50, is_new: false, details: [] })

function SkillForm({ value, onChange, categories, certificates }: Readonly<{ value: Writable<Skill>; onChange: (value: Writable<Skill>) => void; categories: { id: string; category: string }[]; certificates: { id: string; title: string }[] }>) {
  const [search, setSearch] = useState("")
  const options = useMemo(() => getIconOptions().filter((option) => option.name.toLowerCase().includes(search.toLowerCase())), [search])
  const Icon = getIcon(value.icon)
  const change = <K extends keyof Writable<Skill>>(key: K, item: Writable<Skill>[K]) => onChange({ ...value, [key]: item })
  return <div className="space-y-5"><TextField label="Title" value={value.title} onChange={(item) => change("title", item)} required /><div className="grid gap-5 sm:grid-cols-2"><div className="space-y-2"><TextField label="Search icons" value={search} onChange={setSearch} placeholder="Search icon names" /><div className="flex items-center gap-2 text-sm text-primary"><Icon className="size-4" /> Selected icon</div><SelectField label="Icon" value={value.icon} onChange={(item) => change("icon", Number(item))}>{options.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</SelectField></div><SelectField label="Category" value={value.skill_category_id ?? ""} onChange={(item) => change("skill_category_id", item || null)}><option value="">No category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.category}</option>)}</SelectField><SelectField label="Certificate" value={value.certificate_id ?? ""} onChange={(item) => change("certificate_id", item || null)}><option value="">No certificate</option>{certificates.map((certificate) => <option key={certificate.id} value={certificate.id}>{certificate.title}</option>)}</SelectField></div><label className="block"><span className="mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant">Mastery: {value.mastery_level}%</span><input className="w-full accent-primary" type="range" min="0" max="100" step="5" value={value.mastery_level} onChange={(event) => change("mastery_level", Number(event.target.value))} /></label><label className="flex items-center gap-3 text-sm text-on-surface"><input className="size-4 accent-primary" type="checkbox" checked={value.is_new} onChange={(event) => change("is_new", event.target.checked)} /> Mark as new</label><TagListField label="Details" items={value.details} onChange={(items) => change("details", items)} placeholder="Add a detail and press Enter" /></div>
}

export default function SkillsPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data: skills = [] } = useQuery(skillQueries.list())
  const { data: categories = [] } = useQuery(skillQueries.categories())
  const { data: certificates = [] } = useQuery(certificateQueries.list())
  const [page, setPage] = useState(1)
  const [panelOpen, setPanelOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [draft, setDraft] = useState<Writable<Skill>>(emptySkill)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; label: string } | null>(null)
  const invalidate = () => queryClient.invalidateQueries({ queryKey: skillKeys.all })
  const create = useMutation({ mutationFn: () => createSkill(draft), onSuccess: async () => { await invalidate(); toast.success({ title: "Skill created" }); setPanelOpen(false); setPage(Math.max(1, Math.ceil((skills.length + 1) / PAGE_SIZE))) }, onError: (error) => toast.error({ title: "Could not create skill", description: error instanceof Error ? error.message : "Unknown error" }) })
  const update = useMutation({ mutationFn: ({ id, row }: { id: string; row: Writable<Skill> }) => updateSkill(id, row), onSuccess: async () => { await invalidate(); toast.success({ title: "Skill updated" }); setPanelOpen(false) }, onError: (error) => toast.error({ title: "Could not update skill", description: error instanceof Error ? error.message : "Unknown error" }) })
  const remove = useMutation({ mutationFn: deleteSkill, onSuccess: async () => { await invalidate(); toast.success({ title: "Skill deleted" }); setDeleteTarget(null); if (skills.length - 1 <= (page - 1) * PAGE_SIZE && page > 1) setPage(page - 1) }, onError: (error) => toast.error({ title: "Could not delete skill", description: error instanceof Error ? error.message : "Unknown error" }) })
  const rows = skills.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const save = () => mode === "create" ? create.mutate() : editingId && update.mutate({ id: editingId, row: draft })
  const openCreate = () => { setMode("create"); setDraft(emptySkill()); setEditingId(null); setPanelOpen(true) }
  const openEdit = (skill: Skill) => { const { id, created_at: _c, updated_at: _u, ...row } = skill; setMode("edit"); setEditingId(id); setDraft(row); setPanelOpen(true) }
  return <div className="space-y-6"><PageHeader title="Skills" description="Edit portfolio skills and their metadata." action={<PrimaryButton onClick={openCreate}><Plus className="size-4" /> Add skill</PrimaryButton>} /><DataTableShell><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-white/10">{["Icon","Title","Category","Certificate","Mastery","Details","Actions"].map((header) => <th key={header} className={thClass}>{header}</th>)}</tr></thead><tbody>{rows.map((skill) => { const Icon = getIcon(skill.icon); return <tr key={skill.id} className={rowClass}><td className={tdClass}><Icon className="size-5 text-primary" /></td><td className={tdClass}>{skill.title}</td><td className={tdClass}>{categories.find((category) => category.id === skill.skill_category_id)?.category ?? "—"}</td><td className={tdClass}>{certificates.find((certificate) => certificate.id === skill.certificate_id)?.title ?? "—"}</td><td className={`${tdClass} tabular-nums`}>{skill.mastery_level}%</td><td className={tdClass}>{skill.details.join(", ") || "—"}</td><td className={tdClass}><button type="button" aria-label={`Edit ${skill.title}`} onClick={() => openEdit(skill)} className="mr-2 cursor-pointer text-primary"><Pencil className="size-4" /></button><button type="button" aria-label={`Delete ${skill.title}`} onClick={() => setDeleteTarget({ id: skill.id, label: skill.title })} className="cursor-pointer text-secondary"><Trash2 className="size-4" /></button></td></tr> })}{rows.length === 0 ? <tr><td colSpan={7} className={`${tdClass} py-8 text-center text-on-surface-variant`}>No skills yet.</td></tr> : null}</tbody></table></div><div className="px-4"><PaginationControls currentPage={page} pageSize={PAGE_SIZE} totalItems={skills.length} onPageChange={setPage} /></div></DataTableShell><SidePannel open={panelOpen} onClose={() => setPanelOpen(false)} title={mode === "create" ? "Add skill" : "Edit skill"} widthClassName="w-full max-w-xl" footer={<div className="flex justify-end gap-3"><SecondaryButton onClick={() => setPanelOpen(false)}>Cancel</SecondaryButton><PrimaryButton onClick={save} disabled={create.isPending || update.isPending}>{mode === "create" ? "Save skill" : "Save changes"}</PrimaryButton></div>}><SkillForm value={draft} onChange={setDraft} categories={categories} certificates={certificates} /></SidePannel><Dialog open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} title="Delete skill?" description={`This will permanently delete ${deleteTarget?.label ?? "this skill"}.`} variant="danger" confirmLabel="Delete" onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)} confirming={remove.isPending} /></div>
}
