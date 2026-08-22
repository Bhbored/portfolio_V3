import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Loader2 } from "lucide-react"
import MainLayout from "./app/shared/components/layout/MainLayout"
import EmptyLayout from "./app/shared/components/layout/EmptyLayout"
import { LandingProvider } from "./app/providers/LandingProvider"
import HeroSection from "./app/features/landing/HeroSection"
import SkillsSection from "./app/features/skills/SkillsSection"
import ProjectsSection from "./app/features/projects/ProjectsSection"
import CertificatesSection from "./app/features/certificates/CertificatesSection"
import ExperienceSection from "./app/features/experience/ExperienceSection"
import EducationSection from "./app/features/education/EducationSection"
import ContactSection from "./app/features/contact/ContactSection"

const ProjectDetailsPage = lazy(() => import("./app/routes/ProjectDetailsPage"))
const AdminRoutes = lazy(() => import("./app/routes/AdminRoutes"))

const queryClient = new QueryClient()

function RouteFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-label="Loading"
      />
    </div>
  )
}

function HomePage() {
  return (
    <div className="min-w-0 max-w-full overflow-x-clip">
      <HeroSection />
      <SkillsSection />
      <ProjectsSection />
      <ExperienceSection />
      <CertificatesSection />
      <EducationSection />
      <ContactSection />
    </div>
  )
}

function LandingLayout() {
  return (
    <LandingProvider>
      <MainLayout />
    </LandingProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<LandingLayout />}>
              <Route index element={<HomePage />} />
            </Route>
            <Route element={<EmptyLayout />}>
              <Route
                path="project/:id"
                element={
                  <LandingProvider>
                    <ProjectDetailsPage />
                  </LandingProvider>
                }
              />
            </Route>
            <Route path="admin/*" element={<AdminRoutes />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
