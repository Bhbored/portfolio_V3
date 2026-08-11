import type { Timestamps } from "./timestamps"

export interface Experience extends Timestamps {
  id?: string
  title: string
  company: string
  period: string
  description: string[]
}
