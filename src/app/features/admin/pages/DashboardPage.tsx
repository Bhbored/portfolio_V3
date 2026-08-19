import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Briefcase,
  GraduationCap,
  History,
  Layers,
  Zap,
} from "lucide-react";
import { personalInfoQueries } from "../../landing/personal-info.service";
import {
  projectQueries,
  sortProjectsByHierarchy,
} from "../../projects/projects.service";
import { skillQueries } from "../../skills/skills.service";
import { certificateQueries } from "../../certificates/certificates.service";
import { experienceQueries } from "../../experience/experiences.service";
import { educationQueries } from "../../education/educations.service";
import WelcomeStrip from "../components/dashboard/WelcomeStrip";
import StatStrip from "../components/dashboard/StatStrip";
import type { StatItem } from "../components/dashboard/StatStrip";
import ContentHealth from "../components/dashboard/ContentHealth";
import type { HealthItem } from "../components/dashboard/ContentHealth";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProjects from "../components/dashboard/RecentProjects";
import SkillsSnapshot from "../components/dashboard/SkillsSnapshot";
import CareerTimeline from "../components/dashboard/CareerTimeline";

export default function DashboardPage() {
  const personalInfoQuery = useQuery(personalInfoQueries.detail());
  const projectsQuery = useQuery(projectQueries.list());
  const skillsQuery = useQuery(skillQueries.list());
  const categoriesQuery = useQuery(skillQueries.categories());
  const certificatesQuery = useQuery(certificateQueries.list());
  const experiencesQuery = useQuery(experienceQueries.list());
  const educationsQuery = useQuery(educationQueries.list());

  const projects = useMemo(
    () => sortProjectsByHierarchy(projectsQuery.data ?? []),
    [projectsQuery.data],
  );
  const skills = skillsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const certificates = certificatesQuery.data ?? [];
  const experiences = experiencesQuery.data ?? [];
  const educations = educationsQuery.data ?? [];
  const personalInfo = personalInfoQuery.data;

  const listsLoading =
    projectsQuery.isPending ||
    skillsQuery.isPending ||
    categoriesQuery.isPending ||
    certificatesQuery.isPending ||
    experiencesQuery.isPending ||
    educationsQuery.isPending;

  const profileLoading = personalInfoQuery.isPending;

  const hasError = [
    personalInfoQuery.error,
    projectsQuery.error,
    skillsQuery.error,
    categoriesQuery.error,
    certificatesQuery.error,
    experiencesQuery.error,
    educationsQuery.error,
  ].some(Boolean);

  const stats: StatItem[] = useMemo(
    () => [
      {
        label: "Projects",
        value: projects.length,
        icon: Briefcase,
        to: "/admin/projects",
      },
      { label: "Skills", value: skills.length, icon: Zap, to: "/admin/skills" },
      {
        label: "Certificates",
        value: certificates.length,
        icon: BadgeCheck,
        to: "/admin/certificates",
      },
      {
        label: "Experience",
        value: experiences.length,
        icon: History,
        to: "/admin/experiences",
      },
      {
        label: "Education",
        value: educations.length,
        icon: GraduationCap,
        to: "/admin/educations",
      },
      {
        label: "Categories",
        value: categories.length,
        icon: Layers,
        to: "/admin/categories",
      },
    ],
    [
      projects.length,
      skills.length,
      certificates.length,
      experiences.length,
      educations.length,
      categories.length,
    ],
  );

  const healthItems: HealthItem[] = useMemo(
    () => [
      {
        id: "profile-image",
        label: "Profile photo set",
        done: Boolean(personalInfo?.profile_image?.trim()),
        to: "/admin/personal-info",
      },
      {
        id: "bio",
        label: "Bio / summary written",
        done: Boolean(
          personalInfo?.summary?.trim() || personalInfo?.headline?.trim(),
        ),
        to: "/admin/personal-info",
      },
      {
        id: "project",
        label: "At least one project",
        done: projects.length > 0,
        to: "/admin/projects",
      },
      {
        id: "skill",
        label: "At least one skill",
        done: skills.length > 0,
        to: "/admin/skills",
      },
      {
        id: "certificate",
        label: "At least one certificate",
        done: certificates.length > 0,
        to: "/admin/certificates",
      },
      {
        id: "experience",
        label: "Experience entry added",
        done: experiences.length > 0,
        to: "/admin/experiences",
      },
      {
        id: "education",
        label: "Education entry added",
        done: educations.length > 0,
        to: "/admin/educations",
      },
    ],
    [
      personalInfo,
      projects.length,
      skills.length,
      certificates.length,
      experiences.length,
      educations.length,
    ],
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-5 md:gap-6">
      {hasError && (
        <div
          role="alert"
          className="rounded-2xl border border-secondary/40 bg-secondary/10 px-4 py-3.5 font-body text-sm text-secondary"
        >
          Some dashboard data failed to load. Refresh or check your connection.
        </div>
      )}

      <WelcomeStrip
        personalInfo={personalInfo}
        loading={profileLoading}
        projectCount={projects.length}
        skillCount={skills.length}
      />

      <StatStrip stats={stats} loading={listsLoading} />

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-2">
          <ContentHealth
            items={healthItems}
            loading={profileLoading || listsLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-5 lg:gap-6">
        <div className="lg:col-span-3">
          <RecentProjects
            projects={projects}
            loading={projectsQuery.isPending}
          />
        </div>
        <div className="lg:col-span-2">
          <SkillsSnapshot
            skills={skills}
            categories={categories}
            loading={skillsQuery.isPending || categoriesQuery.isPending}
          />
        </div>
      </div>

      <CareerTimeline
        experiences={experiences}
        educations={educations}
        loading={experiencesQuery.isPending || educationsQuery.isPending}
      />
    </div>
  );
}
