import { useState, type ReactNode } from "react"
import { ChevronDown, X } from "lucide-react"

const fieldClass =
  "w-full rounded-md border border-outline-variant/40 bg-surface-container-low/40 px-3 py-3 font-body text-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"

const labelClass =
  "mb-2 block font-label text-xs uppercase tracking-widest text-on-surface-variant"

export function FieldLabel({ children }: { readonly children: ReactNode }) {
  return <span className={labelClass}>{children}</span>
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: Readonly<{
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}>) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </label>
  )
}

export function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: Readonly<{
  label: string
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
}>) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} resize-y`}
      />
    </label>
  )
}

export function SelectField({
  label,
  value,
  onChange,
  children,
}: Readonly<{
  label: string
  value: string | number
  onChange: (value: string) => void
  children: ReactNode
}>) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} cursor-pointer appearance-none bg-surface-container-highest/70 pr-10`}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
      </div>
    </label>
  )
}

export function TagListField({
  label,
  items,
  onChange,
  placeholder,
}: Readonly<{
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}>) {
  const [draft, setDraft] = useState("")

  const commit = (raw: string) => {
    const next = parseTagInput(raw)
    if (!next.length) return
    const merged = [...items]
    for (const item of next) {
      if (!merged.includes(item)) merged.push(item)
    }
    onChange(merged)
    setDraft("")
  }

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mb-2 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 font-label text-xs text-primary"
          >
            {item}
            <button
              type="button"
              aria-label={`Remove ${item}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
              className="cursor-pointer hover:text-secondary"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <textarea
        value={draft}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text")
          if (!text.includes("\n") && !text.includes(",")) return
          e.preventDefault()
          commit(`${draft}${draft && !draft.endsWith("\n") ? "\n" : ""}${text}`)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            commit(draft)
          }
        }}
        className={`${fieldClass} min-h-20 resize-y`}
      />
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          disabled={!draft.trim()}
          onClick={() => commit(draft)}
          className="inline-flex cursor-pointer items-center rounded-md border border-outline-variant/30 px-3 py-1.5 font-label text-xs uppercase tracking-widest text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

/** Newlines preferred; commas only when the paste/input is a single line. */
function parseTagInput(raw: string): string[] {
  const trimmed = raw.trim()
  if (!trimmed) return []
  const parts = trimmed.includes("\n")
    ? trimmed.split(/\n+/)
    : trimmed.split(",")
  return parts.map((part) => part.trim()).filter(Boolean)
}

export function PrimaryButton({
  children,
  disabled,
  type = "button",
  onClick,
}: Readonly<{
  children: ReactNode
  disabled?: boolean
  type?: "button" | "submit"
  onClick?: () => void
}>) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md bg-linear-to-r from-primary to-secondary px-5 py-2.5 font-label text-xs uppercase tracking-widest text-background transition hover:scale-102 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}: Readonly<{
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}>) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-outline-variant/30 bg-surface-container-highest px-5 py-2.5 font-label text-xs uppercase tracking-widest text-on-surface-variant transition hover:text-on-surface disabled:opacity-50"
    >
      {children}
    </button>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: Readonly<{
  title: string
  description: string
  action?: ReactNode
}>) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline text-2xl font-bold text-on-surface md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 font-body text-sm text-on-surface-variant">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}

export function DataTableShell({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-surface-container-high shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
      {children}
    </section>
  )
}

export const thClass =
  "px-4 py-3.5 font-label text-xs uppercase tracking-widest text-on-surface-variant"
export const tdClass = "px-4 py-3.5 font-body text-sm text-on-surface"
export const rowClass =
  "border-b border-white/5 transition-colors hover:bg-white/[0.03]"
