"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

type Lang = "en" | "ne";
type NavItem = { key: "politics" | "business" | "sports"; href: string };

const NAV: NavItem[] = [
  { key: "politics", href: "/section/politics" },
  { key: "business", href: "/section/business" },
  { key: "sports", href: "/section/sports" },
];

const I18N = {
  en: {
    politics: "Politics",
    business: "Business",
    sports: "Sports",
    search: "Search",
    today: "Today",
    ad: "AD",
    bs: "BS",
    dtTitle: "Date & Time",
    dtTitleNe: "मिति र समय",
    notSupported: "BS calendar not supported here",
    notSupportedNe: "BS क्यालेन्डर सपोर्ट छैन",
  },
  ne: {
    politics: "राजनीति",
    business: "व्यापार",
    sports: "खेलकुद",
    search: "खोज",
    today: "आज",
    ad: "ई.सं.",
    bs: "वि.सं.",
    dtTitle: "मिति र समय",
    dtTitleNe: "मिति र समय",
    notSupported: "उपलब्ध छैन",
    notSupportedNe: "उपलब्ध छैन",
  },
} as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Convert 0-9 to Nepali digits (for nicer Nepali UI)
function toNepaliDigits(input: string) {
  const map: Record<string, string> = {
    "0": "०",
    "1": "१",
    "2": "२",
    "3": "३",
    "4": "४",
    "5": "५",
    "6": "६",
    "7": "७",
    "8": "८",
    "9": "९",
  };
  return input.replace(/[0-9]/g, (d) => map[d] ?? d);
}

/**
 * BS date formatting:
 * Try Intl with BS calendar, with a heuristic check to avoid "fake" BS fallbacks.
 * If unsupported, return null (UI shows a graceful message).
 */
function getBsIntl(d: Date, lang: Lang): { date: string; time: string } | null {
  const tryLocales = [
    "ne-NP-u-ca-bikram-sambat",
    "ne-NP-u-ca-bikram",
    "en-US-u-ca-bikram-sambat",
    "en-GB-u-ca-bikram-sambat",
  ];

  for (const locale of tryLocales) {
    try {
      const dateFmt = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const timeFmt = new Intl.DateTimeFormat(lang === "ne" ? "ne-NP" : "en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const dateStr = dateFmt.format(d);
      const timeStr = timeFmt.format(d);

      // Heuristic: BS year should differ significantly from AD year.
      const yearMatch = dateStr.match(/(\d{4})/);
      const y = yearMatch ? parseInt(yearMatch[1], 10) : NaN;
      if (!Number.isFinite(y)) continue;

      const diff = Math.abs(y - d.getFullYear());
      if (diff < 30) continue; // likely not BS

      return { date: dateStr, time: timeStr };
    } catch {
      // try next
    }
  }

  return null;
}

function formatAD(d: Date, lang: Lang) {
  const date = new Intl.DateTimeFormat(lang === "ne" ? "ne-NP" : "en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);

  const time = new Intl.DateTimeFormat(lang === "ne" ? "ne-NP" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return { date, time };
}

function useNow(tickMs = 1000) {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), tickMs);
    return () => clearInterval(t);
  }, [tickMs]);
  return now;
}

function useLocalStorageState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, [key, value]);

  return [value, setValue] as const;
}

function useOutsideClose(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent | TouchEvent) => {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onClose();
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open, onClose]);

  return ref;
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="inline-flex items-center rounded-full border bg-white/70 p-1 shadow-sm">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          lang === "en" ? "bg-black text-white" : "hover:bg-black/5 text-black/80"
        )}
        aria-label="Switch to English"
      >
        <span className="text-sm leading-none">🇺🇸</span>
        <span className="hidden sm:inline">EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLang("ne")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition",
          lang === "ne" ? "bg-black text-white" : "hover:bg-black/5 text-black/80"
        )}
        aria-label="Switch to Nepali"
      >
        <span className="text-sm leading-none">🇳🇵</span>
        <span className="hidden sm:inline">ने</span>
      </button>
    </div>
  );
}

