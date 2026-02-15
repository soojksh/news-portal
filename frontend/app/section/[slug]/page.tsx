import Link from "next/link";
import { apiGet } from "@/lib/api";
import { Header } from "@/components/Header";
import { SectionFeedClient } from "@/components/SectionFeedClient";

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

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // First page SSR (fast + SEO)
  const initial = await apiGet<SectionFeed>(`/api/v1/sections/${slug}/`);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />

      <main className="mx-auto max-w-4xl p-6 space-y-6">
        <div className="space-y-2">
          <Link href="/" className="text-sm opacity-70 hover:underline">
            ← Home
          </Link>
          <h1 className="text-3xl font-bold capitalize tracking-tight">
            {slug}
          </h1>
          <p className="opacity-70">
            Latest stories from <span className="font-medium capitalize">{slug}</span>
          </p>
        </div>

        <SectionFeedClient initial={initial} />
      </main>
    </div>
  );
}
