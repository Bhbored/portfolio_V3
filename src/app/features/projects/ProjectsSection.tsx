import { useEffect, useMemo, useState } from "react"
import { useIsMobile } from "../../../hooks/use-mobile"
import { useLanding } from "../../providers/LandingProvider"
import ProjectCard from "./components/ProjectCard"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function ProjectsSection() {
  const { projects } = useLanding()
  const isMobile = useIsMobile()
  const pageSize = isMobile ? 1 : 3
  const [page, setPage] = useState(0)

  const pages = useMemo(() => {
    const chunks: (typeof projects)[] = []
    for (let i = 0; i < projects.length; i += pageSize) {
      chunks.push(projects.slice(i, i + pageSize))
    }
    return chunks.length > 0 ? chunks : [[]]
  }, [projects, pageSize])

  const totalPages = pages.length

  useEffect(() => {
    setPage(0)
  }, [pageSize])

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)))
  }, [totalPages])

  return (
    <section
      id="projects"
      className="relative overflow-hidden pb-16 pt-14 mesh-gradient sm:pb-20 sm:pt-16 md:pb-24 md:pt-24"
    >
      <div className="mx-auto max-w-384 px-4 sm:px-6">
        <header className="relative mb-10 sm:mb-14 md:mb-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-6">
            <div className="relative inline-block">
              <span className="absolute -top-3 left-0 font-label text-[8px] uppercase tracking-[0.4em] text-primary/40 sm:-top-4 md:-top-6 md:text-[10px]">
                // DOCUMENTATION_MODULE_04
              </span>
              <h2 className="font-headline text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl md:text-[80px] lg:text-[96px]">
                Featured
                <br />
                <span className="text-primary">Projects</span>
              </h2>
            </div>
            <div className="max-w-xs border-l-2 border-primary/20 pl-4 md:border-l-2 md:pl-6 md:text-right">
              <p className="font-body text-xs leading-relaxed text-slate-400 sm:text-sm">
                Tap a project for features, tech, and screenshots.
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-primary" />
            <span className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
              {projects.length} Projects Archived
            </span>
          </div>
        </header>
      </div>

      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {pages.map((pageProjects, pi) => (
            <div
              key={pi}
              aria-hidden={pi !== page}
              className="min-w-full w-full shrink-0 px-4 sm:px-6"
            >
              <div className="mx-auto grid w-full max-w-384 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                {pageProjects.map((project) => {
                  const realIndex = projects.indexOf(project)
                  return (
                    <div key={project.id ?? realIndex} className="min-w-0">
                      <ProjectCard project={project} index={realIndex} />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-384 items-center justify-between gap-3 px-4 sm:mt-8 sm:px-6">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="inline-flex min-h-11 items-center gap-2 border border-outline-variant/30 bg-surface-container-high px-4 py-2.5 font-label text-[10px] uppercase tracking-widest text-primary transition-all hover:border-primary/50 hover:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-30 sm:px-6 sm:text-xs"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Prev
        </button>

        <span className="font-label text-xs tracking-widest text-on-surface-variant tabular-nums">
          {page + 1} / {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page + 1 >= totalPages}
          className="inline-flex min-h-11 items-center gap-2 border border-outline-variant/30 bg-surface-container-high px-4 py-2.5 font-label text-[10px] uppercase tracking-widest text-primary transition-all hover:border-primary/50 hover:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-30 sm:px-6 sm:text-xs"
        >
          Next
          <ArrowRight className="size-3.5" aria-hidden />
        </button>
      </div>
    </section>
  )
}
