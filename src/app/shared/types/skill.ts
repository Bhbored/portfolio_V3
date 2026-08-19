import type { Timestamps } from "./timestamps"

export interface Skill extends Timestamps {
  id: string
  title: string
  icon: number
  priority: number
  skill_category_id: string | null
  certificate_id: string | null
  mastery_level: number
  is_new: boolean
  details: string[]
}

export interface SkillCategory extends Timestamps {
  id: string
  category: string
}
