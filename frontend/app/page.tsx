import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";
import { Carousel, CarouselItem } from "@/components/Carousel";
import { DEMO_ARTICLES } from "@/lib/demoNews";
import { DEMO_ADS } from "@/lib/demoAds";
import { AdSlot } from "@/components/AdSlot";
import { NewsletterCard } from "@/components/NewsletterCard";

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

type HomeResponse = {
  featured: ArticleCardType[];
  latest: ArticleCardType[];
};

function SectionHeading({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-black/90 sm:text-2xl">
          {title}
        </h2>
        {subtitle ? (
          <div className="mt-1 text-sm text-black/60">{subtitle}</div>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="text-sm font-semibold text-black/70 hover:text-black hover:underline"
        >
          View all
        </Link>
      ) : null}
    </div>
  );
}

/**
 * Deduplicates by slug.
 * Rationale: when blending API data + demo data, duplicates can occur.
 * Complexity: O(n) time, O(n) memory via Set for stable order.
 */
function uniqBySlug<T extends { slug: string }>(arr: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const a of arr) {
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    out.push(a);
  }
  return out;
}

/**
 * Picks up to `max` articles from a section.
 * We normalize section slug to lower-case for robust matching.
 */
function pickSection(all: ArticleCardType[], section: string, max = 6) {
  return all.filter((a) => (a.section || "").toLowerCase() === section).slice(0, max);
}

function SpotlightGrid({
  title,
  section,
  articles,
}: {
  title: string;
  section: string;
  articles: ArticleCardType[];
}) {
  if (!articles.length) return null;

  // Lead article rendered larger to create a “visual hierarchy” (F-pattern scanning).
  const [lead, ...rest] = articles;

  return (
    <section className="space-y-4">
      <SectionHeading title={title} subtitle="Highlights" href={`/section/${section}`} />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ArticleCard {...lead} variant="hero" />
        </div>

        <div className="lg:col-span-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {rest.slice(0, 4).map((a) => (
            <ArticleCard key={a.slug} {...a} variant="compact" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const data = await apiGet<HomeResponse>("/api/v1/home/");

  const blendedLatest = uniqBySlug([...(data.latest ?? []), ...DEMO_ARTICLES]);
  const blendedFeatured = uniqBySlug([...(data.featured ?? []), ...DEMO_ARTICLES.slice(0, 4)]);

  const SECTIONS = [
    { key: "politics", title: "Politics Spotlight" },
    { key: "business", title: "Business Spotlight" },
    { key: "sports", title: "Sports Spotlight" },
  ] as const;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-12">
        {/* HERO FEATURED */}
        {blendedFeatured.length ? (
          <section className="space-y-4">
            <SectionHeading title="Top Stories" subtitle="Curated + live feed blend" />

            <div className="grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <ArticleCard {...blendedFeatured[0]} variant="hero" />

                {/* Banner ad below hero: balances vertical rhythm in the left column */}
                <div className="mt-4">
                  <AdSlot ad={DEMO_ADS[0]} variant="banner" />
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold tracking-tight text-black/90">
                      Editor picks
                    </div>
                    <div className="text-xs text-black/55">Swipe</div>
                  </div>

                  <div className="mt-3">
                    <Carousel>
                      {blendedFeatured.slice(1, 8).map((a) => (
                        <CarouselItem key={a.slug} className="w-[260px] sm:w-[320px]">
                          <ArticleCard {...a} variant="default" />
                        </CarouselItem>
                      ))}
                    </Carousel>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* LATEST + TRENDING + ADS */}
        <section className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-4">
            <SectionHeading title="Latest" subtitle="Fresh updates (real + demo blend)" />

            <div className="grid gap-5 sm:grid-cols-2">
              {blendedLatest.slice(0, 8).map((a) => (
                <ArticleCard key={a.slug} {...a} variant="default" />
              ))}
            </div>

            {/* Mobile-only ad to avoid empty vertical rhythm on small screens */}
            <div className="lg:hidden">
              <AdSlot ad={DEMO_ADS[1]} variant="banner" />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <SectionHeading title="Trending" subtitle="MVP list (analytics later)" />

            <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
              <ol className="space-y-3">
                {blendedLatest.slice(0, 7).map((a, idx) => (
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

              <div className="mt-4 text-xs text-black/60">
                Next: connect this to real views/analytics from backend.
              </div>
            </div>

            {/* Ads stack fills sidebar height and prevents “dead space” */}
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                Advertisement
              </div>

              <AdSlot ad={DEMO_ADS[1]} />
              <AdSlot ad={DEMO_ADS[2]} />

              <div className="hidden lg:block">
                <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                    Sponsored
                  </div>
                  <div className="mt-3">
                    <AdSlot ad={DEMO_ADS[0]} variant="banner" />
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="rounded-3xl bg-white/70 p-4 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wide text-black/50">
                    Sponsored
                  </div>
                  <div className="mt-3">
                    <AdSlot ad={DEMO_ADS[2]} />
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </section>

        {/* SECTION SPOTLIGHTS + (Ad after 2 spotlights) */}
        {SECTIONS.map((s, idx) => {
          const items = pickSection(blendedLatest, s.key, 6);

          return (
            <div key={s.key} className="space-y-12">
              <SpotlightGrid title={s.title} section={s.key} articles={items} />

              {/* After 2 spotlights (index 1), insert an ad slot */}
              {idx === 1 ? (
                <div className="grid gap-4 lg:grid-cols-12">
                  <div className="lg:col-span-12">
                    <AdSlot ad={DEMO_ADS[2]} variant="banner" />
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}

        {/*Newsletter    */}
        <NewsletterCard />

        {/* DISCOVER CAROUSEL */}
        <section className="space-y-4">
          <SectionHeading title="Discover" subtitle="Swipe to browse quickly" />

          <Carousel>
            {blendedLatest.slice(0, 14).map((a) => (
              <CarouselItem key={a.slug} className="w-[260px] sm:w-[340px]">
                <ArticleCard {...a} variant="default" />
              </CarouselItem>
            ))}
          </Carousel>
        </section>
      </main>

      <Footer />
    </div>
  );
}
