import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useIsMobile } from "../../../hooks/use-mobile"
import { useLanding } from "../../providers/LandingProvider"
import SkillCard from "./components/SkillCard"

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { categories, getSkillsByCategoryId } = useLanding()
  const isMobile = useIsMobile()
  const pageSize = isMobile ? 1 : 3
  const [activeCategory, setActiveCategory] = useState(0)
  const [skillPage, setSkillPage] = useState(0)

  const safeCategoryIndex = Math.min(
    activeCategory,
    Math.max(categories.length - 1, 0),
  )
  const activeCategoryData = categories[safeCategoryIndex]
  const categorySkills = activeCategoryData
    ? getSkillsByCategoryId(activeCategoryData.id)
    : []
  const totalPages = Math.max(1, Math.ceil(categorySkills.length / pageSize))
  const safeSkillPage = Math.min(skillPage, totalPages - 1)
  const visibleSkills = categorySkills.slice(
    safeSkillPage * pageSize,
    safeSkillPage * pageSize + pageSize,
  )

  useEffect(() => {
    setActiveCategory(0)
    setSkillPage(0)
  }, [categories.length])

  useEffect(() => {
    setSkillPage(0)
  }, [safeCategoryIndex])

  useGSAP(
    () => {
      const section = sectionRef.current
      if (!section) return

      gsap.from(".skills-section-header > *", {
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          toggleActions: "play none none reverse",
        },
        y: 36,
        opacity: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
      })
    },
    { scope: sectionRef },
  )

  useGSAP(
    () => {
      const panel = panelRef.current
      if (!panel) return

      gsap.fromTo(
        panel,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.12, ease: "power1.out" },
      )
    },
    { scope: panelRef, dependencies: [safeCategoryIndex, safeSkillPage] },
  )

  const selectCategory = (index: number) => {
    setActiveCategory(index)
  }

  const slideSkills = (direction: number) => {
    setSkillPage((current) =>
      Math.min(Math.max(current + direction, 0), totalPages - 1),
    )
  }

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="mx-auto max-w-384 overflow-x-clip px-4 pb-16 pt-14 mesh-gradient sm:px-6 sm:pb-20 sm:pt-16 md:pb-24 md:pr-20 md:pt-20 lg:pr-24"
    >
      <header className="skills-section-header relative mb-8 sm:mb-10 md:mb-12">
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
              Pick a category, browse skills in place — no long scroll marathon.
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

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-white/10 px-4 py-10 text-center text-sm text-on-surface-variant">
          No skill categories yet.
        </p>
      ) : (
        <div className="space-y-6">
          <nav
            aria-label="Skill categories"
            className="flex flex-wrap gap-2"
          >
            {categories.map((category, index) => (
              <button
                key={category.id}
                type="button"
                role="tab"
                aria-selected={safeCategoryIndex === index}
                onClick={() => selectCategory(index)}
                className={`max-w-full rounded-full border px-4 py-2 text-left font-label text-xs uppercase leading-snug tracking-widest transition-colors break-words ${
                  safeCategoryIndex === index
                    ? "border-primary/40 bg-primary/15 text-primary"
                    : "border-white/10 text-on-surface-variant hover:border-primary/30 hover:text-primary"
                }`}
              >
                0{index + 1} {category.category}
              </button>
            ))}
          </nav>

          {activeCategoryData ? (
            <div role="tabpanel" className="space-y-5 overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 bg-surface-container-high px-2 py-1 font-label text-xs text-primary">
                    0{safeCategoryIndex + 1}
                  </span>
                  <h3 className="font-headline text-base font-bold uppercase tracking-tight sm:text-lg md:text-xl">
                    {activeCategoryData.category}
                  </h3>
                </div>
                {totalPages > 1 ? (
                  <div className="flex shrink-0 items-center gap-2 sm:gap-3 md:-ml-1 lg:-ml-3">
                    <button
                      type="button"
                      onClick={() => slideSkills(-1)}
                      disabled={safeSkillPage === 0}
                      aria-label="Previous skills"
                      className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-all hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="min-w-8 text-center font-label text-[10px] tracking-widest text-on-surface-variant tabular-nums">
                      {safeSkillPage + 1}/{totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => slideSkills(1)}
                      disabled={safeSkillPage + 1 >= totalPages}
                      aria-label="Next skills"
                      className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/3 text-zinc-400 transition-all hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                ) : null}
              </div>

              <div ref={panelRef} className="overflow-hidden py-2">
                {visibleSkills.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-on-surface-variant">
                    No skills in this category yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                    {visibleSkills.map((skill, skillIndex) => (
                      <div key={skill.id} className="min-w-0">
                        <SkillCard
                          skill={skill}
                          index={
                            safeCategoryIndex * 10 +
                            safeSkillPage * pageSize +
                            skillIndex
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
