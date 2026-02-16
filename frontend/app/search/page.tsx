import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { DEMO_ARTICLES } from "@/lib/demoNews";

type ArticleCardType = {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  section?: string;
  hero_image_url?: string;
  label?: string;
};

type HomeResponse = {
  featured: ArticleCardType[];
  latest: ArticleCardType[];
};

type SectionFeedResponse = {
  next: string | null;
  previous: string | null;
  results: ArticleCardType[];
};

function uniqBySlug<T extends { slug: string }>(arr: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const a of arr) {
    if (!a?.slug) continue;
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    out.push(a);
  }
  return out;
}

function tokenize(q: string) {
  return q
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function score(q: string, a: ArticleCardType) {
  const query = q.trim().toLowerCase();
  if (!query) return 0;

  const title = (a.title || "").toLowerCase();
  const sub = (a.subtitle || "").toLowerCase();
  const exc = (a.excerpt || "").toLowerCase();
  const sec = (a.section || "").toLowerCase();

  let s = 0;
  if (title === query) s += 200;
  if (title.startsWith(query)) s += 120;
  if (title.includes(query)) s += 80;
  if (sub.includes(query)) s += 25;
  if (exc.includes(query)) s += 15;
  if (sec.includes(query)) s += 10;

  // Multi-token bonus
  const tokens = tokenize(query);
  if (tokens.length > 1) {
    const hay = `${title} ${sub} ${exc} ${sec}`;
    const hit = tokens.reduce((acc, t) => (hay.includes(t) ? acc + 1 : acc), 0);
    s += hit * 12;
  }

  return s;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; section?: string }>;
}) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const sectionFilter = (sp.section ?? "").trim().toLowerCase(); // optional, used later

  // Fetch a decent pool from existing endpoints (no backend changes)
  const [home, politics, business, sports] = await Promise.all([
    apiGet<HomeResponse>("/api/v1/home/").catch(() => ({ featured: [], latest: [] })),
    apiGet<SectionFeedResponse>("/api/v1/sections/politics/").catch(() => ({ next: null, previous: null, results: [] })),
    apiGet<SectionFeedResponse>("/api/v1/sections/business/").catch(() => ({ next: null, previous: null, results: [] })),
    apiGet<SectionFeedResponse>("/api/v1/sections/sports/").catch(() => ({ next: null, previous: null, results: [] })),
  ]);

  const pool = uniqBySlug([
    ...(home.latest ?? []),
    ...(home.featured ?? []),
    ...(politics.results ?? []),
    ...(business.results ?? []),
    ...(sports.results ?? []),
    ...DEMO_ARTICLES, 
  ]);

  const filteredPool = sectionFilter
    ? pool.filter((a) => (a.section || "").toLowerCase() === sectionFilter)
    : pool;

  const results = q
    ? filteredPool
        .map((a) => ({ a, s: score(q, a) }))
        .filter((x) => x.s > 0)
        .sort((x, y) => y.s - x.s)
        .map((x) => x.a)
    : [];

  const sections = ["politics", "business", "sports"] as const;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-black/50">
              Search
            </div>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-black/90 sm:text-3xl">
              {q ? (
                <>
                  Results for <span className="underline decoration-black/20">“{q}”</span>
                </>
              ) : (
                "Type a keyword to search"
              )}
            </h1>
            {q ? (
              <div className="mt-1 text-sm text-black/60">
                {results.length} result{results.length === 1 ? "" : "s"} found
              </div>
            ) : null}
          </div>

          <Link href="/" className="text-sm text-black/60 hover:text-black hover:underline">
            ← Home
          </Link>
        </div>

        {/* Quick section chips */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={q ? `/search?q=${encodeURIComponent(q)}` : "/search"}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
              !sectionFilter ? "bg-black text-white" : "bg-white/70 text-black/80 hover:bg-white"
            }`}
          >
            All
          </Link>

          {sections.map((s) => (
            <Link
              key={s}
              href={q ? `/search?q=${encodeURIComponent(q)}&section=${s}` : `/search?section=${s}`}
              className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                sectionFilter === s ? "bg-black text-white" : "bg-white/70 text-black/80 hover:bg-white"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Link>
          ))}
        </div>

        {/* Results grid */}
        {q ? (
          results.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a.slug} {...a} variant="default" />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
              <div className="text-lg font-extrabold text-black/90">No results found</div>
              <div className="mt-1 text-sm text-black/60">
                Try different keywords, or check spelling. You can also browse sections.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/section/politics" className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10">
                  Politics
                </Link>
                <Link href="/section/business" className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10">
                  Business
                </Link>
                <Link href="/section/sports" className="rounded-full bg-black/5 px-4 py-2 text-sm font-semibold hover:bg-black/10">
                  Sports
                </Link>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-sm text-black/70">
              Use the <span className="font-semibold">Search</span> button in the header to open the search bar.
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
