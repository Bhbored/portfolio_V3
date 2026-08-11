import type { ProficiencyLevel } from "./enums"
import type { Timestamps } from "./timestamps"

export interface SocialLinks {
  github: string
  linkedin: string
}

export interface Language {
  name: string
  proficiency: ProficiencyLevel
}

export interface PersonalInfo extends Timestamps {
  id?: string
  name: string
  title: string
  email: string
  phone: string
  location: string
  summary: string
  headline: string
  profile_image: string
  is_available_for_work: boolean
  social: SocialLinks
  languages: Language[]
}
