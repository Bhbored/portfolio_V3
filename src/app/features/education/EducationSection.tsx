import { useLanding } from "../../providers/LandingProvider"
import EducationCard from "./components/EducationCard"

export default function EducationSection() {
  const { educations } = useLanding()

  return (
    <section id="education" className="relative min-h-dvh overflow-x-clip px-4 pb-20 pt-14 sm:px-6 sm:pb-24 sm:pt-16 md:pb-32 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 mesh-gradient" aria-hidden>
        <div className="absolute top-1/3 right-1/3 size-64 rounded-full bg-primary/8 blur-[120px] md:size-96" />
        <div className="absolute bottom-1/3 left-1/3 size-80 rounded-full bg-accent-orange/5 blur-[150px] md:size-[500px]" />
      </div>

      <header className="relative mx-auto mb-10 max-w-384 sm:mb-14 md:mb-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-6">
          <div className="relative inline-block">
            <span className="absolute -top-3 left-0 font-label text-[8px] uppercase tracking-[0.4em] text-primary/40 sm:-top-4 md:-top-6 md:text-[10px]">
              // ACADEMIC_FOUNDATION
            </span>
            <h2 className="font-headline text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl md:text-[80px] lg:text-[96px]">
              KNOWLEDGE
              <br />
              <span className="text-primary">BASELINE</span>
            </h2>
          </div>
          <div className="max-w-xs border-l-2 border-primary/20 pl-4 md:pl-6 md:text-right">
            <p className="font-body text-xs leading-relaxed text-slate-400 sm:text-sm">
              Academic achievements and educational background.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {educations.length} Institutions
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-384 grid-cols-1 gap-6 sm:gap-8 md:grid-cols-2 md:gap-10">
        {educations.map((edu, i) => (
          <EducationCard key={edu.id} education={edu} index={i} />
        ))}
      </div>
    </section>
  )
}
