import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionFeedClient } from "@/components/SectionFeedClient";
import { AdSlot } from "@/components/AdSlot";
import { DEMO_ADS } from "@/lib/demoAds";

type ArticleCardType = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  first_published_at: string | null;
  section: string;
  hero_image_url: string;
};

type SectionFeed = {
  next: string | null;
  previous: string | null;
  results: ArticleCardType[];
};

const SECTION_META: Record<
  string,
  { title: string; desc: string; chips?: string[] }
> = {
  politics: {
    title: "Politics",
    desc: "Government, policy, elections, and national affairs.",
    chips: ["Policy", "Parliament", "Elections"],
  },
  business: {
    title: "Business",
    desc: "Markets, economy, startups, and industry updates.",
    chips: ["Economy", "Markets", "Startups"],
  },
  sports: {
    title: "Sports",
    desc: "Match reports, analysis, highlights, and leagues.",
    chips: ["Football", "Cricket", "Highlights"],
  },
};

function prettySlug(slug: string) {
  return slug
    .split("-")
    .map((s) => (s ? s[0].toUpperCase() + s.slice(1) : s))
    .join(" ");
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // SSR first page (fast + SEO)
  const initial = await apiGet<SectionFeed>(`/api/v1/sections/${slug}/`);

  const meta = SECTION_META[slug] ?? {
    title: prettySlug(slug),
    desc: `Latest stories from ${prettySlug(slug)}.`,
    chips: [],
  };

  // “Top Stories” = first few cards
  const top = initial.results?.slice(0, 6) ?? [];
  // “Most read” (MVP) = reuse top, later wire to analytics
  const mostRead = initial.results?.slice(0, 8) ?? [];

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-8">
        {/* Breadcrumb + Section hero */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-black/60">
            <Link href="/" className="hover:text-black hover:underline">
              Home
            </Link>
            <span className="text-black/30">/</span>
            <span className="font-semibold text-black/80">{meta.title}</span>
          </div>

          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-black/90 sm:text-4xl">
                  {meta.title}
                </h1>
                <p className="max-w-2xl text-sm leading-relaxed text-black/60 sm:text-base">
                  {meta.desc}
                </p>

                {meta.chips?.length ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {meta.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-black/70"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Top banner ad placement (common on section pages) */}
              <div className="w-full md:max-w-sm">
                <AdSlot ad={DEMO_ADS[0]} variant="banner" />
              </div>
            </div>
          </div>
        </section>

        {/* Main layout: feed + sidebar */}
        <section className="grid gap-10 lg:grid-cols-12">
          {/* Left: Top stories + infinite/load-more feed */}
          <div className="lg:col-span-8 space-y-8">
            {/* Top Stories grid */}
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-xl font-extrabold tracking-tight text-black/90 sm:text-2xl">
                  Top stories
                </h2>
                <div className="text-xs font-semibold text-black/50">
                  Updated continuously
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {top.map((a) => (
                  <ArticleCard
                    key={a.slug}
                    title={a.title}
                    slug={a.slug}
                    subtitle={a.subtitle}
                    excerpt={a.excerpt}
                    section={a.section}
                    hero_image_url={a.hero_image_url}
                    variant="default"
                  />
                ))}
              </div>
            </section>

            {/* Mid-feed ad (good “scientific” placement: after initial grid) */}
            <AdSlot ad={DEMO_ADS[2]} variant="banner" />

            {/* Cursor pagination feed (Load More) */}
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-lg font-extrabold tracking-tight text-black/90 sm:text-xl">
                  Latest in {meta.title}
                </h2>
                <div className="text-xs text-black/50">
                  Load more for older stories
                </div>
              </div>

              <SectionFeedClient initial={initial} />
            </section>
          </div>

          {/* Right: Most read + ads (sticky stack on desktop) */}
          <aside className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl bg-white/70 p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold tracking-tight text-black/90">
                  Most read
                </h3>
                <div className="text-[11px] text-black/50">
                  (MVP — analytics later)
                </div>
              </div>

              <ol className="mt-3 space-y-3">
                {mostRead.map((a, idx) => (
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
            </div>

            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Advertisement
              </div>
              <AdSlot ad={DEMO_ADS[1]} />
              <AdSlot ad={DEMO_ADS[2]} />
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
