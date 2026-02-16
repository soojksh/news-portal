export type DemoAd = {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  href: string;
  badge?: string; // e.g. "Sponsored"
};

export const DEMO_ADS: DemoAd[] = [
  {
    id: "ad-1",
    title: "Hamro Menu — Fresh food delivered",
    subtitle: "Order now, get 20% off today",
    image_url:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
    href: "https://example.com/hamro-menu",
    badge: "Sponsored",
  },
  {
    id: "ad-2",
    title: "NepalWire Jobs — Hire faster",
    subtitle: "Post jobs and reach real candidates",
    image_url:
      "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1400&q=80",
    href: "https://example.com/jobs",
    badge: "Ad",
  },
  {
    id: "ad-3",
    title: "Business Toolkit — Growth templates",
    subtitle: "Free calculators, pitch decks, and KPI sheets",
    image_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80",
    href: "https://example.com/toolkit",
    badge: "Sponsored",
  },
];
