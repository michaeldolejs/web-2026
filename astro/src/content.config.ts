import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// One Markdown file per project overlay: src/content/case-studies/<slug>.md
// Body = the case study text. Everything except `title` is optional.
// Pages CMS writes "" for empty optional fields; treat that as "not set".
const optionalUrl = z.preprocess((v) => (v === "" || v === null ? undefined : v), z.string().url().optional());

const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    meta: z.string().optional(),
    tags: z.string().optional(),
    link: optionalUrl,
    linkLabel: z.string().optional(),
    cover: z.string().optional(),
    credits: z.array(z.object({ label: z.string(), value: z.string(), href: optionalUrl })).default([]),
    // Images (.jpg/.png/.webp) or videos (.mp4). The first item is shown full width.
    media: z.array(z.string()).default([]),
  }),
});

export const collections = { caseStudies };
