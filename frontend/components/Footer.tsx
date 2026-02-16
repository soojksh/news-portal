import Image from "next/image";
import Link from "next/link";

const SECTIONS = [
  { label: "Politics", href: "/section/politics" },
  { label: "Business", href: "/section/business" },
  { label: "Sports", href: "/section/sports" },
];

const COMPANY = [
  { label: "About", href: "/about" },
  { label: "Advertise", href: "/advertise" },
  { label: "Contact", href: "/contact" },
  { label: "Careers", href: "/careers" },
];

const LEGAL = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Editorial Policy", href: "/editorial-policy" },
];

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

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm-5 4.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2Zm0 2A1.8 1.8 0 1 0 13.8 12 1.8 1.8 0 0 0 12 10.2ZM18 6.7a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9Z" />
    </svg>
  );
}

function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M21.6 7.2a3 3 0 0 0-2.12-2.12C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.48.48A3 3 0 0 0 2.4 7.2 31.6 31.6 0 0 0 2 12a31.6 31.6 0 0 0 .4 4.8 3 3 0 0 0 2.12 2.12C6.3 19.4 12 19.4 12 19.4s5.7 0 7.48-.48a3 3 0 0 0 2.12-2.12A31.6 31.6 0 0 0 22 12a31.6 31.6 0 0 0-.4-4.8ZM10.2 15.3V8.7L16 12l-5.8 3.3Z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-14 border-t bg-white">
      {/* Brand strip */}
      <div className="h-1 w-full bg-gradient-to-r from-yellow-400 via-red-600 to-black" />

      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Top grid */}
        <div className="grid gap-8 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/logo.jpeg"
                alt="Logo"
                width={64}
                height={64}
                className="h-12 w-auto"
                priority={false}
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-black/70">
              Independent, fast, and reader-first newsroom. Headless CMS + React for speed
              and flexibility.
            </p>

            <div className="flex items-center gap-2">
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/70 transition hover:bg-black/10 hover:text-black"
                aria-label="X"
                target="_blank"
                rel="noreferrer"
              >
                <IconX className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/70 transition hover:bg-black/10 hover:text-black"
                aria-label="Facebook"
                target="_blank"
                rel="noreferrer"
              >
                <IconFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/70 transition hover:bg-black/10 hover:text-black"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <IconInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/70 transition hover:bg-black/10 hover:text-black"
                aria-label="YouTube"
                target="_blank"
                rel="noreferrer"
              >
                <IconYouTube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/*Links  */}
          <div className="md:col-span-4">
            <div className="grid grid-cols-2 gap-6 sm:gap-8">
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wide text-black/60">
                  Sections
                </div>
                <ul className="space-y-2 text-sm">
                  {SECTIONS.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="text-black/75 hover:text-black hover:underline"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wide text-black/60">
                  Company
                </div>
                <ul className="space-y-2 text-sm">
                  {COMPANY.map((s) => (
                    <li key={s.href}>
                      <Link
                        href={s.href}
                        className="text-black/75 hover:text-black hover:underline"
                      >
                        {s.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter  */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-xs font-extrabold uppercase tracking-wide text-black/60">
              Newsletter
            </div>

            <div className="rounded-3xl bg-zinc-50 p-5 shadow-sm ring-1 ring-black/5">
              <div className="text-base font-extrabold tracking-tight text-black/85">
                Get the top stories, daily.
              </div>
              <div className="mt-1 text-sm text-black/60 leading-relaxed">
                Short, sharp updates — plus weekly deep dives.
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-2xl bg-white px-4 py-3 text-sm outline-none ring-1 ring-black/10 focus:ring-2 focus:ring-black/20"
                />
                <button
                  type="button"
                  className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white hover:bg-black/90"
                >
                  Subscribe
                </button>
              </div>

              <div className="mt-3 text-[11px] text-black/50">
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between">
          <div className="text-xs text-black/55">
            © {year} The Nepal Wire. All rights reserved.
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
            {LEGAL.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-black/60 hover:text-black hover:underline"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
