import type { Timestamps } from "./timestamps"

export interface Education extends Timestamps {
  id: string
  title: string
  issuer: string
  year: string
}
