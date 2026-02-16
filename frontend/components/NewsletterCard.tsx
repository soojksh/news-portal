"use client";

import { useState } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function NewsletterCard({
  className,
}: {
  className?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // MVP: UI-only (backend later)
    if (!email.trim()) return;
    setStatus("ok");
    setEmail("");
  };

  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl bg-white/80 shadow-sm",
        className
      )}
    >
      {/* Brand accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-black/90">
              Subscribe to the Newsletter
            </div>
            <div className="mt-1 text-sm text-black/60 leading-relaxed">
              Daily top stories + weekly deep dives. No spam. Unsubscribe anytime.
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-2 text-xs font-semibold text-black/70">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            Free
          </div>
        </div>

        <form onSubmit={onSubmit} className="mt-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={cn(
                "w-full rounded-2xl bg-white px-4 py-3 text-sm shadow-sm",
                "outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20"
              )}
            />

            <button
              type="submit"
              className={cn(
                "rounded-2xl px-5 py-3 text-sm font-extrabold shadow-sm transition",
                "bg-black text-white hover:bg-black/90"
              )}
            >
              Subscribe
            </button>
          </div>

          {status === "ok" ? (
            <div className="mt-3 text-sm font-semibold text-green-700">
              ✅ Saved (UI only). Backend subscription will be connected later.
            </div>
          ) : (
            <div className="mt-3 text-xs text-black/55">
              By subscribing you agree to receive emails from us. Privacy friendly.
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
