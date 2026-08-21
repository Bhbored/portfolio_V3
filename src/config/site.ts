import type { PersonalInfo } from "../app/shared/types"

export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL as string | undefined
  return (raw ?? "").replace(/\/+$/, "")
}

export function getPageTitle(info: PersonalInfo, page?: string): string {
  const name = info.name.trim() || "Portfolio"
  const job = info.title.trim() || "Developer"
  const base = `${name} | ${job}`
  return page ? `${page} | ${name}` : base
}

export function getMetaDescription(info: PersonalInfo): string {
  return (
    info.summary.trim() ||
    info.headline.trim() ||
    `${info.title.trim() || "Developer"} portfolio`
  )
}

export function applyPersonalInfoToDocument(info: PersonalInfo): void {
  if (!info.name.trim()) return

  document.title = getPageTitle(info)

  const setMeta = (selector: string, attr: string, value: string) => {
    if (!value) return
    const el = document.querySelector(selector)
    if (el) el.setAttribute(attr, value)
  }

  const description = getMetaDescription(info)
  setMeta('meta[name="description"]', "content", description)
  setMeta('meta[name="title"]', "content", document.title)
  setMeta('meta[name="author"]', "content", info.name)
  setMeta('meta[property="og:title"]', "content", document.title)
  setMeta('meta[property="og:description"]', "content", description)
  setMeta('meta[property="og:site_name"]', "content", info.name)
  setMeta('meta[name="twitter:title"]', "content", document.title)
  setMeta('meta[name="twitter:description"]', "content", description)
  if (info.profile_image) {
    setMeta('meta[property="og:image"]', "content", info.profile_image)
    setMeta('meta[name="twitter:image"]', "content", info.profile_image)
  }
}
