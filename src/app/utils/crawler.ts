import * as cheerio from "cheerio";

export interface PageContent {
  title: string;
  url: string;
  content: string;
}

export async function crawlUrl(url: string): Promise<PageContent> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove script tags, styles, and footers to keep the data clean
  $("script").remove();
  $("style").remove();
  $("footer").remove();
  $("nav").remove();

  const title = $("title").text() || $("h1").first().text() || url;

  // Extract main content - prioritizing article or main tags
  let content = $("article").text() || $("main").text() || $("body").text();

  // Basic whitespace cleaning
  content = content.replace(/\s+/g, " ").trim();

  return { title, url, content };
}
