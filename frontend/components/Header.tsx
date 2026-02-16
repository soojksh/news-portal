"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DateConverter from "@remotemerge/nepali-date-converter";

type Lang = "en" | "ne";
type NavItem = { key: "politics" | "business" | "sports"; href: string };

type SearchDoc = {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  section?: string;
  hero_image_url?: string;
};

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
    auto: "Auto",
    searchPlaceholder: "Search news, topics, people…",
    searching: "Searching…",
    suggestions: "Suggestions",
    noSuggestions: "No suggestions",
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
    auto: "स्वचालित",
    searchPlaceholder: "समाचार, विषय, व्यक्तिहरू खोज्नुहोस्…",
    searching: "खोज्दै…",
    suggestions: "सुझाव",
    noSuggestions: "कुनै सुझाव छैन",
  },
} as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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

const BS_MONTHS_NE = [
  "बैशाख",
  "जेठ",
  "असार",
  "श्रावण",
  "भदौ",
  "आश्विन",
  "कार्तिक",
  "मंसिर",
  "पौष",
  "माघ",
  "फाल्गुन",
  "चैत्र",
];

const BS_MONTHS_EN = [
  "Baisakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

const WEEKDAY_NE: Record<string, string> = {
  Sunday: "आइतबार",
  Monday: "सोमबार",
  Tuesday: "मंगलबार",
  Wednesday: "बुधबार",
  Thursday: "बिहीबार",
  Friday: "शुक्रबार",
  Saturday: "शनिबार",
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * BS conversion (AD -> BS) using a dataset-based converter.
 * Note: BS conversion cannot be derived from a constant offset; it requires calendar mapping data.
 */
function getBs(d: Date, lang: Lang): { date: string; time: string } {
  const iso = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

  const bs = new (DateConverter as any)(iso).toBs() as {
    year: number;
    month: number; // 1..12
    date: number; // 1..32
    day?: string;
  };

  const monthIdx = Math.max(1, Math.min(12, bs.month)) - 1;
  const monthName = lang === "ne" ? BS_MONTHS_NE[monthIdx] : BS_MONTHS_EN[monthIdx];
  const weekday = bs.day ? (lang === "ne" ? WEEKDAY_NE[bs.day] ?? bs.day : bs.day) : "";

  const dateStr =
    lang === "ne"
      ? `${weekday ? weekday + ", " : ""}${toNepaliDigits(String(bs.year))} ${monthName} ${toNepaliDigits(
          String(bs.date)
        )}`
      : `${weekday ? weekday + ", " : ""}${bs.year} ${monthName} ${bs.date}`;

  const timeStr = new Intl.DateTimeFormat(lang === "ne" ? "ne-NP" : "en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);

  return { date: dateStr, time: lang === "ne" ? toNepaliDigits(timeStr) : timeStr };
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

  return {
    date: lang === "ne" ? toNepaliDigits(date) : date,
    time: lang === "ne" ? toNepaliDigits(time) : time,
  };
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
    <div className="inline-flex items-center rounded-full bg-white/60 px-1 py-1 backdrop-blur">
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm transition",
          lang === "en" ? "bg-zinc-200 text-black" : "text-black/80 hover:bg-black/5"
        )}
        aria-label="Switch to English"
        title="English"
      >
        <Image src="/flags/gb.svg" alt="English" width={18} height={18} className="h-[18px] w-[18px] rounded-sm" />
      </button>

      <button
        type="button"
        onClick={() => setLang("ne")}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm transition",
          lang === "ne" ? "bg-zinc-200 text-black" : "text-black/80 hover:bg-black/5"
        )}
        aria-label="Switch to Nepali"
        title="नेपाली"
      >
        <Image src="/flags/np.svg" alt="नेपाली" width={18} height={18} className="h-[18px] w-[18px] rounded-sm" />
      </button>
    </div>
  );
}

