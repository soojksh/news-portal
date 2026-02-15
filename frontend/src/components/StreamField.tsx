"use client";

import React from "react";
import DOMPurify from "dompurify";

type StreamBlock =
  | { type: "heading"; value: string }
  | { type: "paragraph"; value: string } // HTML
  | { type: "image"; value: number | any } // depends how you expose images
  | { type: "pullquote"; value: { quote: string; attribution?: string } }
  | { type: string; value: any };

function SafeHtml({ html }: { html: string }) {
  const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: clean }} />;
}

export function StreamField({ blocks }: { blocks: StreamBlock[] }) {
  if (!blocks?.length) return null;

  return (
    <div className="space-y-6">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "heading":
            return (
              <h2 key={idx} className="text-2xl font-semibold tracking-tight">
                {block.value}
              </h2>
            );

          case "paragraph":
            return <SafeHtml key={idx} html={block.value} />;

          case "pullquote":
            return (
              <figure key={idx} className="border-l-4 pl-4 italic">
                <blockquote className="text-lg">{block.value.quote}</blockquote>
                {block.value.attribution ? (
                  <figcaption className="mt-2 text-sm not-italic opacity-70">
                    — {block.value.attribution}
                  </figcaption>
                ) : null}
              </figure>
            );

          case "image":
            // We’ll handle image properly in the next step (important).
            return (
              <div key={idx} className="rounded-xl border p-4 text-sm opacity-70">
                Image block (not wired yet): {JSON.stringify(block.value)}
              </div>
            );

          default:
            // Unknown blocks won’t crash the page (very important).
            return (
              <div key={idx} className="rounded-xl border p-4 text-sm opacity-70">
                Unsupported block: <b>{block.type}</b>
              </div>
            );
        }
      })}
    </div>
  );
}
