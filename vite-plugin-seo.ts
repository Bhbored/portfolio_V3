import type { Plugin } from "vite"
import { writeFileSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"

export type SeoProfile = {
  name: string
  jobTitle: string
  headline: string
  description: string
  email: string
  location: string
  github: string
  linkedin: string
  image: string
  keywords: string
}

const FALLBACK: SeoProfile = {
  name: "Portfolio",
  jobTitle: "Developer",
  headline: "Software developer portfolio",
  description: "Personal developer portfolio.",
  email: "",
  location: "",
  github: "",
  linkedin: "",
  image: "",
  keywords: "portfolio, developer, full stack",
}

function siteUrlFromEnv(mode: string): string {
  const fromEnv = process.env.VITE_SITE_URL?.replace(/\/+$/, "")
  if (fromEnv) return fromEnv
  if (mode === "development") return "http://localhost:5173"
  return "https://example.com"
}

function asSocial(value: unknown): { github: string; linkedin: string } {
  const social = (value ?? {}) as Record<string, unknown>
  return {
    github: String(social.github ?? social.Github ?? ""),
    linkedin: String(social.linkedin ?? social.Linkedin ?? ""),
  }
}

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/[\u2013\u2014\u2212]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\s+/g, " ")
    .trim()
}

function profileFromRow(row: Record<string, unknown>): SeoProfile {
  const social = asSocial(row.social)
  const name = cleanText(row.name) || FALLBACK.name
  const jobTitle = cleanText(row.title) || FALLBACK.jobTitle
  const headline =
    cleanText(row.headline) ||
    `${jobTitle} specializing in cross-platform applications`
  const description =
    cleanText(row.summary) || headline || FALLBACK.description
  const location = cleanText(row.location)
  const keywords = [
    name,
    jobTitle,
    "React",
    "ASP.NET Core",
    ".NET MAUI",
    "Flutter",
    "Blazor",
    "full stack",
    "portfolio",
    location ? `${location} developer` : "",
  ]
    .filter(Boolean)
    .join(", ")

  return {
    name,
    jobTitle,
    headline,
    description,
    email: cleanText(row.email),
    location,
    github: cleanText(social.github),
    linkedin: cleanText(social.linkedin),
    image: cleanText(row.profile_image),
    keywords,
  }
}

async function fetchPersonalInfoSeo(): Promise<SeoProfile> {
  const base = process.env.VITE_SUPABASE_URL?.replace(/\/+$/, "")
  const key = process.env.VITE_SUPABASE_ANON_KEY
  if (!base || !key) {
    console.warn(
      "[seo-files] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY - using fallback.",
    )
    return FALLBACK
  }

  try {
    const url = `${base}/rest/v1/personal_info?select=name,title,headline,summary,email,location,social,profile_image&limit=1`
    const response = await fetch(url, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
      },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const rows = (await response.json()) as Record<string, unknown>[]
    if (!rows?.length) {
      console.warn("[seo-files] personal_info empty - using fallback.")
      return FALLBACK
    }
    return profileFromRow(rows[0])
  } catch (error) {
    console.warn(
      "[seo-files] Failed to load personal_info:",
      error instanceof Error ? error.message : error,
    )
    return FALLBACK
  }
}

function buildLlmsTxt(siteUrl: string, seo: SeoProfile): string {
  const profiles = [
    seo.github ? `- [GitHub](${seo.github}): Source code and open work` : "",
    seo.linkedin
      ? `- [LinkedIn](${seo.linkedin}): Professional profile`
      : "",
  ]
    .filter(Boolean)
    .join("\n")

  return `# ${seo.name}
> ${seo.jobTitle}${seo.headline ? ` - ${seo.headline}` : ""}

${seo.description}

${seo.location ? `Location: ${seo.location}` : ""}
${seo.email ? `Contact: ${seo.email}` : ""}

## Portfolio
- [Home](${siteUrl}/): Overview, availability, and introduction
- [Skills](${siteUrl}/#skills): Tech stack across languages, frameworks, and tools
- [Projects](${siteUrl}/#projects): Selected cross-platform and full-stack work
- [Experience](${siteUrl}/#experience): Professional roles and achievements
- [Certificates](${siteUrl}/#certificates): Credentials and certifications
- [Education](${siteUrl}/#education): Academic background
- [Contact](${siteUrl}/#contact): Email and social links

${profiles ? `## Profiles\n${profiles}\n` : ""}
## Optional
- [Admin](${siteUrl}/admin): Private CMS - not for public indexing
`.replace(/\n{3,}/g, "\n\n")
}

function buildRobotsTxt(siteUrl: string): string {
  return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/

User-agent: GPTBot
Allow: /
Disallow: /admin

User-agent: ChatGPT-User
Allow: /
Disallow: /admin

User-agent: Google-Extended
Allow: /
Disallow: /admin

User-agent: anthropic-ai
Allow: /
Disallow: /admin

User-agent: Claude-Web
Allow: /
Disallow: /admin

User-agent: PerplexityBot
Allow: /
Disallow: /admin

Sitemap: ${siteUrl}/sitemap.xml
`
}

