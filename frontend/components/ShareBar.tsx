"use client";

import React, { useMemo, useState } from "react";

type ShareBarProps = {
  url: string; // canonical URL
  title: string;
  className?: string;
  variant?: "inline" | "sticky";
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function buildShareUrls(url: string, title: string) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  return {
    x: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    whatsapp: `https://wa.me/?text=${t}%20${u}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
  };
}

/** Icon set matches Footer.tsx style (solid fill, same vibe). */
function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M18.9 2H22l-6.77 7.73L23.2 22h-6.4l-5.01-6.63L6.1 22H3l7.25-8.28L.8 2h6.56l4.53 6.02L18.9 2Zm-1.12 18h1.72L6.46 3.93H4.62L17.78 20Z" />
    </svg>
  );
}

function IconFacebook(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M22 12a10 10 0 1 0-11.56 9.87v-6.98H7.9V12h2.54V9.8c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56V12h2.76l-.44 2.89h-2.32v6.98A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function IconLinkedIn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.65-1.86 3.4-1.86 3.63 0 4.3 2.39 4.3 5.5v6.25ZM5.34 7.43A2.06 2.06 0 1 1 5.34 3.3a2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45Z" />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.38 0 0 5.38 0 12c0 2.12.55 4.2 1.6 6.03L0 24l6.17-1.57A11.9 11.9 0 0 0 12 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.48-8.52ZM12 21.94a9.86 9.86 0 0 1-5.03-1.38l-.36-.22-3.66.93.98-3.57-.24-.37A9.84 9.84 0 1 1 12 21.94Zm5.72-7.35c-.31-.16-1.84-.91-2.12-1.01-.29-.11-.5-.16-.71.16-.2.31-.82 1.01-1 1.22-.18.2-.37.23-.68.08-.31-.16-1.3-.48-2.48-1.52-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.48.13-.64.14-.14.31-.37.47-.55.16-.18.2-.31.31-.51.1-.2.05-.39-.03-.55-.08-.16-.71-1.72-.98-2.36-.26-.63-.52-.55-.71-.56h-.6c-.2 0-.55.08-.83.39-.29.31-1.09 1.06-1.09 2.58 0 1.52 1.11 2.99 1.27 3.2.16.2 2.18 3.33 5.29 4.67.74.32 1.32.51 1.77.65.74.24 1.41.21 1.94.13.59-.09 1.84-.75 2.1-1.47.26-.72.26-1.34.18-1.47-.08-.13-.29-.2-.6-.36Z" />
    </svg>
  );
}

export function ShareBar({ url, title, className, variant = "inline" }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const shareUrls = useMemo(() => buildShareUrls(url, title), [url, title]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }

  async function nativeShare() {
    try {
      // Mobile-friendly share sheet (if supported)
      // @ts-ignore
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title, url });
      }
    } catch {
      // ignore (user cancelled)
    }
  }

  const base = "rounded-2xl bg-white/70 backdrop-blur px-3 py-3 sm:px-4 sm:py-3";
  const stickyShell = "hidden lg:block sticky top-24 self-start w-14";

  const IconBtn = ({
    href,
    label,
    children,
  }: {
    href: string;
    label: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center rounded-xl transition",
        "bg-black/5 text-black/70 hover:bg-black/10 hover:text-black",
        variant === "sticky" ? "h-10 w-10" : "h-10 w-10"
      )}
    >
      {children}
    </a>
  );

  return (
    <div className={cn(variant === "sticky" ? stickyShell : "", className)} aria-label="Share tools">
      <div
        className={cn(
          base,
          variant === "sticky" ? "flex flex-col items-center gap-2" : "flex flex-wrap items-center gap-2 justify-between"
        )}
      >
        {variant === "inline" ? (
          <div className="text-xs font-semibold uppercase tracking-wide text-black/50">Share</div>
        ) : null}

        <div className={cn(variant === "sticky" ? "flex flex-col gap-2" : "flex items-center gap-2")}>
          {/* Copy */}
          <button
            type="button"
            onClick={copy}
            className={cn(
              "inline-flex items-center justify-center rounded-xl transition font-extrabold",
              copied ? "bg-black text-white" : "bg-black/5 text-black/70 hover:bg-black/10 hover:text-black",
              "h-10 w-10"
            )}
            title="Copy link"
            aria-label="Copy link"
          >
            {copied ? "✓" : "⧉"}
          </button>

          {/* Native share (best on mobile) */}
          {variant === "inline" ? (
            <button
              type="button"
              onClick={nativeShare}
              className="inline-flex items-center justify-center rounded-xl h-10 w-10 transition bg-black/5 text-black/70 hover:bg-black/10 hover:text-black font-extrabold"
              title="Share"
              aria-label="Share"
            >
              ↗
            </button>
          ) : null}

          <IconBtn href={shareUrls.x} label="Share on X">
            <IconX className="h-5 w-5" />
          </IconBtn>

          <IconBtn href={shareUrls.facebook} label="Share on Facebook">
            <IconFacebook className="h-5 w-5" />
          </IconBtn>

          <IconBtn href={shareUrls.whatsapp} label="Share on WhatsApp">
            <IconWhatsApp className="h-5 w-5" />
          </IconBtn>

          {variant === "inline" ? (
            <IconBtn href={shareUrls.linkedin} label="Share on LinkedIn">
              <IconLinkedIn className="h-5 w-5" />
            </IconBtn>
          ) : null}
        </div>
      </div>
    </div>
  );
}
