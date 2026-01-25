import { crawlUrl } from "../src/app/utils/crawler";

async function test() {
  const url = "https://github.com/sigoden/aichat/wiki";
  console.log(`Crawling ${url}...`);
  try {
    const page = await crawlUrl(url);
    console.log(`Title: ${page.title}`);
    console.log(`Content length: ${page.content.length}`);
    console.log("--- Content Preview ---");
    console.log(page.content);
  } catch (err) {
    console.error(err);
  }
}

test();
