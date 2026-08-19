import type { Skill } from "./skill";
import type { Timestamps } from "./timestamps";

export interface Certificate extends Timestamps {
  id: string
  title: string
  issuer: string
  year: string
  link: string | null
  priority: number
  top_skills: Skill[]
}
