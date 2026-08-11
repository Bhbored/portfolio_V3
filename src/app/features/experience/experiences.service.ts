import { queryOptions } from "@tanstack/react-query"
import { supabase } from "../../shared/api/supabase"
import {
  STALE_TIME,
  asStringArray,
  asTimestamp,
  stripTimestamps,
  throwIfError,
} from "../../shared/api/supabase-utils"
import type { Experience, Writable } from "../../shared/types"

export type NewExperience = Writable<Experience>

export const experienceKeys = {
  all: ["experiences"] as const,
  list: () => [...experienceKeys.all, "list"] as const,
}

function normalizeExperience(row: Experience): Experience {
  return {
    ...row,
    period: row.period ?? "",
    description: asStringArray(row.description),
    created_at: asTimestamp(row.created_at),
    updated_at: asTimestamp(row.updated_at),
  }
}

export async function fetchExperiences(): Promise<Experience[]> {
  const result = await supabase
    .from("experiences")
    .select("*")
    .order("created_at", { ascending: false })
  const rows = await throwIfError(result, "experiences")
  return ((rows ?? []) as Experience[]).map(normalizeExperience)
}

export async function createExperience(
  row: NewExperience,
): Promise<Experience> {
  const result = await supabase
    .from("experiences")
    .insert(stripTimestamps(row))
    .select()
    .single()
  const data = await throwIfError(result, "experiences.create")
  return normalizeExperience(data as Experience)
}

export async function updateExperience(
  id: string,
  row: NewExperience,
): Promise<Experience> {
  const result = await supabase
    .from("experiences")
    .update(stripTimestamps(row))
    .eq("id", id)
    .select()
    .single()
  const data = await throwIfError(result, "experiences.update")
  return normalizeExperience(data as Experience)
}

export async function deleteExperience(id: string): Promise<void> {
  const result = await supabase.from("experiences").delete().eq("id", id)
  await throwIfError(result, "experiences.delete")
}

export const experienceQueries = {
  list: () =>
    queryOptions({
      queryKey: experienceKeys.list(),
      queryFn: fetchExperiences,
      staleTime: STALE_TIME,
    }),
}
