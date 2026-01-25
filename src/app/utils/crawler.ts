import * as cheerio from "cheerio";
import TurndownService from "turndown";

const turndown = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

export interface PageContent {
  title: string;
  url: string;
  content: string;
  links: string[];
}

// Site-specific extraction rules (inspired by aichat)
const SITE_PRESETS: { re: RegExp; extract: string }[] = [
  {
    // GitHub Wiki
    re: /github\.com\/([^/]+)\/([^/]+)\/wiki/,
    extract: "#wiki-body",
  },
  {
    // GitHub Repo Files
    re: /github\.com\/([^/]+)\/([^/]+)\/blob/,
    extract: "article.markdown-body",
  },
  {
    // Common Documentation sites
    re: /(docs\.|docs\/)/,
    extract: "article, main, .content, #content, .markdown",
  },
];

export async function crawlUrl(url: string): Promise<PageContent> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; LLMNet/1.0; +http://localhost:3000)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 1. Find the best selector based on presets
  let selector = "article, main, body";
  for (const preset of SITE_PRESETS) {
    if (preset.re.test(url)) {
      selector = preset.extract;
      break;
    }
  }

  // 2. Extract content
  const title = $("title").text() || $("h1").first().text() || url;

  // Clean up unwanted elements before converting to markdown
  $("script, style, nav, footer, header:not(article header)").remove();

  const targetElement = $(selector).first();
  const contentHtml =
    targetElement.length > 0 ? targetElement.html() : $("body").html();

  if (!contentHtml) {
    throw new Error("Could not extract content from page");
  }

  // 3. Extract Links for recursion
  const links: string[] = [];
  const origin = new URL(url).origin;
  $("a[href]").each((_, el) => {
    try {
      const href = $(el).attr("href");
      if (!href) return;

      const absoluteUrl = new URL(href, url);
      // Only same-domain links
      if (absoluteUrl.origin === origin) {
        // Remove hash and trailing slash for normalization
        const normalized = absoluteUrl.href.split("#")[0].replace(/\/$/, "");
        if (
          normalized !== url.replace(/\/$/, "") &&
          !links.includes(normalized)
        ) {
          links.push(normalized);
        }
      }
    } catch {
      // Ignore invalid URLs
    }
  });

  // 4. Convert to Markdown (much better for LLM context)
  const markdown = turndown.turndown(contentHtml);

  return {
    title: title.trim(),
    url,
    content: markdown,
    links,
  };
}
