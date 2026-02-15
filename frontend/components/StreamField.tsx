"use client";

import DOMPurify from "dompurify";

type StreamBlock =
  | { type: "heading"; value: string; id?: string }
  | { type: "paragraph"; value: string; id?: string }
  | { type: "pullquote"; value: { quote: string; attribution?: string }; id?: string }
  | { type: "image"; value: { url: string; alt?: string }; id?: string }
  | { type: string; value: any; id?: string };

function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function StreamField({ blocks }: { blocks: StreamBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        const key = block.id ?? `${block.type}-${idx}`;

        switch (block.type) {
          case "heading":
            return <h2 key={key} className="text-2xl font-semibold tracking-tight">{block.value}</h2>;

          case "paragraph":
            return <SafeHtml key={key} html={block.value} />;

          case "image":
            return (
              <figure key={key} className="space-y-2">
                <img
                  src={`${block.value.url}`}
                  alt={block.value.alt || ""}
                  className="w-full rounded-2xl border"
                />
                {block.value.alt ? (
                  <figcaption className="text-sm opacity-70">{block.value.alt}</figcaption>
                ) : null}
              </figure>
            );

          case "pullquote":
            return (
              <figure key={key} className="border-l-4 pl-4 italic">
                <blockquote className="text-lg">{block.value.quote}</blockquote>
                {block.value.attribution ? (
                  <figcaption className="mt-2 text-sm not-italic opacity-70">— {block.value.attribution}</figcaption>
                ) : null}
              </figure>
            );

          default:
            return (
              <div key={key} className="rounded-xl border p-4 text-sm opacity-70">
                Unsupported block: <b>{block.type}</b>
              </div>
            );
        }
      })}
    </div>
  );
}
