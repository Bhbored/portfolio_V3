import { queryOptions } from "@tanstack/react-query"
import { supabase } from "../../shared/api/supabase"
import {
  STALE_TIME,
  asStringArray,
  asTimestamp,
  stripTimestamps,
  throwIfError,
} from "../../shared/api/supabase-utils"
import type { Project, ProjectCategory, Writable } from "../../shared/types"

export type NewProject = Writable<Project>

const HIERARCHY_TEMP = -1

export const projectKeys = {
  all: ["projects"] as const,
  list: () => [...projectKeys.all, "list"] as const,
}

function normalizeProject(row: Project): Project {
  return {
    ...row,
    description: row.description ?? "",
    image_url: row.image_url ?? "",
    project_category: (row.project_category ?? 0) as ProjectCategory,
    hierarchy: Number(row.hierarchy ?? 0),
    github_url: row.github_url ?? "",
    live_url: row.live_url ?? "",
    technologies: asStringArray(row.technologies),
    key_features: asStringArray(row.key_features),
    screenshots: asStringArray(row.screenshots),
    created_at: asTimestamp(row.created_at),
    updated_at: asTimestamp(row.updated_at),
  }
}

export function sortProjectsByHierarchy(projects: Project[]): Project[] {
  return [...projects].sort((a, b) => {
    const byHierarchy = a.hierarchy - b.hierarchy
    if (byHierarchy !== 0) return byHierarchy
    return (b.created_at || "").localeCompare(a.created_at || "")
  })
}

async function loadProjectsRaw(): Promise<Project[]> {
  const result = await supabase.from("projects").select("*")
  const rows = await throwIfError(result, "projects")
  return ((rows ?? []) as Project[]).map(normalizeProject)
}

async function setHierarchy(id: string, hierarchy: number): Promise<void> {
  const result = await supabase
    .from("projects")
    .update({ hierarchy })
    .eq("id", id)
  await throwIfError(result, "projects.hierarchy")
}

async function ensureHierarchySlot(
  target: number,
  giveBack: number,
  excludeId?: string,
): Promise<void> {
  const projects = await loadProjectsRaw()
  const occupant = projects.find(
    (p) => p.hierarchy === target && p.id && p.id !== excludeId,
  )
  if (!occupant?.id) return

  await setHierarchy(occupant.id, HIERARCHY_TEMP)
  await setHierarchy(occupant.id, giveBack)
}

export async function fetchProjects(): Promise<Project[]> {
  return sortProjectsByHierarchy(await loadProjectsRaw())
}

export async function createProject(row: NewProject): Promise<Project> {
  const projects = await loadProjectsRaw()
  const target = Math.max(1, Number(row.hierarchy) || 1)
  const vacatedSlot = projects.length + 1

  await ensureHierarchySlot(target, vacatedSlot)

  const result = await supabase
    .from("projects")
    .insert(stripTimestamps({ ...row, hierarchy: target }))
    .select()
    .single()
  const data = await throwIfError(result, "projects.create")
  return normalizeProject(data as Project)
}

export async function updateProject(
  id: string,
  row: NewProject,
): Promise<Project> {
  const projects = await loadProjectsRaw()
  const current = projects.find((p) => p.id === id)
  if (!current) throw new Error("Project not found")

  const target = Math.max(1, Number(row.hierarchy) || 1)
  const previous = current.hierarchy

  if (target !== previous) {
    const occupant = projects.find(
      (p) => p.hierarchy === target && p.id && p.id !== id,
    )
    if (occupant?.id) {
      await setHierarchy(id, HIERARCHY_TEMP)
      await setHierarchy(occupant.id, previous)
      await setHierarchy(id, target)
    }
  }

  const result = await supabase
    .from("projects")
    .update(stripTimestamps({ ...row, hierarchy: target }))
    .eq("id", id)
    .select()
    .single()
  const data = await throwIfError(result, "projects.update")
  return normalizeProject(data as Project)
}

export async function deleteProject(id: string): Promise<void> {
  const result = await supabase.from("projects").delete().eq("id", id)
  await throwIfError(result, "projects.delete")
}

export const projectQueries = {
  list: () =>
    queryOptions({
      queryKey: projectKeys.list(),
      queryFn: fetchProjects,
      staleTime: STALE_TIME,
    }),
}
