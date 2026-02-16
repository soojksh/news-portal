import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { Footer } from "@/components/Footer";

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

function FeaturedBlock({ featured }: { featured: ArticleCardType[] }) {
  if (!featured?.length) return null;

  const [hero, ...rest] = featured;

  return (
    <section className="space-y-4">
      <SectionHeading title="Featured" subtitle="Curated by editors" />

      <div className="grid gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ArticleCard {...hero} variant="hero" />
        </div>

        <div className="lg:col-span-5 space-y-3">
          <div className="rounded-3xl border bg-white/70 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-extrabold tracking-tight text-black/90">
                Top stories
              </div>
              <div className="text-xs text-black/55">Editor picks</div>
            </div>

            <div className="grid gap-3">
              {rest.slice(0, 4).map((a) => (
                <ArticleCard key={a.slug} {...a} variant="compact" />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl border bg-white/70 shadow-sm">
            <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />
            <div className="p-4">
              <div className="text-sm font-semibold text-black/85">
                Tip: Add more featured articles in Wagtail CMS
              </div>
              <div className="mt-1 text-sm text-black/60">
                This block is designed to scale as your editors curate content.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const data = await apiGet<HomeResponse>("/api/v1/home/");

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-10">
        {/* Featured */}
        <FeaturedBlock featured={data.featured} />

        {/* Latest + Trending */}
        <section className="grid gap-8 lg:grid-cols-12">
          {/* Latest */}
          <div className="lg:col-span-8 space-y-4">
            <SectionHeading title="Latest" subtitle="Fresh updates" />

            <div className="grid gap-5 sm:grid-cols-2">
              {data.latest.map((a) => (
                <ArticleCard key={a.slug} {...a} variant="default" />
              ))}
            </div>
          </div>

          {/* Trending */}
          <aside className="lg:col-span-4 space-y-4">
            <SectionHeading title="Trending" subtitle="What people read most" />

            <div className="rounded-3xl border bg-white/70 p-4 shadow-sm">
              <ol className="space-y-3">
                {data.latest.slice(0, 6).map((a, idx) => (
                  <li key={a.slug} className="flex gap-3">
                    <div className="w-7 shrink-0 text-sm font-extrabold text-black/30 tabular-nums">
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

              <div className="mt-4 rounded-2xl border bg-black/[0.02] p-3 text-xs text-black/60">
                We’ll power Trending later using analytics/views. For now it’s a
                clean MVP placeholder.
              </div>
            </div>
          </aside>
        </section>

        {/* Section shortcuts */}
        <section className="rounded-3xl border bg-white/70 p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <Link
              href="/section/politics"
              className="rounded-2xl border bg-gradient-to-b from-white to-black/[0.02] p-4 hover:to-black/[0.05] transition"
            >
              <div className="text-sm font-extrabold">Politics</div>
              <div className="mt-1 text-sm text-black/60">
                Government • Policy • Elections
              </div>
            </Link>

            <Link
              href="/section/business"
              className="rounded-2xl border bg-gradient-to-b from-white to-black/[0.02] p-4 hover:to-black/[0.05] transition"
            >
              <div className="text-sm font-extrabold">Business</div>
              <div className="mt-1 text-sm text-black/60">
                Markets • Economy • Startups
              </div>
            </Link>

            <Link
              href="/section/sports"
              className="rounded-2xl border bg-gradient-to-b from-white to-black/[0.02] p-4 hover:to-black/[0.05] transition"
            >
              <div className="text-sm font-extrabold">Sports</div>
              <div className="mt-1 text-sm text-black/60">
                Football • Cricket • Highlights
              </div>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
