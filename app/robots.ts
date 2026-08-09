import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/urls";

const PUBLIC_PATHS = ["/", "/login", "/privacy", "/terms"];
const PRIVATE_PATHS = ["/dashboard/", "/admin/", "/api/", "/onboarding", "/verify"];

// Explicit, affirmative rules for known AI crawlers/agents (same access as
// the generic "*" rule below) — we publish llms.txt specifically so AI
// tools can discover the site, so this makes that intent explicit rather
// than relying on the generic rule alone, and protects against a future
// tightening of "*" accidentally blocking them without a deliberate choice.
const AI_USER_AGENTS = [
  "GPTBot", // OpenAI crawler
  "ChatGPT-User", // OpenAI, browsing on behalf of a ChatGPT user
  "OAI-SearchBot", // OpenAI search
  "ClaudeBot", // Anthropic crawler
  "Claude-User", // Anthropic, browsing on behalf of a Claude user
  "Claude-SearchBot", // Anthropic search
  "anthropic-ai", // Anthropic (legacy token)
  "PerplexityBot", // Perplexity
  "Perplexity-User", // Perplexity, browsing on behalf of a user
  "Google-Extended", // Google's AI-training opt-in signal
  "Applebot-Extended", // Apple's AI-training opt-in signal
  "CCBot", // Common Crawl (widely used to train LLMs)
  "Amazonbot", // Amazon
  "Bytespider", // ByteDance
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: PUBLIC_PATHS,
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
