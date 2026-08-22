import { useState } from "react"
import { Zap, Calendar, Code, ArrowRight } from "lucide-react"
import ContactForm from "./ContactForm"

const perks = [
  {
    icon: Zap,
    title: "Quick Response",
    desc: "I typically respond within 24 hours",
  },
  {
    icon: Calendar,
    title: "Flexible Schedule",
    desc: "Available for remote work and flexible hours",
  },
  {
    icon: Code,
    title: "Project Types",
    desc: "Mobile & Web apps, cross-platform development, consulting",
  },
]

export default function ContactFlipCard() {
  const [flipped, setFlipped] = useState(false)

  return (
    <div className="perspective-1000 mb-5 w-full min-h-120 sm:mb-0 sm:min-h-125 md:min-h-150">
      <div
        className={`preserve-3d relative h-full min-h-120 w-full transition-transform duration-700 ease-in-out sm:min-h-125 md:min-h-150 ${flipped ? "rotate-y-180" : ""}`}
      >
        <div className="backface-hidden absolute inset-0 flex flex-col rounded-xl border border-white/10 bg-surface-container-high p-5 pb-6 sm:p-6 md:p-8">
          <h3 className="mb-3 font-headline text-xl font-bold uppercase tracking-tight text-white sm:mb-4 md:text-2xl">
            Let's Work Together!
          </h3>
          <p className="mb-5 font-body text-sm leading-relaxed text-on-surface-variant sm:mb-8">
            I'm currently available for freelance work and open to discussing
            new projects, collaborations, or opportunities to be part of your
            vision.
          </p>
          <div className="mb-5 flex flex-col space-y-5 sm:mb-8 sm:grow sm:justify-center sm:space-y-8">
            {perks.map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-label text-sm font-bold uppercase tracking-wider text-primary">
                    {item.title}
                  </p>
                  <p className="mt-1 font-body text-sm text-on-surface-variant">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setFlipped(true)}
            className="mt-auto flex h-14 w-full items-center justify-center gap-3 bg-linear-to-r from-primary to-secondary font-headline font-bold uppercase tracking-tight text-background transition-all duration-300 hover:scale-102 active:scale-95"
          >
            SEND ME AN EMAIL <ArrowRight className="size-5" />
          </button>
        </div>

        <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col overflow-y-auto rounded-xl border border-white/10 bg-surface-container-high p-5 pb-6 sm:p-6 md:p-8">
          <h3 className="mb-4 font-headline text-xl font-bold uppercase tracking-tight text-white sm:mb-6 md:text-2xl">
            Send Me A Message
          </h3>
          <ContactForm />
          <button
            type="button"
            onClick={() => setFlipped(false)}
            className="mt-4 mb-1 w-full rounded-lg border border-white/10 py-3 text-center font-label text-xs uppercase tracking-widest text-on-surface-variant/50 transition-colors hover:border-primary/50 hover:text-primary"
          >
            ← BACK TO INFO
          </button>
        </div>
      </div>
    </div>
  )
}
