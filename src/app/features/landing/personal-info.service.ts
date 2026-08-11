import { queryOptions } from "@tanstack/react-query"
import { supabase } from "../../shared/api/supabase"
import { STALE_TIME, throwIfError } from "../../shared/api/supabase-utils"
import type {
  PersonalInfo,
  SocialLinks,
  Language,
  ProficiencyLevel,
  Writable,
} from "../../shared/types"

export const personalInfoKeys = {
  all: ["personalInfo"] as const,
  detail: () => [...personalInfoKeys.all, "detail"] as const,
}

export const EMPTY_PERSONAL_INFO: PersonalInfo = {
  name: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  summary: "",
  headline: "",
  profile_image: "",
  is_available_for_work: false,
  social: { github: "", linkedin: "" },
  languages: [],
  created_at: "",
  updated_at: "",
}

function asSocial(value: unknown): SocialLinks {
  const social = (value ?? {}) as Record<string, unknown>
  return {
    github: String(social.github ?? social.Github ?? ""),
    linkedin: String(social.linkedin ?? social.Linkedin ?? ""),
  }
}

function asLanguages(value: unknown): Language[] {
  if (!Array.isArray(value)) return []
  return value.map((item) => {
    const lang = (item ?? {}) as Record<string, unknown>
    return {
      name: String(lang.name ?? lang.Name ?? ""),
      proficiency: Number(
        lang.proficiency ?? lang.Proficiency ?? 0,
      ) as ProficiencyLevel,
    }
  })
}

function normalizePersonalInfo(row: PersonalInfo): PersonalInfo {
  return {
    ...row,
    phone: row.phone ?? "",
    location: row.location ?? "",
    summary: row.summary ?? "",
    headline: row.headline ?? "",
    profile_image: row.profile_image ?? "",
    is_available_for_work: row.is_available_for_work ?? false,
    social: asSocial(row.social),
    languages: asLanguages(row.languages),
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
  }
}

function toPersonalInfoPayload(patch: Writable<PersonalInfo>) {
  return {
    name: patch.name,
    title: patch.title,
    email: patch.email,
    phone: patch.phone,
    location: patch.location,
    summary: patch.summary,
    headline: patch.headline,
    profile_image: patch.profile_image,
    is_available_for_work: patch.is_available_for_work,
    social: patch.social,
    languages: patch.languages,
  }
}

export async function fetchPersonalInfo(): Promise<PersonalInfo> {
  const result = await supabase
    .from("personal_info")
    .select("*")
    .limit(1)
    .maybeSingle()

  const row = await throwIfError(result, "personal_info")
  if (!row) return EMPTY_PERSONAL_INFO
  return normalizePersonalInfo(row as PersonalInfo)
}

export async function createPersonalInfo(
  patch: Writable<PersonalInfo>,
): Promise<PersonalInfo> {
  const result = await supabase
    .from("personal_info")
    .insert(toPersonalInfoPayload(patch))
    .select()
    .single()
  const data = await throwIfError(result, "personal_info.create")
  return normalizePersonalInfo(data as PersonalInfo)
}

export async function updatePersonalInfo(
  id: string,
  patch: Writable<PersonalInfo>,
): Promise<PersonalInfo> {
  const result = await supabase
    .from("personal_info")
    .update(toPersonalInfoPayload(patch))
    .eq("id", id)
    .select()
    .single()
  const data = await throwIfError(result, "personal_info.update")
  return normalizePersonalInfo(data as PersonalInfo)
}

export const personalInfoQueries = {
  detail: () =>
    queryOptions({
      queryKey: personalInfoKeys.detail(),
      queryFn: fetchPersonalInfo,
      staleTime: STALE_TIME,
    }),
}
