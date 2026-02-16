import Link from "next/link";
import type { DemoAd } from "@/lib/demoAds";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function AdSlot({
  ad,
  className,
  variant = "card",
}: {
  ad: DemoAd;
  className?: string;
  variant?: "card" | "banner";
}) {
  if (variant === "banner") {
    return (
      <Link
        href={ad.href}
        className={cn(
          "group block overflow-hidden rounded-3xl bg-white/80 shadow-sm transition hover:shadow-md",
          className
        )}
        target="_blank"
        rel="noreferrer"
      >
        <div className="relative">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="h-28 w-full object-cover sm:h-32"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />

          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">
            {ad.badge ?? "Ad"}
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <div className="text-sm font-extrabold text-white group-hover:underline line-clamp-1">
              {ad.title}
            </div>
            {ad.subtitle ? (
              <div className="mt-0.5 text-xs text-white/85 line-clamp-1">
                {ad.subtitle}
              </div>
            ) : null}
          </div>
        </div>
      </Link>
    );
  }

  // card
  return (
    <Link
      href={ad.href}
      className={cn(
        "group block overflow-hidden rounded-3xl bg-white/80 shadow-sm transition hover:shadow-md",
        className
      )}
      target="_blank"
      rel="noreferrer"
    >
      <div className="relative">
        <img
          src={ad.image_url}
          alt={ad.title}
          className="h-44 w-full object-cover"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-black">
          {ad.badge ?? "Ad"}
        </div>
      </div>

      <div className="p-4">
        <div className="text-sm font-extrabold text-black/90 group-hover:underline line-clamp-2">
          {ad.title}
        </div>
        {ad.subtitle ? (
          <div className="mt-1 text-sm text-black/60 line-clamp-2">
            {ad.subtitle}
          </div>
        ) : null}

        <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-black/70">
          <span className="h-2 w-2 rounded-full bg-red-600" />
          Sponsored content
        </div>
      </div>
    </Link>
  );
}