function DateTimeWidget({ lang }: { lang: Lang }) {
  const now = useNow(1000);
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));

  const ad = useMemo(() => formatAD(now, lang), [now, lang]);
  const bs = useMemo(() => getBsIntl(now, lang), [now, lang]);

  const pillText = useMemo(() => {
    const short = `${ad.date.split(",")[0]}, ${ad.date.split(" ").slice(0, 3).join(" ")} • ${ad.time}`;
    return lang === "ne" ? toNepaliDigits(short) : short;
  }, [ad.date, ad.time, lang]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group inline-flex items-center gap-3 rounded-full border px-3 py-2 shadow-sm transition",
          "bg-gradient-to-b from-white to-white/70 hover:from-white hover:to-white",
          "backdrop-blur"
        )}
        aria-label="Date and time (AD and BS)"
        aria-expanded={open}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/35" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
        </span>

        <div className="flex flex-col items-start leading-tight">
          <div className="text-[10px] font-semibold tracking-wide uppercase opacity-70">
            {I18N[lang].today}
          </div>
          <div className="text-xs font-semibold tabular-nums text-black/90">
            {pillText}
          </div>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={cn("opacity-70 transition", open ? "rotate-180" : "")}
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        className={cn(
          "absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border bg-white shadow-xl",
          "transition-[transform,opacity] duration-150 origin-top-right",
          open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        )}
      >
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold tracking-tight text-black/90">
              {lang === "ne" ? I18N[lang].dtTitleNe : I18N[lang].dtTitle}
            </div>
            <div className="text-[11px] opacity-60">{lang === "ne" ? "स्वचालित" : "Auto"}</div>
          </div>

          <div className="grid gap-2">
            <div className="rounded-xl border bg-black/[0.02] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <div className="text-[11px] font-semibold opacity-70">{I18N[lang].ad}</div>
                </div>
                <div className="text-[11px] opacity-60 tabular-nums">
                  {lang === "ne" ? toNepaliDigits(ad.time) : ad.time}
                </div>
              </div>
              <div className="mt-1 text-sm font-semibold tabular-nums">
                {lang === "ne" ? toNepaliDigits(ad.date) : ad.date}
              </div>
            </div>

            <div className="rounded-xl border bg-black/[0.02] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <div className="text-[11px] font-semibold opacity-70">{I18N[lang].bs}</div>
                </div>
                <div className="text-[11px] opacity-60 tabular-nums">
                  {bs ? bs.time : (lang === "ne" ? I18N[lang].notSupportedNe : I18N[lang].notSupported)}
                </div>
              </div>

              <div className="mt-1 text-sm font-semibold tabular-nums">
                {bs ? bs.date : (lang === "ne" ? "—" : "—")}
              </div>

              {!bs ? (
                <div className="mt-2 text-[11px] opacity-60 leading-snug">
                  {lang === "ne"
                    ? "केही सिस्टममा BS Intl सपोर्ट हुँदैन। 100% सही BS का लागि हामी converter library जोड्छौं।"
                    : "Some environments don’t support BS via Intl. For 100% accurate BS everywhere, we’ll add a converter library."}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useLocalStorageState<Lang>("npw_lang", "en");

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const activeHref = useMemo(() => {
    const match = NAV.find((n) => pathname?.startsWith(n.href));
    return match?.href ?? "";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      {/* Brand accent strip (adds contrast; avoids pale look) */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />

      <div className="border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-[0_10px_30px_-20px_rgba(0,0,0,0.35)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo: no box, no border — modern clean lockup */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                width={52}
                height={52}
                priority
                className="h-11 w-11 sm:h-12 sm:w-12 object-contain"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((n) => {
                const active = activeHref === n.href;
                const label = I18N[lang][n.key];
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-semibold transition",
                      active
                        ? "bg-black text-white shadow-sm"
                        : "text-black/85 hover:bg-black/5"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Date/time widget */}
              <div className="hidden sm:block">
                <DateTimeWidget lang={lang} />
              </div>

              {/* Language toggle */}
              <LangToggle lang={lang} setLang={setLang} />

              {/* Search */}
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center rounded-full border bg-white/70 px-3 py-2 text-sm font-semibold shadow-sm hover:bg-black hover:text-white transition"
              >
                {I18N[lang].search}
              </Link>

              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white/70 shadow-sm hover:bg-black/5 transition"
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-85">
                  {menuOpen ? (
                    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  ) : (
                    <path
                      d="M4 7H20M4 12H20M4 17H20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <div
            className={cn(
              "md:hidden overflow-hidden transition-[max-height,opacity] duration-200",
              menuOpen ? "max-h-[680px] opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="pb-4 pt-3 space-y-3">
              {/* Date/Time on mobile */}
              <DateTimeWidget lang={lang} />

              <div className="grid gap-2">
                {NAV.map((n) => {
                  const active = activeHref === n.href;
                  const label = I18N[lang][n.key];
                  return (
                    <Link
                      key={n.href}
                      href={n.href}
                      className={cn(
                        "rounded-2xl border px-4 py-3 text-sm font-semibold transition shadow-sm",
                        active ? "bg-black text-white border-black" : "bg-white/80 hover:bg-black/5 text-black/85"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}

                <Link
                  href="/search"
                  className="rounded-2xl border px-4 py-3 text-sm font-semibold bg-white/80 hover:bg-black hover:text-white transition shadow-sm"
                >
                  {I18N[lang].search}
                </Link>
              </div>

              {/* Subtle accent strip to keep the system cohesive */}
              <div className="overflow-hidden rounded-2xl border">
                <div className="h-1.5 w-full bg-yellow-400" />
                <div className="h-1.5 w-full bg-red-600" />
                <div className="h-1.5 w-full bg-black" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-black/5" />
    </header>
  );
}
