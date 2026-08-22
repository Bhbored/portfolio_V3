import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useLanding } from "../../providers/LandingProvider"
import { useIsMobile } from "../../../hooks/use-mobile"
import CertificateCard from "./components/CertificateCard"

export default function CertificatesSection() {
  const { certificates } = useLanding()
  const isMobile = useIsMobile()
  const pageSize = isMobile ? 1 : 4
  const [page, setPage] = useState(0)

  const pages = useMemo(() => {
    const chunks: (typeof certificates)[] = []
    for (let i = 0; i < certificates.length; i += pageSize) {
      chunks.push(certificates.slice(i, i + pageSize))
    }
    return chunks.length > 0 ? chunks : [[]]
  }, [certificates, pageSize])

  const totalPages = pages.length

  useEffect(() => {
    setPage(0)
  }, [pageSize])

  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)))
  }, [totalPages])

  return (
    <section id="certificates" className="relative min-h-dvh overflow-x-clip px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-16 md:pb-24 md:pt-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-20 mesh-gradient" aria-hidden>
        <div className="absolute top-1/4 right-1/4 size-64 rounded-full bg-primary/10 blur-[120px] md:size-96" />
        <div className="absolute bottom-1/4 left-1/4 size-80 rounded-full bg-accent-orange/5 blur-[150px] md:size-125" />
      </div>

      <header className="relative mx-auto mb-10 max-w-384 sm:mb-14 md:mb-24">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end md:gap-6">
          <div className="relative inline-block">
            <span className="absolute -top-3 left-0 font-label text-[8px] uppercase tracking-[0.4em] text-primary/40 sm:-top-4 md:-top-6 md:text-[10px]">
              // VERIFIED_CREDENTIALS
            </span>
            <h2 className="font-headline text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl md:text-[80px] lg:text-[96px]">
              CERTIFIED
              <br />
              <span className="text-primary">COMPETENCE</span>
            </h2>
          </div>
          <div className="max-w-xs border-l-2 border-primary/20 pl-4 md:pl-6 md:text-right">
            <p className="font-body text-xs leading-relaxed text-slate-400 sm:text-sm">
              Professional certifications and technical achievements.
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="size-2 animate-pulse rounded-full bg-primary" />
          <span className="font-label text-[10px] uppercase tracking-[0.3em] text-slate-500">
            {certificates.length} Credentials Verified
          </span>
        </div>
      </header>

      <div className="relative mx-auto max-w-384">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pages.map((pageCerts, pi) => (
              <div
                key={pi}
                className="grid min-w-full w-full shrink-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8"
              >
                {pageCerts.map((cert) => {
                  const realIndex = certificates.indexOf(cert)
                  return (
                    <div key={cert.id} className="min-w-0">
                      <CertificateCard certificate={cert} index={realIndex} />
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 sm:mt-12">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
            className="inline-flex min-h-11 items-center gap-2 border border-outline-variant/30 bg-surface-container-high px-4 py-2.5 font-label text-[10px] uppercase tracking-widest text-primary transition-all hover:border-primary/50 hover:shadow-glow-cyan disabled:cursor-not-allowed disabled:opacity-30 sm:px-6 sm:text-xs"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            <span className="sm:inline">Prev</span>
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
      </div>
    </section>
  )
}
