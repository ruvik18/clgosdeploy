import * as React from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Footer } from "./Footer";
import { X, Menu } from "lucide-react";

const NAV_LINKS = [
  { label: "Colleges", href: "/colleges" },
  { label: "Branches", href: "/branches" },
  { label: "JoSAA List", href: "/josaa-list" },
  { label: "Counsellings", href: "/counsellings" },
  { label: "Compare", href: "/compare" },
  { label: "My Shortlist", href: "/shortlist" },
];

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted)
    return (
      <div
        className={`w-10 h-10 rounded-full border border-[#d1d5db] dark:border-zinc-800 ${className}`}
      />
    );
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={`w-10 h-10 rounded-full border border-[#d1d5db] dark:border-zinc-800 flex items-center justify-center hover:bg-[#f0ede8] dark:hover:bg-zinc-900 transition-colors ${className}`}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      )}
    </button>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [location] = useLocation();

  React.useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  React.useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className="w-full py-3.5 z-50 sticky top-0 bg-[#f8f4f0]/90 dark:bg-[#121011]/90 backdrop-blur-md border-b border-[#d1d5db]/50 dark:border-zinc-850/50">
        <div className="px-4 sm:px-6 lg:mx-64 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 font-sans text-[18px] sm:text-[20px] font-medium text-[#000000] dark:text-white shrink-0"
            data-testid="link-home"
          >
            <img
              src="/logos/logoos.png"
              alt="CouncilOS"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover shrink-0"
            />
            CouncilOS
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-body-base text-[#352d33] dark:text-[#969696] hover:text-[#000000] dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/fit"
              className="flex items-center gap-1.5 bg-[#d1beff] border border-[#24341d] text-[#111111] px-4 py-2 rounded-sm text-body-base font-medium hover:bg-[#c4aefd] transition-colors"
            >
              <span className="text-sm">✦</span>
              Fit Engine
            </Link>
            <Link
              href="/colleges"
              className="bg-[#000000] dark:bg-white text-[#ffffff] dark:text-black px-5 py-2.5 rounded-sm text-body-base font-medium hover:bg-[#352d33] dark:hover:bg-zinc-200 transition-colors"
              data-testid="button-cta-nav"
            >
              Colleges
            </Link>
          </div>

          {/* Mobile right: theme toggle + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle className="hidden sm:flex" />
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="w-10 h-10 flex items-center justify-center rounded-full border border-[#d1d5db] dark:border-zinc-800 hover:bg-[#f0ede8] dark:hover:bg-zinc-900 transition-colors"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[min(320px,85vw)] z-50 bg-[#f8f4f0] dark:bg-[#121011] border-l border-[#d1d5db]/50 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#d1d5db]/50 dark:border-zinc-800">
          <span className="font-sans text-[18px] font-medium text-[#000000] dark:text-white">
            Councilos
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-[#d1d5db] dark:border-zinc-800 hover:bg-[#f0ede8] dark:hover:bg-zinc-900 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-6 py-6 flex flex-col gap-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-base font-medium text-[#241f23] dark:text-[#f8f4f0] hover:text-black dark:hover:text-white py-3.5 border-b border-[#d1d5db]/40 dark:border-zinc-800/60 transition-colors flex items-center justify-between group"
            >
              {item.label}
              <svg
                className="w-4 h-4 text-[#969696] group-hover:translate-x-0.5 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </nav>

        {/* Bottom CTA */}
        <div className="px-6 py-6 border-t border-[#d1d5db]/50 dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#969696]">Appearance</span>
            <ThemeToggle />
          </div>
          <Link
            href="/colleges"
            className="w-full bg-[#000000] dark:bg-white text-white dark:text-black py-3.5 rounded-sm text-sm font-medium text-center hover:bg-[#352d33] transition-colors"
          >
            Search Colleges
          </Link>
          <Link
            href="/fit"
            className="w-full bg-[#d1beff] text-[#111111] border border-[#24341d] py-3.5 rounded-sm text-sm font-medium text-center hover:bg-[#c4aefd] transition-colors"
          >
            ✦ College Fit Engine
          </Link>
        </div>
      </div>
    </>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col font-sans overflow-x-hidden bg-[#f8f4f0] dark:bg-[#121011]">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
