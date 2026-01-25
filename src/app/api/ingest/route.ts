import { NextResponse } from "next/server";
import { crawlUrl } from "@/utils/crawler";
import pool, { initDb } from "@/utils/db";
import { createEmbedding } from "@/utils/embeddings";
import { splitText } from "@/utils/splitter";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Ensure DB is initialized
    await initDb();

    console.log(`🚀 Starting ingestion for: ${url}`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const visited = new Set<string>();
      const queue = [url];
      let pageCount = 0;
      const MAX_PAGES = Number(process.env.MAX_PAGES || 25);

      while (queue.length > 0 && pageCount < MAX_PAGES) {
        const currentUrl = queue.shift();
        if (!currentUrl || visited.has(currentUrl)) continue;
        visited.add(currentUrl);

        try {
          console.log(
            `📄 [${pageCount + 1}/${MAX_PAGES}] Crawling: ${currentUrl}`,
          );
          const page = await crawlUrl(currentUrl);
          pageCount++;

          // 2. Split
          const chunks = splitText(page.content);
          console.log(`   📦 Split into ${chunks.length} chunks`);

          // Insert document
          const docRes = await client.query(
            "INSERT INTO documents (url, title, metadata) VALUES ($1, $2, $3) ON CONFLICT (url) DO UPDATE SET title = EXCLUDED.title, created_at = NOW() RETURNING id",
            [
              page.url,
              page.title,
              JSON.stringify({ crawled_at: new Date().toISOString() }),
            ],
          );
          const docId = docRes.rows[0].id;

          // Delete old chunks for this document
          await client.query("DELETE FROM chunks WHERE document_id = $1", [
            docId,
          ]);

          // 3. Embed and Save chunks
          for (const chunk of chunks) {
            const embedding = await createEmbedding(chunk.content);
            const vectorStr = `[${embedding.join(",")}]`;
            await client.query(
              "INSERT INTO chunks (document_id, content, embedding) VALUES ($1, $2, $3)",
              [docId, chunk.content, vectorStr],
            );
          }

          // Add links to queue for recursion (only if we haven't reached the limit)
          if (pageCount < MAX_PAGES) {
            for (const link of page.links) {
              if (!visited.has(link)) {
                queue.push(link);
              }
            }
          }
        } catch (crawlErr) {
          console.error(`   ⚠️ Failed to crawl ${currentUrl}:`, crawlErr);
        }
      }

      await client.query("COMMIT");
      console.log(`✅ Ingestion complete. Processed ${pageCount} pages.`);

      return NextResponse.json({
        success: true,
        pages: pageCount,
      });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Ingestion failed:", err);
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
