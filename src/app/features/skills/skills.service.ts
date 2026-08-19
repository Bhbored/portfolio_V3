import { queryOptions } from "@tanstack/react-query"
import { supabase } from "../../shared/api/supabase"
import {
  STALE_TIME,
  asStringArray,
  asTimestamp,
  stripTimestamps,
  throwIfError,
} from "../../shared/api/supabase-utils"
import type { Skill, SkillCategory, Writable } from "../../shared/types"

export type NewSkill = Writable<Skill>
export type NewCategory = Writable<SkillCategory>

export const skillKeys = {
  all: ["skills"] as const,
  list: () => [...skillKeys.all, "list"] as const,
  categories: () => [...skillKeys.all, "categories"] as const,
}

function normalizeSkill(row: Skill): Skill {
  return {
    ...row,
    icon: row.icon ?? 0,
    priority: Number(row.priority ?? 1),
    mastery_level: Number(row.mastery_level ?? 0),
    is_new: row.is_new ?? false,
    details: asStringArray(row.details),
    created_at: asTimestamp(row.created_at),
    updated_at: asTimestamp(row.updated_at),
  }
}

function normalizeCategory(row: SkillCategory): SkillCategory {
  return {
    ...row,
    priority: Number(row.priority ?? 1),
    created_at: asTimestamp(row.created_at),
    updated_at: asTimestamp(row.updated_at),
  }
}

export async function fetchSkills(): Promise<Skill[]> {
  const result = await supabase
    .from("skills")
    .select("*")
    .order("skill_category_id", { ascending: true, nullsFirst: false })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false })
  const rows = await throwIfError(result, "skills")
  return ((rows ?? []) as Skill[]).map(normalizeSkill)
}

export async function createSkill(row: NewSkill): Promise<Skill> {
  const result = await supabase
    .from("skills")
    .insert(stripTimestamps(row))
    .select()
    .single()
  const data = await throwIfError(result, "skills.create")
  return normalizeSkill(data as Skill)
}

export async function updateSkill(id: string, row: NewSkill): Promise<Skill> {
  const result = await supabase
    .from("skills")
    .update(stripTimestamps(row))
    .eq("id", id)
    .select()
    .single()
  const data = await throwIfError(result, "skills.update")
  return normalizeSkill(data as Skill)
}

export async function deleteSkill(id: string): Promise<void> {
  const result = await supabase.from("skills").delete().eq("id", id)
  await throwIfError(result, "skills.delete")
}

export async function fetchSkillCategories(): Promise<SkillCategory[]> {
  const result = await supabase
    .from("skill_categories")
    .select("*")
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false })
  const rows = await throwIfError(result, "skill_categories")
  return ((rows ?? []) as SkillCategory[]).map(normalizeCategory)
}

export async function createCategory(row: NewCategory): Promise<SkillCategory> {
  const result = await supabase
    .from("skill_categories")
    .insert(stripTimestamps(row))
    .select()
    .single()
  const data = await throwIfError(result, "skill_categories.create")
  return normalizeCategory(data as SkillCategory)
}

export async function updateCategory(
  id: string,
  row: NewCategory,
): Promise<SkillCategory> {
  const result = await supabase
    .from("skill_categories")
    .update(stripTimestamps(row))
    .eq("id", id)
    .select()
    .single()
  const data = await throwIfError(result, "skill_categories.update")
  return normalizeCategory(data as SkillCategory)
}

export async function deleteCategory(id: string): Promise<void> {
  const result = await supabase.from("skill_categories").delete().eq("id", id)
  await throwIfError(result, "skill_categories.delete")
}

export function getSkillsByCategoryId(
  skills: Skill[],
  categoryId: string,
): Skill[] {
  return skills.filter((s) => s.skill_category_id === categoryId)
}

export const skillQueries = {
  list: () =>
    queryOptions({
      queryKey: skillKeys.list(),
      queryFn: fetchSkills,
      staleTime: STALE_TIME,
    }),
  categories: () =>
    queryOptions({
      queryKey: skillKeys.categories(),
      queryFn: fetchSkillCategories,
      staleTime: STALE_TIME,
    }),
}
