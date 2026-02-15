"use client";

import { useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";

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

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

function absoluteNextUrl(next: string) {
  // backend "next" might be absolute already; handle both
  if (next.startsWith("http://") || next.startsWith("https://")) return next;
  return `${API_BASE}${next}`;
}

export function SectionFeedClient({
  initial,
}: {
  initial: SectionFeed;
}) {
  const [items, setItems] = useState<ArticleCardType[]>(initial.results || []);
  const [next, setNext] = useState<string | null>(initial.next);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  async function loadMore() {
    if (!next || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(absoluteNextUrl(next), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: SectionFeed = await res.json();
      setItems((prev) => [...prev, ...(data.results || [])]);
      setNext(data.next);
    } catch (e: any) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {items.map((a) => (
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

      {/* Controls */}
      <div className="flex items-center justify-center">
        {next ? (
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border px-5 py-2 text-sm hover:bg-black hover:text-white transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load more"}
          </button>
        ) : (
          <div className="text-sm opacity-60">No more articles.</div>
        )}
      </div>

      {error ? (
        <div className="text-sm text-red-600 text-center">{error}</div>
      ) : null}
    </div>
  );
}
