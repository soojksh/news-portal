"use client";

import React, { useRef } from "react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function Carousel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => scrollBy(-1)}
        aria-label="Scroll left"
        className={cn(
          "absolute left-0 top-1/2 z-10 -translate-y-1/2",
          "hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full",
          "bg-white/90 shadow-md hover:bg-white transition"
        )}
      >
        <span className="text-xl leading-none">‹</span>
      </button>

      <div
        ref={ref}
        className={cn(
          "flex gap-4 overflow-x-auto pb-2",
          "scroll-smooth snap-x snap-mandatory",
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scrollBy(1)}
        aria-label="Scroll right"
        className={cn(
          "absolute right-0 top-1/2 z-10 -translate-y-1/2",
          "hidden md:inline-flex h-10 w-10 items-center justify-center rounded-full",
          "bg-white/90 shadow-md hover:bg-white transition"
        )}
      >
        <span className="text-xl leading-none">›</span>
      </button>
    </div>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("snap-start shrink-0", className)}>
      {children}
    </div>
  );
}