function buildSitemapXml(siteUrl: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const urls = [
    { loc: `${siteUrl}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${siteUrl}/#skills`, priority: "0.8", changefreq: "monthly" },
    { loc: `${siteUrl}/#projects`, priority: "0.9", changefreq: "weekly" },
    { loc: `${siteUrl}/#experience`, priority: "0.7", changefreq: "monthly" },
    { loc: `${siteUrl}/#certificates`, priority: "0.6", changefreq: "monthly" },
    { loc: `${siteUrl}/#education`, priority: "0.5", changefreq: "yearly" },
    { loc: `${siteUrl}/#contact`, priority: "0.7", changefreq: "yearly" },
  ]

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`
}

function buildHumansTxt(seo: SeoProfile): string {
  return `/* TEAM */
Name: ${seo.name}
Role: ${seo.jobTitle}
${seo.location ? `Location: ${seo.location}` : ""}
${seo.email ? `Contact: ${seo.email}` : ""}
${seo.github ? `GitHub: ${seo.github}` : ""}
${seo.linkedin ? `LinkedIn: ${seo.linkedin}` : ""}

/* SITE */
Standards: HTML5, CSS3, ESNext
Components: React, TypeScript, Vite, Tailwind CSS, GSAP
CMS: Supabase
`.replace(/\n{3,}/g, "\n\n")
}

function buildWebManifest(seo: SeoProfile): string {
  return `${JSON.stringify(
    {
      name: seo.name,
      short_name: seo.name.split(/\s+/)[0] || seo.name,
      description: seo.description,
      start_url: "/",
      display: "standalone",
      background_color: "#0a0a0a",
      theme_color: "#0a0a0a",
      lang: "en",
      icons: [
        {
          src: "/favicon-32x32.png",
          sizes: "32x32",
          type: "image/png",
        },
        {
          src: "/favicon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
      ],
    },
    null,
    2,
  )}\n`
}

function applyHtmlPlaceholders(
  html: string,
  siteUrl: string,
  seo: SeoProfile,
): string {
  const title = `${seo.name} | ${seo.jobTitle}`
  const replacements: Record<string, string> = {
    "%SITE_URL%": siteUrl,
    "%SITE_TITLE%": title,
    "%SITE_NAME%": seo.name,
    "%SITE_JOB_TITLE%": seo.jobTitle,
    "%SITE_DESCRIPTION%": seo.description,
    "%SITE_HEADLINE%": seo.headline,
    "%SITE_IMAGE%": seo.image,
    "%SITE_EMAIL%": seo.email,
    "%SITE_LOCATION%": seo.location,
    "%SITE_GITHUB%": seo.github,
    "%SITE_LINKEDIN%": seo.linkedin,
    "%SITE_KEYWORDS%": seo.keywords,
  }
  return Object.entries(replacements).reduce(
    (acc, [token, value]) => acc.split(token).join(value),
    html,
  )
}

export function seoFilesPlugin(): Plugin {
  let outDir = "dist"
  let mode = "development"
  let siteUrl = "http://localhost:5173"
  let seo: SeoProfile = FALLBACK
  let loadPromise: Promise<void> | null = null

  const ensureProfile = async () => {
    if (!loadPromise) {
      loadPromise = (async () => {
        seo = await fetchPersonalInfoSeo()
      })()
    }
    await loadPromise
  }

  const writeSeoFiles = (dir: string) => {
    mkdirSync(dir, { recursive: true })
    const llms = buildLlmsTxt(siteUrl, seo)
    writeFileSync(resolve(dir, "robots.txt"), buildRobotsTxt(siteUrl), "utf8")
    writeFileSync(resolve(dir, "sitemap.xml"), buildSitemapXml(siteUrl), "utf8")
    writeFileSync(resolve(dir, "llms.txt"), llms, "utf8")
    writeFileSync(resolve(dir, "llm.txt"), llms, "utf8")
    writeFileSync(resolve(dir, "humans.txt"), buildHumansTxt(seo), "utf8")
    writeFileSync(
      resolve(dir, "site.webmanifest"),
      buildWebManifest(seo),
      "utf8",
    )
  }

  return {
    name: "seo-files",
    configResolved(config) {
      outDir = config.build.outDir
      mode = config.mode
      siteUrl = siteUrlFromEnv(mode)
    },
    async buildStart() {
      await ensureProfile()
      writeSeoFiles(resolve(process.cwd(), "public"))
    },
    async transformIndexHtml(html) {
      await ensureProfile()
      return applyHtmlPlaceholders(html, siteUrl, seo)
    },
    async closeBundle() {
      await ensureProfile()
      writeSeoFiles(resolve(process.cwd(), outDir))
    },
  }
}
