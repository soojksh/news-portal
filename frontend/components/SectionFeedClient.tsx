"use client";

import React, { useMemo, useState } from "react";
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

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function absoluteNextUrl(next: string) {
  // Backend "next" might be absolute already; handle both.
  if (next.startsWith("http://") || next.startsWith("https://")) return next;
  return `${API_BASE}${next}`;
}

/**
 * Skeleton cards:
 * - Keeps layout stable while loading
 * - Mimics your ArticleCard proportions (headline + image + excerpt)
 */
function FeedSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white/70 p-5 ring-1 ring-black/5"
        >
          <div className="animate-pulse space-y-4">
            <div className="h-3 w-20 rounded bg-black/10" />
            <div className="h-5 w-5/6 rounded bg-black/10" />
            <div className="h-4 w-4/6 rounded bg-black/10" />
            <div className="h-40 w-full rounded-xl bg-black/10" />
            <div className="h-3 w-full rounded bg-black/10" />
            <div className="h-3 w-11/12 rounded bg-black/10" />
            <div className="h-3 w-9/12 rounded bg-black/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SectionFeedClient({ initial }: { initial: SectionFeed }) {
  const [items, setItems] = useState<ArticleCardType[]>(initial.results || []);
  const [next, setNext] = useState<string | null>(initial.next);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Keep “Load more” UX consistent
  const canLoadMore = Boolean(next) && !loading;

  // Small status text (useful and “newsroom-ish”)
  const statusText = useMemo(() => {
    if (loading) return "Fetching more stories…";
    if (!next) return "You’ve reached the end of this section.";
    return `Showing ${items.length} stories`;
  }, [items.length, loading, next]);

  async function loadMore() {
    if (!next || loading) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(absoluteNextUrl(next), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: SectionFeed = await res.json();

      setItems((prev) => {
        // Deduplicate by slug (safe even if cursor overlaps)
        const seen = new Set(prev.map((p) => p.slug));
        const merged = [...prev];
        for (const a of data.results || []) {
          if (!seen.has(a.slug)) merged.push(a);
        }
        return merged;
      });

      setNext(data.next);
    } catch (e: any) {
      setError(e?.message || "Failed to load more");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Articles grid (responsive) */}
      <div className="grid gap-5 sm:grid-cols-2">
        {items.map((a) => (
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

      {/* Loading skeletons appear AFTER current content (good perceived performance) */}
      {loading ? <FeedSkeleton count={4} /> : null}

      {/* Error state (friendly + actionable) */}
      {error ? (
        <div className="rounded-2xl bg-white/70 p-4 ring-1 ring-red-500/20">
          <div className="text-sm font-semibold text-red-700">
            Couldn’t load more stories
          </div>
          <div className="mt-1 text-sm text-black/60">
            {error}. Please try again.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={loadMore}
              className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 transition"
            >
              Retry
            </button>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded-2xl bg-black/[0.05] px-4 py-2 text-sm font-semibold text-black/80 hover:bg-black/[0.08] transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        <div className="text-xs text-black/55">{statusText}</div>

        {next ? (
          <button
            type="button"
            onClick={loadMore}
            disabled={!canLoadMore}
            className={cn(
              "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-extrabold transition",
              "bg-black text-white hover:bg-black/90",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Loading…
              </>
            ) : (
              <>
                Load more
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-90 transition group-hover:translate-y-0.5"
                >
                  <path
                    d="M12 5v14m0 0 6-6m-6 6-6-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        ) : (
          <div className="rounded-2xl bg-white/70 px-4 py-3 text-sm text-black/60 ring-1 ring-black/5">
            No more articles.
          </div>
        )}
      </div>
    </div>
  );
}
