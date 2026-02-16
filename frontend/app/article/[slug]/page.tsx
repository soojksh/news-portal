import Image from "next/image";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { StreamField } from "@/components/StreamField";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdSlot } from "@/components/AdSlot";
import { DEMO_ADS } from "@/lib/demoAds";
import { ShareBar } from "@/components/ShareBar";

type ArticleDetail = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  first_published_at: string;
  last_published_at: string;
  section: string;
  tags: string[];
  hero_image_url: string;
  body: any[];
};

type ArticleCardType = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  first_published_at: string | null;
  section: string;
  hero_image_url: string;
  label?: string;
};

type SectionFeedResponse = {
  next: string | null;
  previous: string | null;
  results: ArticleCardType[];
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Scientific note:
 * Reading time is an estimate based on ~200 words/minute for on-screen reading.
 * For HTML-ish StreamField values, we do a conservative strip of tags.
 */
function stripHtml(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function estimateReadingTime(body: any[]) {
  let text = "";
  for (const b of body ?? []) {
    if (!b || typeof b !== "object") continue;
    if (b.type === "paragraph" && typeof b.value === "string") text += " " + stripHtml(b.value);
    if (b.type === "heading" && typeof b.value === "string") text += " " + b.value;
    // You can add more block types here later (quote, list, etc.)
  }
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  const minutes = Math.max(1, Math.round(words / 200));
  return { words, minutes };
}

function fmtDateTimeISO(iso: string) {
  // Keep it simple and newsroom-like; you can localize later with lang toggle.
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function splitForInlineAds(blocks: any[]) {
  const safe = Array.isArray(blocks) ? blocks : [];
  if (safe.length < 8) return { top: safe, mid: [], tail: [] };

  // “Scientific placement” heuristic:
  // - avoid ads before the reader gets value (don’t place at very top of body)
  // - place a mid-article unit around ~35–45% for long reads
  const midIndex = Math.floor(safe.length * 0.42);

  return {
    top: safe.slice(0, midIndex),
    mid: safe.slice(midIndex, midIndex + 1), // a small “bridge” chunk if you want
    tail: safe.slice(midIndex + 1),
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await apiGet<ArticleDetail>(`/api/v1/articles/${slug}/`);

  // Canonical URL used by share tools (set NEXT_PUBLIC_SITE_URL in .env.local for production)
  const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const canonicalUrl = `${SITE}/article/${article.slug}`;

  const { minutes } = estimateReadingTime(article.body ?? []);
  const published = article.first_published_at ? fmtDateTimeISO(article.first_published_at) : "";
  const updated =
    article.last_published_at && article.last_published_at !== article.first_published_at
      ? fmtDateTimeISO(article.last_published_at)
      : "";

  // Related: “More from this section”
  // Uses your existing API: /api/v1/sections/<slug>/
  let related: ArticleCardType[] = [];
  try {
    const feed = await apiGet<SectionFeedResponse>(`/api/v1/sections/${article.section}/`);
    related = (feed.results || []).filter((a) => a.slug !== article.slug).slice(0, 6);
  } catch {
    related = [];
  }

  const { top, tail } = splitForInlineAds(article.body ?? []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      {/* Page grid: sticky share + main content + sidebar */}
      <main className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Sticky share (desktop) */}
          <ShareBar url={canonicalUrl} title={article.title} variant="sticky" className="lg:col-span-1" />

          {/* Main article */}
          <article className="lg:col-span-8">
            {/* Breadcrumb */}
            <div className="text-sm text-black/60">
              <Link href="/" className="hover:underline">
                Home
              </Link>
              <span className="mx-2 opacity-40">/</span>
              <Link href={`/section/${article.section}`} className="hover:underline">
                {article.section}
              </Link>
            </div>

            {/* Header */}
            <header className="mt-4 space-y-3">
              <div className="inline-flex items-center gap-2">
                <div className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black/70">
                  {article.section}
                </div>
                {minutes ? (
                  <div className="text-xs font-semibold text-black/50">{minutes} min read</div>
                ) : null}
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-black/95 sm:text-4xl">
                {article.title}
              </h1>

              {article.subtitle ? (
                <p className="text-base text-black/70 sm:text-lg">{article.subtitle}</p>
              ) : null}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-black/60">
                <div className="font-semibold text-black/70">NewsWire</div>
                {published ? <div>Published: {published}</div> : null}
                {updated ? <div>Updated: {updated}</div> : null}
              </div>

              {/* Share (mobile/inline) */}
              <div className="lg:hidden pt-2">
                <ShareBar url={canonicalUrl} title={article.title} variant="inline" />
              </div>
            </header>

            {/* Hero */}
            {article.hero_image_url ? (
              <div className="mt-6 overflow-hidden rounded-3xl bg-white/70">
                <Image
                  src={article.hero_image_url}
                  alt={article.title}
                  width={1200}
                  height={700}
                  className="h-auto w-full object-cover"
                  unoptimized
                  priority
                />
              </div>
            ) : null}

            {/* Top banner ad (after hero — standard high-performing placement without harming the lead) */}
            <div className="mt-6">
              <AdSlot ad={DEMO_ADS[0]} variant="banner" />
            </div>

            {/* Body: split + mid ad */}
            <div className="mt-6 space-y-6">
              <div className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:font-semibold">
                <StreamField blocks={top} />
              </div>

              {/* Mid-article ad (in-content) */}
              <div className="rounded-3xl bg-white/70 p-4">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-black/45">
                  Advertisement
                </div>
                <div className="mt-3">
                  <AdSlot ad={DEMO_ADS[1]} />
                </div>
              </div>

              <div className="prose prose-zinc max-w-none prose-headings:tracking-tight prose-a:font-semibold">
                <StreamField blocks={tail} />
              </div>
            </div>

            {/* Tags */}
            {article.tags?.length ? (
              <div className="mt-8 flex flex-wrap items-center gap-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                  Tags
                </div>
                {article.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/search?tag=${encodeURIComponent(t)}`}
                    className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/70 hover:bg-black/10 transition"
                  >
                    {t}
                  </Link>
                ))}
              </div>
            ) : null}

            {/* Bottom share + recirculation (common on major news sites) */}
            <div className="mt-10 space-y-4 rounded-3xl bg-white/70 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="text-sm font-extrabold tracking-tight text-black/90">
                  Share this story
                </div>
                <div className="text-xs text-black/55">Help others find it</div>
              </div>
              <ShareBar url={canonicalUrl} title={article.title} variant="inline" />
            </div>
          </article>

          {/* Sidebar: ads + related */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="rounded-3xl bg-white/70 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Advertisement
              </div>
              <div className="mt-3 space-y-4">
                <AdSlot ad={DEMO_ADS[2]} />
                <AdSlot ad={DEMO_ADS[0]} variant="banner" />
              </div>
            </div>

            <div className="rounded-3xl bg-white/70 p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold tracking-tight text-black/90">
                  More in {article.section}
                </div>
                <Link
                  href={`/section/${article.section}`}
                  className="text-sm font-semibold text-black/70 hover:text-black hover:underline"
                >
                  View all
                </Link>
              </div>

              {related.length ? (
                <ol className="mt-3 space-y-3">
                  {related.map((a, idx) => (
                    <li key={a.slug} className="flex gap-3">
                      <div className="w-7 shrink-0 text-sm font-extrabold text-black/25 tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </div>
                      <Link
                        href={`/article/${a.slug}`}
                        className="text-sm font-semibold leading-snug text-black/85 hover:underline"
                      >
                        {a.title}
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mt-3 text-sm text-black/60">
                  No related stories yet. Publish more articles under this section in Wagtail.
                </div>
              )}
            </div>

            {/* Sticky sidebar ad on desktop */}
            <div className="hidden lg:block sticky top-24">
              <div className="rounded-3xl bg-white/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                  Sponsored
                </div>
                <div className="mt-3">
                  <AdSlot ad={DEMO_ADS[1]} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
