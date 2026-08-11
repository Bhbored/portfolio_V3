import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import {
  EMPTY_PERSONAL_INFO,
  createPersonalInfo,
  personalInfoKeys,
  personalInfoQueries,
  updatePersonalInfo,
} from "../../landing/personal-info.service"
import type { Language, PersonalInfo, ProficiencyLevel } from "../../../shared/types"
import { ProficiencyLevel as Levels } from "../../../shared/types"
import { useToast } from "../../../shared/components/Toast"
import { ImageUploadField } from "../components/ImageUploadField"
import {
  PrimaryButton,
  SelectField,
  TextAreaField,
  TextField,
} from "../components/AdminForm"

const proficiencyLabels: Record<ProficiencyLevel, string> = {
  [Levels.Elementary]: "Elementary",
  [Levels.Intermediate]: "Intermediate",
  [Levels.Advanced]: "Advanced",
  [Levels.Native]: "Native",
}

export default function PersonalInfoPage() {
  const queryClient = useQueryClient()
  const toast = useToast()
  const { data } = useQuery(personalInfoQueries.detail())
  const [form, setForm] = useState<PersonalInfo>(EMPTY_PERSONAL_INFO)

  useEffect(() => {
    if (data) {
      setForm(data)
    }
  }, [data])

  const save = useMutation({
    mutationFn: () => {
      const { id, created_at: _c, updated_at: _u, ...payload } = form
      return id ? updatePersonalInfo(id, payload) : createPersonalInfo(payload)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: personalInfoKeys.all })
      toast.success({ title: "Personal information saved" })
    },
    onError: (error) => {
      toast.error({
        title: "Could not save personal information",
        description: error instanceof Error ? error.message : "Unknown error",
      })
    },
  })

  const update = <K extends keyof PersonalInfo>(key: K, value: PersonalInfo[K]) =>
    setForm((current) => ({ ...current, [key]: value }))
  const updateLanguage = (index: number, patch: Partial<Language>) =>
    update("languages", form.languages.map((language, i) => i === index ? { ...language, ...patch } : language))

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        save.mutate()
      }}
      className="space-y-6"
    >
      <section className="rounded-xl border border-white/10 bg-surface-container-high p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">Personal information</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Manage the details shown on your portfolio.
            </p>
          </div>
          <PrimaryButton type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save changes"}
          </PrimaryButton>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <TextField label="Name" value={form.name} onChange={(value) => update("name", value)} required />
          <TextField label="Title" value={form.title} onChange={(value) => update("title", value)} required />
          <TextField label="Headline" value={form.headline} onChange={(value) => update("headline", value)} />
          <TextField label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
          <TextField label="Phone" value={form.phone} onChange={(value) => update("phone", value)} />
          <TextField label="Location" value={form.location} onChange={(value) => update("location", value)} />
          <div className="md:col-span-2">
            <TextAreaField label="Summary" value={form.summary} onChange={(value) => update("summary", value)} />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Profile image"
              value={form.profile_image}
              onChange={(value) => update("profile_image", value)}
              projectFolder="profile"
              round
            />
          </div>
          <label className="flex items-center gap-3 text-sm text-on-surface">
            <input
              type="checkbox"
              checked={form.is_available_for_work}
              onChange={(event) => update("is_available_for_work", event.target.checked)}
              className="size-4 accent-primary"
            />
            Available for work
          </label>
        </div>
      </section>
      <section className="rounded-xl border border-white/10 bg-surface-container-high p-6">
        <h2 className="font-headline text-lg font-bold">Social links</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextField label="GitHub" value={form.social.github} onChange={(value) => update("social", { ...form.social, github: value })} />
          <TextField label="LinkedIn" value={form.social.linkedin} onChange={(value) => update("social", { ...form.social, linkedin: value })} />
        </div>
      </section>
      <section className="rounded-xl border border-white/10 bg-surface-container-high p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-bold">Languages</h2>
          <button type="button" onClick={() => update("languages", [...form.languages, { name: "", proficiency: Levels.Elementary }])} className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary">
            <Plus className="size-4" /> Add language
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {form.languages.map((language, index) => (
            <div key={`${language.name}-${index}`} className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <TextField label="Language" value={language.name} onChange={(value) => updateLanguage(index, { name: value })} />
              <SelectField label="Proficiency" value={language.proficiency} onChange={(value) => updateLanguage(index, { proficiency: Number(value) as ProficiencyLevel })}>
                {Object.entries(proficiencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </SelectField>
              <button type="button" aria-label={`Remove ${language.name || "language"}`} onClick={() => update("languages", form.languages.filter((_, i) => i !== index))} className="mt-6 inline-flex size-11 cursor-pointer items-center justify-center text-secondary">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </form>
  )
}