function DateTimeWidget({ lang }: { lang: Lang }) {
  const now = useNow(1000);
  const [open, setOpen] = useState(false);
  const ref = useOutsideClose(open, () => setOpen(false));

  const ad = useMemo(() => formatAD(now, lang), [now, lang]);
  const bs = useMemo(() => getBs(now, lang), [now, lang]);

  const pillText = useMemo(() => `${ad.date.split(",")[0]} • ${ad.time}`, [ad.date, ad.time]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "group inline-flex items-center gap-3 rounded-full px-3 py-2 transition",
          "bg-white/60 hover:bg-white/80 backdrop-blur"
        )}
        aria-label="Date and time (AD and BS)"
        aria-expanded={open}
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500/35" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
        </span>

        <div className="flex flex-col items-start leading-tight">
          <div className="text-[10px] font-semibold tracking-wide uppercase text-black/60">
            {I18N[lang].today}
          </div>
          <div className="text-xs font-semibold tabular-nums text-black/90">{pillText}</div>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={cn("text-black/60 transition", open ? "rotate-180" : "")}
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
          "absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-xl",
          "transition-[transform,opacity] duration-150 origin-top-right",
          open ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
        )}
      >
        <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold tracking-tight text-black/90">{I18N[lang].dtTitle}</div>
            <div className="text-[11px] text-black/50">{I18N[lang].auto}</div>
          </div>

          <div className="grid gap-2">
            <div className="rounded-xl bg-black/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <div className="text-[11px] font-semibold text-black/60">{I18N[lang].ad}</div>
                </div>
                <div className="text-[11px] text-black/50 tabular-nums">{ad.time}</div>
              </div>
              <div className="mt-1 text-sm font-semibold tabular-nums text-black/90">{ad.date}</div>
            </div>

            <div className="rounded-xl bg-black/[0.03] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-600" />
                  <div className="text-[11px] font-semibold text-black/60">{I18N[lang].bs}</div>
                </div>
                <div className="text-[11px] text-black/50 tabular-nums">{bs.time}</div>
              </div>
              <div className="mt-1 text-sm font-semibold tabular-nums text-black/90">{bs.date}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Tiny scoring for suggestions (no backend changes). */
function scoreDoc(q: string, d: SearchDoc) {
  const query = q.trim().toLowerCase();
  if (!query) return 0;

  const title = (d.title || "").toLowerCase();
  const sub = (d.subtitle || "").toLowerCase();
  const exc = (d.excerpt || "").toLowerCase();
  const sec = (d.section || "").toLowerCase();

  let score = 0;

  if (title === query) score += 200;
  if (title.startsWith(query)) score += 120;
  if (title.includes(query)) score += 80;

  if (sub.includes(query)) score += 25;
  if (exc.includes(query)) score += 15;
  if (sec.includes(query)) score += 10;

  // Token bonus (handles multi-word queries)
  const tokens = query.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const hay = `${title} ${sub} ${exc} ${sec}`;
    const hit = tokens.reduce((acc, t) => (hay.includes(t) ? acc + 1 : acc), 0);
    score += hit * 12;
  }

  return score;
}

/**
 * Search banner (smart UI, zero backend changes)
 * - Prefetches a lightweight index from existing endpoints (home + top sections)
 * - Shows suggestions while typing
 * - Navigates to /search?q=... on submit
 */
