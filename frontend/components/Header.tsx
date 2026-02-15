import Link from "next/link";

const NAV = [
  { label: "Politics", href: "/section/politics" },
  { label: "Business", href: "/section/business" },
  { label: "Sports", href: "/section/sports" },
];

export function Header() {
  return (
    <header className="border-b bg-white/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 p-4">
        <Link href="/" className="font-bold tracking-tight text-lg">
          News Portal
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="opacity-80 hover:opacity-100 hover:underline"
            >
              {n.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
