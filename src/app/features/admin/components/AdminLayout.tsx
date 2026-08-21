import { useEffect, useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Menu, Shield, LogOut } from "lucide-react";
import AdminNavMenu from "./AdminNavMenu";
import { useAuth } from "../../../providers/AuthProvider";

const titles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/personal-info": "Personal Info",
  "/admin/skills": "Skills",
  "/admin/categories": "Categories",
  "/admin/projects": "Projects",
  "/admin/experiences": "Experience",
  "/admin/educations": "Education",
  "/admin/certificates": "Certificates",
};

export default function AdminLayout() {
  const location = useLocation();
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = titles[location.pathname] ?? "Admin";

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} | Admin`;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    const previousRobots = robots.getAttribute("content");
    robots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = previousTitle;
      if (previousRobots) robots.setAttribute("content", previousRobots);
      else robots.setAttribute("content", "index, follow");
    };
  }, [title]);

  return (
    <div className="flex min-h-dvh bg-background text-on-surface">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-65 border-r border-white/10 bg-surface-container-high md:flex md:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <Link
            to="/admin"
            className="flex items-center gap-2 font-headline text-xl font-bold text-primary"
          >
            <Shield className="size-6" aria-hidden />
            Admin
          </Link>
        </div>
        <AdminNavMenu />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 cursor-pointer bg-black/70 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="relative flex h-full w-65 flex-col bg-surface-container-high shadow-glow-cyan">
            <div className="border-b border-white/10 px-6 py-6">
              <span className="flex items-center gap-2 font-headline text-xl font-bold text-primary">
                <Shield className="size-6" aria-hidden />
                Admin
              </span>
            </div>
            <AdminNavMenu onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-dvh flex-1 flex-col md:ml-65">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/10 bg-surface-container-high px-4 py-4 md:px-8 md:py-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="cursor-pointer text-primary md:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              aria-label="Open menu"
            >
              <Menu className="size-6" />
            </button>
            <h1 className="font-headline text-xl font-bold text-on-surface md:text-2xl">
              {title}
            </h1>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 bg-surface-container-highest border border-outline-variant/30 font-label text-xs tracking-widest uppercase text-secondary hover:bg-secondary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
