import Image from "next/image";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { StreamField } from "@/components/StreamField";

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const article = await apiGet<ArticleDetail>(`/api/v1/articles/${slug}/`);

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-6">
      <Link href="/" className="text-sm opacity-70 hover:underline">
        ← Home
      </Link>

      <header className="space-y-2">
        <div className="text-xs uppercase tracking-wide opacity-60">{article.section}</div>
        <h1 className="text-3xl font-bold leading-tight">{article.title}</h1>
        {article.subtitle ? <p className="text-lg opacity-80">{article.subtitle}</p> : null}
      </header>

      {article.hero_image_url ? (
        <Image src={article.hero_image_url} alt={article.title} className="w-full rounded-2xl border" width={800} height={400} />
      ) : null}

      <StreamField blocks={article.body} />
    </main>
  );
}
