export interface Timestamps {
  created_at: string
  updated_at: string
}

export type Writable<T> = Omit<T, "id" | "created_at" | "updated_at">

