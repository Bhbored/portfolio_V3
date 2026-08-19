import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useIsMobile } from "../../../hooks/use-mobile"
import { useLanding } from "../../providers/LandingProvider"
import type { Skill } from "../../shared/types"
import SkillCard from "./components/SkillCard"

export default function SkillsSection() {
  const { categories, getSkillsByCategoryId } = useLanding()
  const isMobile = useIsMobile()
  const pageSize = isMobile ? 1 : 3
  const [pageIndices, setPageIndices] = useState<Record<string, number>>({})

  useEffect(() => {
    setPageIndices({})
  }, [pageSize])

  const slideCategory = (categoryId: string, direction: number, totalPages: number) => {
    setPageIndices((prev) => {
      const current = prev[categoryId] ?? 0
      const next = Math.min(Math.max(current + direction, 0), totalPages - 1)
      return { ...prev, [categoryId]: next }
    })
  }

  return (
    <section
      id="skills"
      className="mx-auto max-w-384 overflow-x-hidden px-4 pb-16 pt-14 mesh-gradient sm:px-6 sm:pb-20 sm:pt-16 md:pb-24 md:pt-20"
    >
      <header className="relative mb-10 sm:mb-14 md:mb-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-6">
          <div className="relative inline-block">
            <span className="absolute -top-3 left-0 font-label text-[8px] uppercase tracking-[0.4em] text-primary/40 sm:-top-4 md:-top-6 md:text-[10px]">
              // SYSTEM_CAPABILITIES_LOADED
            </span>
            <h2 className="font-headline text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl md:text-[80px] lg:text-[96px]">
              TECH
              <br />
              <span className="text-primary">ARSENAL</span>
            </h2>
          </div>
          <div className="max-w-xs border-l-2 border-primary/20 pl-4 md:pl-6 md:text-right">
            <p className="font-body text-xs leading-relaxed text-slate-400 sm:text-sm">
              Technologies and tools used to build cross-platform applications.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {categories.length} Skill Categories
          </span>
        </div>
      </header>

      {categories.map((category, catIndex) => {
        const categorySkills = getSkillsByCategoryId(category.id)
        const currentPage = pageIndices[category.id] ?? 0
        const totalPages = Math.max(1, Math.ceil(categorySkills.length / pageSize))

        const pages: Skill[][] = []
        for (let i = 0; i < categorySkills.length; i += pageSize) {
          pages.push(categorySkills.slice(i, i + pageSize))
        }
        if (pages.length === 0) pages.push([])

        return (
          <div key={category.id} className="mb-12 last:mb-0 sm:mb-16 md:mb-24">
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6 md:mb-8">
              <div className="flex min-w-0 items-center gap-3">
                <span className="shrink-0 bg-surface-container-high px-2 py-1 font-label text-xs text-primary">
                  0{catIndex + 1}
                </span>
                <h3 className="truncate font-headline text-base font-bold uppercase tracking-tight sm:text-lg md:text-xl">
                  {category.category}
                </h3>
              </div>
              {totalPages > 1 && (
                <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => slideCategory(category.id, -1, totalPages)}
                    disabled={currentPage === 0}
                    aria-label="Previous skills"
                    className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-all hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <span className="min-w-8 text-center font-label text-[10px] tracking-widest text-on-surface-variant tabular-nums">
                    {currentPage + 1}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => slideCategory(category.id, 1, totalPages)}
                    disabled={currentPage + 1 >= totalPages}
                    aria-label="Next skills"
                    className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-all hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-hidden overflow-y-visible py-2">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentPage * 100}%)` }}
              >
                {pages.map((page, pi) => (
                  <div
                    key={pi}
                    className="grid w-full shrink-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3"
                  >
                    {page.map((skill) => (
                      <div key={skill.id} className="min-w-0">
                        <SkillCard
                          skill={skill}
                          index={catIndex * 10 + categorySkills.indexOf(skill)}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}
    </section>
  )
}
