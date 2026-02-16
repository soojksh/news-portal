import Link from "next/link";

const SECTIONS = [
  { label: "Politics", href: "/section/politics" },
  { label: "Business", href: "/section/business" },
  { label: "Sports", href: "/section/sports" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold">About</div>
            <p className="text-sm text-black/70 leading-relaxed">
              A modern, fast news portal built with a headless CMS + React for a
              clean editorial workflow and excellent performance.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Sections</div>
            <ul className="space-y-1 text-sm text-black/75">
              {SECTIONS.map((s) => (
                <li key={s.href}>
                  <Link className="hover:text-black hover:underline" href={s.href}>
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold">Contact</div>
            <div className="text-sm text-black/70">
              <div>newsroom@yourdomain.com</div>
              <div className="mt-2 flex gap-3">
                <a className="hover:underline" href="#">
                  Facebook
                </a>
                <a className="hover:underline" href="#">
                  X
                </a>
                <a className="hover:underline" href="#">
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t pt-6 text-xs text-black/60 md:flex-row md:items-center md:justify-between">
          <div>© {year} The Nepal Wire. All rights reserved.</div>
          <div className="flex gap-4">
            <Link className="hover:underline" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:underline" href="/terms">
              Terms
            </Link>
            <Link className="hover:underline" href="/about">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
