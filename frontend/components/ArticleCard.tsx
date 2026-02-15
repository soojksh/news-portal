type ArticleCardProps = {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  section?: string;
  hero_image_url?: string;
  label?: string;
};

export function ArticleCard({
  title,
  slug,
  subtitle,
  excerpt,
  section,
  hero_image_url,
  label,
}: ArticleCardProps) {
  return (
    <a
      href={`/article/${slug}`}
      className="group block rounded-2xl border bg-white/50 p-5 transition hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          {section ? (
            <div className="text-xs uppercase tracking-wide opacity-60">
              {section}
            </div>
          ) : null}

          <div className="mt-1 text-lg font-semibold leading-snug group-hover:underline">
            {title}
          </div>

          {subtitle ? (
            <div className="mt-1 text-sm opacity-80 line-clamp-2">
              {subtitle}
            </div>
          ) : null}
        </div>

        {label ? (
          <div className="shrink-0 rounded-full border px-3 py-1 text-xs opacity-80">
            {label}
          </div>
        ) : null}
      </div>

      {hero_image_url ? (
        <div className="mt-4 overflow-hidden rounded-xl border">
          <img
            src={hero_image_url}
            alt={title}
            className="h-44 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      {excerpt ? (
        <div className="mt-3 text-sm opacity-75 line-clamp-3">{excerpt}</div>
      ) : null}
    </a>
  );
}
