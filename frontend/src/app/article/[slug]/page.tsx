import { apiGet } from "@/lib/api";

type HomeResponse = {
  featured: Array<any>;
  latest: Array<any>;
};

export default async function HomePage() {
  const data = await apiGet<HomeResponse>("/api/v1/home/");

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">News Portal</h1>
        <p className="opacity-70">Featured + latest stories</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Featured</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.featured.map((a: any) => (
            <a key={a.slug} href={`/article/${a.slug}`} className="rounded-2xl border p-4 hover:shadow-sm">
              <div className="text-sm opacity-70">{a.section}</div>
              <div className="text-lg font-semibold">{a.title}</div>
              {a.subtitle ? <div className="opacity-80">{a.subtitle}</div> : null}
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Latest</h2>
        <div className="space-y-3">
          {data.latest.map((a: any) => (
            <a key={a.slug} href={`/article/${a.slug}`} className="block rounded-2xl border p-4 hover:shadow-sm">
              <div className="text-sm opacity-70">{a.section}</div>
              <div className="text-lg font-semibold">{a.title}</div>
              {a.excerpt ? <div className="opacity-80">{a.excerpt}</div> : null}
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
