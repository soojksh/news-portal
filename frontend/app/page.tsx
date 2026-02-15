import { apiGet } from "@/lib/api";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";

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

export default async function HomePage() {
  const data = await apiGet<HomeResponse>("/api/v1/home/");

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="mx-auto max-w-6xl p-6 space-y-10">
        {/* Featured */}
        {data.featured?.length ? (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Featured</h2>
              <div className="text-sm opacity-70">Curated by editors</div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {data.featured.map((a) => (
                <ArticleCard
                  key={a.slug}
                  title={a.title}
                  slug={a.slug}
                  subtitle={a.subtitle}
                  excerpt={a.excerpt}
                  section={a.section}
                  hero_image_url={a.hero_image_url}
                  label={a.label}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Latest + Trending */}
        <section className="grid gap-8 lg:grid-cols-3">
          {/* Latest */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">Latest</h2>
              <div className="text-sm opacity-70">Fresh updates</div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {data.latest.map((a) => (
                <ArticleCard
                  key={a.slug}
                  title={a.title}
                  slug={a.slug}
                  subtitle={a.subtitle}
                  excerpt={a.excerpt}
                  section={a.section}
                  hero_image_url={a.hero_image_url}
                />
              ))}
            </div>
          </div>

          {/* Trending (simple MVP placeholder) */}
          <aside className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Trending</h2>

            <div className="rounded-2xl border bg-white p-4">
              <div className="text-sm opacity-70">
                (Optional) We’ll power this later using analytics or views.
              </div>

              <ol className="mt-4 space-y-3">
                {data.latest.slice(0, 5).map((a, idx) => (
                  <li key={a.slug} className="flex gap-3">
                    <div className="w-6 text-sm font-semibold opacity-60">
                      {idx + 1}
                    </div>
                    <a
                      href={`/article/${a.slug}`}
                      className="text-sm hover:underline"
                    >
                      {a.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
