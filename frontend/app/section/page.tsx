import { apiGet } from "@/lib/api";
import Link from "next/link";

type ArticleCard = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  first_published_at: string;
  section: string;
  hero_image_url: string;
};

type SectionFeed = {
  next: string | null;
  previous: string | null;
  results: ArticleCard[];
};

export default async function SectionPage({ params }: { params: { slug: string } }) {
  const data = await apiGet<SectionFeed>(`/api/v1/sections/${params.slug}/`);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <Link href="/" className="text-sm opacity-70 hover:underline">← Home</Link>
      <h1 className="text-3xl font-bold capitalize">{params.slug}</h1>

      <div className="space-y-4">
        {data.results.map((a) => (
          <a key={a.slug} href={`/article/${a.slug}`} className="block rounded-2xl border p-5 hover:shadow-sm transition">
            <div className="text-xs uppercase tracking-wide opacity-60">{a.section}</div>
            <div className="text-lg font-semibold">{a.title}</div>
            {a.subtitle ? <div className="mt-1 opacity-80">{a.subtitle}</div> : null}
            {a.excerpt ? <div className="mt-2 text-sm opacity-75 line-clamp-3">{a.excerpt}</div> : null}
          </a>
        ))}
      </div>
    </main>
  );
}
