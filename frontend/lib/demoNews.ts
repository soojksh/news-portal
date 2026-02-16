export type DemoArticle = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  first_published_at: string;
  section: string;
  hero_image_url: string;
  label?: string;
};

const now = new Date();
const isoMinus = (mins: number) => new Date(now.getTime() - mins * 60_000).toISOString();

export const DEMO_ARTICLES: DemoArticle[] = [
  // Politics
  {
    title: "Parliament debate heats up over budget transparency",
    slug: "demo-parliament-budget-transparency",
    subtitle: "Opposition demands itemized breakdown and stronger oversight.",
    excerpt: "A tense session in parliament focused on budget transparency and procurement reforms.",
    first_published_at: isoMinus(50),
    section: "politics",
    hero_image_url: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=1400&q=80",
    label: "Explainer",
  },
  {
    title: "Local elections: what changed after the new guidelines?",
    slug: "demo-local-elections-guidelines",
    subtitle: "A quick breakdown of the updated election rules.",
    excerpt: "The new guidelines aim to reduce violations and improve reporting and auditing.",
    first_published_at: isoMinus(120),
    section: "politics",
    hero_image_url: "https://images.unsplash.com/photo-1520975693411-1af0d7f23e55?auto=format&fit=crop&w=1400&q=80",
  },

  // Business
  {
    title: "Remittance inflow steadies as seasonal hiring picks up",
    slug: "demo-remittance-seasonal-hiring",
    subtitle: "Analysts say stability could support imports and household spending.",
    excerpt: "Remittance trends remain strong despite volatility in global job markets.",
    first_published_at: isoMinus(80),
    section: "business",
    hero_image_url: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=80",
    label: "Markets",
  },
  {
    title: "Startups: the rise of micro-logistics in Kathmandu valley",
    slug: "demo-micro-logistics-kathmandu",
    subtitle: "Same-day delivery models are changing how local commerce works.",
    excerpt: "Micro-warehouses and route optimization are enabling faster deliveries at lower costs.",
    first_published_at: isoMinus(260),
    section: "business",
    hero_image_url: "https://images.unsplash.com/photo-1521791055366-0d553872125f?auto=format&fit=crop&w=1400&q=80",
  },

  // Sports
  {
    title: "National team announces squad for the next qualifiers",
    slug: "demo-squad-qualifiers",
    subtitle: "A mix of experienced names and new talent makes the list.",
    excerpt: "Coaches emphasize fitness and pressing intensity ahead of tough fixtures.",
    first_published_at: isoMinus(40),
    section: "sports",
    hero_image_url: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=1400&q=80",
    label: "Breaking",
  },
  {
    title: "Weekend football: 5 key moments you missed",
    slug: "demo-weekend-football-moments",
    subtitle: "From last-minute winners to tactical surprises.",
    excerpt: "A quick recap of the weekend’s biggest talking points.",
    first_published_at: isoMinus(190),
    section: "sports",
    hero_image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1400&q=80",
  },

  // World / Tech (extra sections for grid variety)
  {
    title: "AI tools in newsrooms: speed vs verification",
    slug: "demo-ai-newsroom-speed-vs-verification",
    subtitle: "Editors outline what they automate and what they refuse to automate.",
    excerpt: "Newsrooms are experimenting with AI for summaries, transcripts, and moderation—carefully.",
    first_published_at: isoMinus(140),
    section: "tech",
    hero_image_url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1400&q=80",
    label: "Tech",
  },
  {
    title: "Regional trade: new corridors and their hidden costs",
    slug: "demo-regional-trade-corridors",
    subtitle: "Bigger routes, bigger opportunities—but also bigger complexity.",
    excerpt: "Trade corridors unlock access but require harmonized policies and better infrastructure.",
    first_published_at: isoMinus(310),
    section: "world",
    hero_image_url: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=80",
    label: "Analysis",
  },
];
