import { useLanding } from "../../providers/LandingProvider"
import ExperienceTimelineCard from "./components/ExperienceTimelineCard"

export default function ExperienceSection() {
  const { experiences } = useLanding()

  return (
    <section id="experience" className="relative min-h-dvh overflow-x-clip px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 md:pb-32 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 mesh-gradient" aria-hidden>
        <div className="absolute top-1/4 left-1/4 size-64 rounded-full bg-primary/10 blur-[120px] md:size-96" />
        <div className="absolute bottom-1/4 right-1/4 size-80 rounded-full bg-accent-orange/5 blur-[150px] md:size-[500px]" />
      </div>

      <header className="relative mx-auto mb-12 max-w-7xl sm:mb-16 md:mb-32">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-8">
          <div className="relative inline-block">
            <span className="absolute -top-3 left-0 font-label text-[8px] uppercase tracking-[0.4em] text-primary/40 sm:-top-4 md:-top-6 md:text-[10px]">
              // PROFESSIONAL_TRAJECTORY
            </span>
            <h2 className="font-headline text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl md:text-[80px] lg:text-[96px]">
              Work
              <br />
              <span className="text-primary">Experience</span>
            </h2>
          </div>
          <div className="max-w-xs border-l-2 border-primary/20 pl-4 md:pl-6 md:text-right">
            <p className="font-body text-xs leading-relaxed text-slate-400 sm:text-sm">
              Professional journey and key achievements.
            </p>
          </div>
        </div>
      </header>

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="absolute bottom-0 left-1/2 top-0 z-0 hidden w-0.5 -translate-x-1/2 bg-linear-to-b from-primary to-accent-orange opacity-50 md:block" />
        <div className="relative z-10 flex flex-col gap-10 sm:gap-14 md:gap-40">
          {experiences.map((exp, i) => (
            <ExperienceTimelineCard
              key={exp.id ?? i}
              experience={exp}
              isLeft={i % 2 === 0}
              index={i}
              isActive={i === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
