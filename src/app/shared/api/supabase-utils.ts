export const STALE_TIME = 5 * 60 * 1000

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

export function asTimestamp(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function stripTimestamps<T extends object>(
  row: T,
): Omit<T, "created_at" | "updated_at"> {
  const { created_at: _c, updated_at: _u, ...rest } = row as T & {
    created_at?: unknown
    updated_at?: unknown
  }
  return rest
}

export async function throwIfError<T>(
  result: { data: T; error: { message: string } | null },
  label: string,
): Promise<T> {
  if (result.error) {
    console.error(`[supabase] ${label}:`, result.error.message)
    throw new Error(result.error.message)
  }
  return result.data
}
