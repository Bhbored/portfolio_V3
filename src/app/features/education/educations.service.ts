import { queryOptions } from "@tanstack/react-query"
import { supabase } from "../../shared/api/supabase"
import {
  STALE_TIME,
  asTimestamp,
  stripTimestamps,
  throwIfError,
} from "../../shared/api/supabase-utils"
import type { Education, Writable } from "../../shared/types"

export type NewEducation = Writable<Education>

export const educationKeys = {
  all: ["educations"] as const,
  list: () => [...educationKeys.all, "list"] as const,
}

function normalizeEducation(row: Education): Education {
  return {
    ...row,
    year: row.year ?? "",
    created_at: asTimestamp(row.created_at),
    updated_at: asTimestamp(row.updated_at),
  }
}

export async function fetchEducations(): Promise<Education[]> {
  const result = await supabase
    .from("educations")
    .select("*")
    .order("created_at", { ascending: false })
  const rows = await throwIfError(result, "educations")
  return ((rows ?? []) as Education[]).map(normalizeEducation)
}

export async function createEducation(row: NewEducation): Promise<Education> {
  const result = await supabase
    .from("educations")
    .insert(stripTimestamps(row))
    .select()
    .single()
  const data = await throwIfError(result, "educations.create")
  return normalizeEducation(data as Education)
}

export async function updateEducation(
  id: string,
  row: NewEducation,
): Promise<Education> {
  const result = await supabase
    .from("educations")
    .update(stripTimestamps(row))
    .eq("id", id)
    .select()
    .single()
  const data = await throwIfError(result, "educations.update")
  return normalizeEducation(data as Education)
}

export async function deleteEducation(id: string): Promise<void> {
  const result = await supabase.from("educations").delete().eq("id", id)
  await throwIfError(result, "educations.delete")
}

export const educationQueries = {
  list: () =>
    queryOptions({
      queryKey: educationKeys.list(),
      queryFn: fetchEducations,
      staleTime: STALE_TIME,
    }),
}