function SearchBanner({
  open,
  onClose,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  lang: Lang;
}) {
  const router = useRouter();
  const ref = useOutsideClose(open, onClose);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Focus on open
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Prefetch a small search index ONCE per session (smart + fast).
  useEffect(() => {
    if (!open) return;
    if (hydrated) return;

    let alive = true;

    (async () => {
      try {
        setLoading(true);

        // Existing endpoints only (no backend changes):
        // - home gives latest + featured
        // - sections give first page for each section
        const endpoints = [
          "/api/v1/home/",
          "/api/v1/sections/politics/",
          "/api/v1/sections/business/",
          "/api/v1/sections/sports/",
        ];

        const res = await Promise.all(
          endpoints.map((p) =>
            fetch(p, { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
          )
        );

        if (!alive) return;

        const home = res[0] as any;
        const secPol = res[1] as any;
        const secBiz = res[2] as any;
        const secSpo = res[3] as any;

        const pack: SearchDoc[] = [];

        // home.latest + home.featured
        for (const a of (home?.latest ?? []) as any[]) {
          pack.push({
            title: a.title,
            slug: a.slug,
            subtitle: a.subtitle,
            excerpt: a.excerpt,
            section: a.section,
            hero_image_url: a.hero_image_url,
          });
        }
        for (const a of (home?.featured ?? []) as any[]) {
          pack.push({
            title: a.title,
            slug: a.slug,
            subtitle: a.subtitle,
            excerpt: a.excerpt,
            section: a.section,
            hero_image_url: a.hero_image_url,
          });
        }

        // section feeds: results[]
        for (const a of (secPol?.results ?? []) as any[]) pack.push(a);
        for (const a of (secBiz?.results ?? []) as any[]) pack.push(a);
        for (const a of (secSpo?.results ?? []) as any[]) pack.push(a);

        // Deduplicate by slug
        const seen = new Set<string>();
        const uniq = pack.filter((d) => {
          if (!d?.slug) return false;
          if (seen.has(d.slug)) return false;
          seen.add(d.slug);
          return true;
        });

        setDocs(uniq);
        setHydrated(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, hydrated]);

  const suggestions = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    return docs
      .map((d) => ({ d, s: scoreDoc(query, d) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 6)
      .map((x) => x.d);
  }, [q, docs]);

  function submit(nextQ?: string) {
    const query = (nextQ ?? q).trim();
    if (!query) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div
      className={cn(
        "overflow-hidden transition-[max-height,opacity] duration-200",
        open ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
      )}
      aria-hidden={!open}
    >
      <div className="border-b bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div ref={ref} className="space-y-2">
            <div className="flex items-center gap-3 rounded-2xl bg-black/[0.03] px-4 py-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/60">
                <path
                  d="M21 21L16.6 16.6M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
                placeholder={I18N[lang].searchPlaceholder}
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
              />

              <button
                type="button"
                className="rounded-xl bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/90 transition"
                onClick={() => submit()}
              >
                {I18N[lang].search}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-black/5 transition"
                aria-label="Close search"
                title="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-black/70">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Suggestions */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2">
                <div className="text-[11px] font-extrabold uppercase tracking-wide text-black/50">
                  {I18N[lang].suggestions}
                </div>
                <div className="text-[11px] text-black/45">
                  {loading ? I18N[lang].searching : " "}
                </div>
              </div>

              <div className="divide-y">
                {q.trim() && suggestions.length ? (
                  suggestions.map((s) => (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => submit(s.title)}
                      className="w-full text-left px-4 py-3 hover:bg-black/[0.03] transition"
                    >
                      <div className="text-sm font-semibold text-black/90 line-clamp-1">
                        {s.title}
                      </div>
                      <div className="mt-1 text-xs text-black/55 flex items-center gap-2">
                        {s.section ? (
                          <span className="rounded-full bg-black/[0.04] px-2 py-0.5">
                            {s.section}
                          </span>
                        ) : null}
                        {s.subtitle ? <span className="line-clamp-1">{s.subtitle}</span> : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-3 text-sm text-black/55">
                    {q.trim() ? I18N[lang].noSuggestions : I18N[lang].searchPlaceholder}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-black/45">
              Tip: Press <span className="font-semibold">Enter</span> to search •{" "}
              <span className="font-semibold">Esc</span> to close.
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

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    // Close menus on route change
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const activeHref = useMemo(() => {
    const match = NAV.find((n) => pathname?.startsWith(n.href));
    return match?.href ?? "";
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />

      <div className="border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                width={72}
                height={72}
                priority
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
              />
            </Link>

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
                      active ? "bg-black text-white" : "text-black/85 hover:bg-black/5"
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <DateTimeWidget lang={lang} />
              </div>

              <LangToggle lang={lang} setLang={setLang} />

              {/* Search toggles banner */}
              <button
                type="button"
                onClick={() => setSearchOpen((v) => !v)}
                className={cn(
                  "hidden sm:inline-flex items-center rounded-full bg-white/60 px-3 py-2 text-sm font-semibold text-black/80 backdrop-blur transition",
                  "hover:bg-white/80"
                )}
                aria-label="Open search"
                aria-expanded={searchOpen}
              >
                {I18N[lang].search}
              </button>

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur hover:bg-white/80 transition"
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/80">
                  {menuOpen ? (
                    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  ) : (
                    <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search banner under header row */}
        <SearchBanner open={searchOpen} onClose={() => setSearchOpen(false)} lang={lang} />
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-[max-height,opacity] duration-200",
          menuOpen ? "max-h-[680px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mx-auto max-w-6xl px-4 pb-4 pt-3 space-y-3 bg-white/85 backdrop-blur border-b">
          <DateTimeWidget lang={lang} />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="w-full rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-black/85 hover:bg-white/80 transition text-left"
          >
            {I18N[lang].search}
          </button>

          <div className="grid gap-2">
            {NAV.map((n) => {
              const active = activeHref === n.href;
              const label = I18N[lang][n.key];
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    active ? "bg-black text-white" : "bg-white/60 hover:bg-white/80 text-black/85"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-2xl bg-white/60">
            <div className="h-1.5 w-full bg-yellow-400" />
            <div className="h-1.5 w-full bg-red-600" />
            <div className="h-1.5 w-full bg-black" />
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-black/5" />
    </header>
  );
}
