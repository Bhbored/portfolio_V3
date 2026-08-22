import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Lock } from "lucide-react"
import { useIsMobile } from "../../../../hooks/use-mobile"
import { getInitials } from "../../../../lib/capitalizer"
import { useLanding } from "../../../providers/LandingProvider"

const navItems = ["Home", "Skills", "Projects", "Experience", "Certificates", "Education"]

export default function NavMenu() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const { personalInfo, currentSection, navigateToSection } = useLanding()

  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  const initials = getInitials(personalInfo.name)

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between bg-background/80 px-6 shadow-[0_0_20px_rgba(0,240,255,0.08)] backdrop-blur-xl animate-fade-in-down md:px-12">
        <div className="absolute inset-0 grid-pattern opacity-20 pointer-events-none" />

        
        <div className="relative group animate-fade-in-left anim-d-200">
          <button
            onClick={() => navigateToSection("Home")}
            className="w-10 h-10 border-2 border-primary-container flex items-center justify-center font-headline text-2xl font-bold text-primary-container leading-none hover:scale-110 transition-transform duration-300"
          >
            {initials}
          </button>
        </div>

        
        <div className="hidden md:flex items-center gap-8 font-body text-lg tracking-widest uppercase">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => navigateToSection(item)}
              className={`transition-all duration-300 hover:scale-105 relative group ${
                currentSection === item ? "text-primary-container" : "text-white/70 hover:text-primary-container"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-2 left-0 w-full h-0.5 bg-primary-container transition-transform duration-300 ${
                  currentSection === item ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
            </button>
          ))}
        </div>

        
        <div className="hidden md:flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            aria-label="Admin login"
            title="Admin"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/[0.05] border border-primary/15 text-zinc-400 hover:bg-primary/[0.12] hover:border-primary/40 hover:text-primary hover:shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all duration-300 cursor-pointer"
          >
            <Lock className="size-4" aria-hidden />
          </button>
          <button
            onClick={() => navigateToSection("Contact")}
            className="rounded-full bg-linear-to-r from-primary-container to-secondary-container p-px hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <div className="bg-background px-8 py-2.5 rounded-full font-headline text-sm font-bold tracking-widest uppercase text-white">
              Let's Talk
            </div>
          </button>
        </div>

        
        <button
          type="button"
          className="z-50 flex size-11 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            className={`w-6 h-0.5 bg-primary-container transition-all duration-300 ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-primary-container transition-all duration-300 ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-6 h-0.5 bg-primary-container transition-all duration-300 ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      
      <div
        className={`fixed inset-0 bg-background/95 backdrop-blur-xl z-40 md:hidden transition-all duration-500 ${
          mobileOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full w-full px-6">
          <div className="flex flex-col gap-8 text-center">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => {
                  navigateToSection(item)
                  setMobileOpen(false)
                }}
                className={`font-body text-2xl tracking-widest uppercase transition-all duration-300 hover:scale-110 ${
                  currentSection === item ? "text-primary-container" : "text-white/70 hover:text-primary-container"
                }`}
              >
                {item}
              </button>
            ))}
            <button
              onClick={() => {
                navigateToSection("Contact")
                setMobileOpen(false)
              }}
              className="mt-8 px-12 py-4 rounded-full bg-linear-to-r from-primary-container to-secondary-container p-px hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <div className="bg-background px-12 py-4 rounded-full font-headline text-sm font-bold tracking-widest uppercase text-white">
                Let's Talk
              </div>
            </button>
            <button
              onClick={() => {
                setMobileOpen(false)
                navigate("/admin/login")
              }}
              className="flex items-center gap-2 font-label text-xs tracking-widest uppercase text-on-surface-variant hover:text-primary transition-colors"
            >
              <Lock className="size-4" aria-hidden />
              Admin
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
