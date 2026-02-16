"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { DateConverter } from "@remotemerge/nepali-date-converter";

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
    auto: "Auto",
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
  },
} as const;

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

// Convert 0-9 to Nepali digits for better Nepali UI
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
 * BS conversion (AD -> BS) using a real converter library.
 * Scientific note: Bikram Sambat does not have a simple arithmetic offset from AD,
 * so we rely on a dataset-based converter to avoid incorrect dates.
 */
function getBs(d: Date, lang: Lang): { date: string; time: string } {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const iso = `${y}-${m}-${day}`;

  // Library returns structured BS components
  const bs = new DateConverter(iso).toBs() as {
    year: number;
    month: number; // 1..12
    date: number; // 1..32
    day?: string; // e.g. "Monday"
  };

  const monthIdx = Math.max(1, Math.min(12, bs.month)) - 1;
  const monthName = lang === "ne" ? BS_MONTHS_NE[monthIdx] : BS_MONTHS_EN[monthIdx];
  const weekday = bs.day ? (lang === "ne" ? WEEKDAY_NE[bs.day] ?? bs.day : bs.day) : "";

  // BS date string (readable, not ambiguous)
  const dateStr =
    lang === "ne"
      ? `${weekday ? weekday + ", " : ""}${toNepaliDigits(String(bs.year))} ${monthName} ${toNepaliDigits(
          String(bs.date)
        )}`
      : `${weekday ? weekday + ", " : ""}${bs.year} ${monthName} ${bs.date}`;

  // Time (clock time is same local time; calendar changes, not clock)
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
          lang === "en" ? "bg-black text-white" : "text-black/80 hover:bg-black/5"
        )}
        aria-label="Switch to English"
        title="English"
      >
        🇬🇧
      </button>
      <button
        type="button"
        onClick={() => setLang("ne")}
        className={cn(
          "inline-flex items-center justify-center rounded-full px-3 py-2 text-sm transition",
          lang === "ne" ? "bg-black text-white" : "text-black/80 hover:bg-black/5"
        )}
        aria-label="Switch to Nepali"
        title="नेपाली"
      >
        🇳🇵
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

  // Compact text shown on the pill
  const pillText = useMemo(() => {
    const short = `${ad.date.split(",")[0]} • ${ad.time}`;
    return short;
  }, [ad.date, ad.time]);

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
        {/* Brand accent strip */}
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
      {/* Brand accent strip (adds contrast without shadows) */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />

      <div className="border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between gap-3">
            {/* Logo: bigger, clean (no box/border) */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                width={64}
                height={64}
                priority
                className="h-12 w-12 sm:h-14 sm:w-14 object-contain"
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
                      active ? "bg-black text-white" : "text-black/85 hover:bg-black/5"
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

              {/* Language toggle (flag-only) */}
              <LangToggle lang={lang} setLang={setLang} />

              {/* Search (clean pill, no border) */}
              <Link
                href="/search"
                className="hidden sm:inline-flex items-center rounded-full bg-white/60 px-3 py-2 text-sm font-semibold text-black/80 backdrop-blur hover:bg-white/80 transition"
              >
                {I18N[lang].search}
              </Link>

              {/* Mobile menu */}
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/60 backdrop-blur hover:bg-white/80 transition"
                aria-label="Open menu"
                aria-expanded={menuOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black/80">
                  {menuOpen ? (
                    <path
                      d="M6 6L18 18M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
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
                        "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                        active ? "bg-black text-white" : "bg-white/60 hover:bg-white/80 text-black/85"
                      )}
                    >
                      {label}
                    </Link>
                  );
                })}

                <Link
                  href="/search"
                  className="rounded-2xl px-4 py-3 text-sm font-semibold bg-white/60 hover:bg-white/80 transition"
                >
                  {I18N[lang].search}
                </Link>
              </div>

              {/* Small brand bars for mobile cohesion */}
              <div className="overflow-hidden rounded-2xl bg-white/60">
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
