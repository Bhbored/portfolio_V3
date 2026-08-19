import type { ProjectCategory } from "./enums";
import type { Timestamps } from "./timestamps";

export interface Project extends Timestamps {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  project_category: ProjectCategory;
  hierarchy: number;
  github_url: string;
  live_url: string;
  technologies: string[];
  key_features: string[];
  screenshots: string[];
}
