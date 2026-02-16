import Link from "next/link";

type Variant = "default" | "hero" | "compact";

type ArticleCardProps = {
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  section?: string;
  hero_image_url?: string;
  label?: string;
  variant?: Variant;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function ArticleCard({
  title,
  slug,
  subtitle,
  excerpt,
  section,
  hero_image_url,
  label,
  variant = "default",
}: ArticleCardProps) {
  // Compact: no image, tight spacing, list-like
  if (variant === "compact") {
    return (
      <Link
        href={`/article/${slug}`}
        className="group block rounded-2xl border bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {section ? (
              <div className="text-[11px] uppercase tracking-wide text-black/55">
                {section}
              </div>
            ) : null}

            <div className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-black/90 group-hover:underline">
              {title}
            </div>

            {subtitle ? (
              <div className="mt-1 line-clamp-1 text-xs text-black/65">
                {subtitle}
              </div>
            ) : null}
          </div>

          {label ? (
            <div className="shrink-0 rounded-full border bg-white px-2.5 py-1 text-[11px] font-semibold text-black/70">
              {label}
            </div>
          ) : null}
        </div>
      </Link>
    );
  }

  // Hero: bigger, image-first when available
  if (variant === "hero") {
    return (
      <Link
        href={`/article/${slug}`}
        className="group block overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md"
      >
        {hero_image_url ? (
          <div className="relative">
            <img
              src={hero_image_url}
              alt={title}
              className="h-64 w-full object-cover sm:h-72"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2">
              {section ? (
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-black">
                  {section}
                </span>
              ) : null}
              {label ? (
                <span className="rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold text-white">
                  {label}
                </span>
              ) : null}
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-xl font-extrabold leading-tight text-white group-hover:underline sm:text-2xl">
                {title}
              </div>
              {subtitle ? (
                <div className="mt-1 line-clamp-2 text-sm text-white/85">
                  {subtitle}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {section ? (
              <div className="text-[11px] uppercase tracking-wide text-black/55">
                {section}
              </div>
            ) : null}
            <div className="mt-2 text-2xl font-extrabold leading-tight text-black/90 group-hover:underline">
              {title}
            </div>
            {subtitle ? (
              <div className="mt-2 text-sm text-black/65 line-clamp-3">
                {subtitle}
              </div>
            ) : null}
            {excerpt ? (
              <div className="mt-3 text-sm text-black/60 line-clamp-3">
                {excerpt}
              </div>
            ) : null}
          </div>
        )}

        {/* If hero has no image, still show excerpt */}
        {!hero_image_url && excerpt ? (
          <div className="px-6 pb-6">
            <div className="text-sm text-black/60 line-clamp-3">{excerpt}</div>
          </div>
        ) : null}
      </Link>
    );
  }

  // Default: grid card
  return (
    <Link
      href={`/article/${slug}`}
      className={cn(
        "group block rounded-3xl border bg-white/70 p-5 shadow-sm transition",
        "hover:bg-white hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {section ? (
            <div className="text-[11px] uppercase tracking-wide text-black/55">
              {section}
            </div>
          ) : null}

          <div className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-black/90 group-hover:underline">
            {title}
          </div>

          {subtitle ? (
            <div className="mt-1 line-clamp-2 text-sm text-black/65">
              {subtitle}
            </div>
          ) : null}
        </div>

        {label ? (
          <div className="shrink-0 rounded-full border bg-white px-3 py-1 text-[11px] font-semibold text-black/70">
            {label}
          </div>
        ) : null}
      </div>

      {hero_image_url ? (
        <div className="mt-4 overflow-hidden rounded-2xl border bg-black/[0.02]">
          <img
            src={hero_image_url}
            alt={title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      {excerpt ? (
        <div className="mt-3 text-sm text-black/60 line-clamp-3">{excerpt}</div>
      ) : null}
    </Link>
  );
}
