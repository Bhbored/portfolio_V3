import { useState } from "react"
import { getIcon } from "../../../shared/data/icons"
import type { Skill } from "../../../shared/types"
import { ChevronDown } from "lucide-react"
import { animStagger } from "../../../../lib/anim-delay"

interface SkillCardProps {
  readonly skill: Skill
  readonly index: number
}

export default function SkillCard({ skill, index }: SkillCardProps) {
  const [expanded, setExpanded] = useState(false)
  const Icon = getIcon(skill.icon)

  return (
    <div
      className={`relative space-y-4 overflow-hidden border border-outline-variant/30 bg-linear-to-br from-surface-container-high via-surface-container to-surface-container-low p-4 transition-all duration-500 group hover:scale-[1.02] hover:border-primary/50 hover:shadow-glow-cyan animate-fade-in-up md:space-y-6 md:p-8 cursor-pointer ${animStagger(index, 50)}`}
      onClick={() => setExpanded(!expanded)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          setExpanded(!expanded)
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-primary/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 flex items-start justify-between">
        <Icon className="text-2xl text-primary transition-all duration-300 group-hover:animate-pulse md:text-3xl" />
        {skill.is_new && (
          <div className="absolute top-3 right-3 bg-secondary-container px-2 py-0.5 text-[10px] font-black tracking-widest text-on-secondary md:top-4 md:right-4">
            NEW
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h4 className="mb-2 font-headline text-xl font-bold transition-all duration-500 group-hover:text-gradient md:text-2xl">
          {skill.title}
        </h4>

        <div className="mb-2 flex items-center justify-between">
          <span className="font-label text-[10px] tracking-widest opacity-60">
            {skill.is_new ? (
              <span className="text-accent-orange">CURRENTLY EXPLORING</span>
            ) : (
              "MASTERY LEVEL"
            )}
          </span>
          <span className="font-label text-xs text-on-surface md:text-sm">
            {skill.mastery_level}%
          </span>
        </div>

        <div className="relative h-1 w-full overflow-hidden bg-surface-container-highest">
          <div
            className={`absolute h-full ${skill.is_new ? "bg-accent-orange shadow-glow-orange" : "bg-accent-cyan shadow-glow-cyan"}`}
            style={{ width: `${skill.mastery_level}%` }}
          />
          {skill.is_new && (
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          )}
        </div>

        {expanded && skill.details.length > 0 && (
          <div className="mt-4 border-t border-outline-variant/20 pt-4 md:mt-6 md:pt-6">
              <ul
                className="max-h-28 space-y-2 overflow-y-auto pr-2 md:max-h-32 md:space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-primary/60 [&::-webkit-scrollbar-track]:bg-white/10"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(0, 229, 255, 0.45) rgba(255, 255, 255, 0.08)",
                }}
              >
              {skill.details.map((detail: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-2 md:gap-3 text-xs md:text-sm text-on-surface-variant"
                >
                  <svg
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary mt-0.5 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{detail}</span>
                </li>
              ))}
              </ul>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 z-10">
        <ChevronDown
          className={`text-primary text-sm md:text-base transition-transform duration-500 ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      <div className="absolute bottom-3 right-10 md:bottom-4 md:right-12 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="w-1 h-1 rounded-full bg-primary/60" />
        <span className="w-1 h-1 rounded-full bg-primary/40" />
        <span className="w-1 h-1 rounded-full bg-primary/20" />
      </div>
    </div>
  );
}
