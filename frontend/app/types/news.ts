export type ArticleCardDTO = {
  title: string;
  slug: string;
  subtitle: string;
  excerpt: string;
  first_published_at: string;
  section: string;
  hero_image_url: string;
};

export type HomeDTO = {
  featured: Array<ArticleCardDTO & { label?: string }>;
  latest: ArticleCardDTO[];
};
