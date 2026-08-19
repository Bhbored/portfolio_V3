import type { Timestamps } from "./timestamps"

export interface Experience extends Timestamps {
  id?: string
  title: string
  company: string
  period: string
  priority: number
  description: string[]
}
