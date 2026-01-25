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

    // 1. Crawl
    const page = await crawlUrl(url);

    // 2. Split
    const chunks = splitText(page.content);
    console.log(`📦 Split into ${chunks.length} chunks`);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

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

      // Delete old chunks for this document if updating
      await client.query("DELETE FROM chunks WHERE document_id = $1", [docId]);

      // 3. Embed and Save chunks
      for (const chunk of chunks) {
        const embedding = await createEmbedding(chunk.content);

        // Convert embedding array to postgres vector format: '[0.1, 0.2, ...]'
        const vectorStr = `[${embedding.join(",")}]`;

        await client.query(
          "INSERT INTO chunks (document_id, content, embedding) VALUES ($1, $2, $3)",
          [docId, chunk.content, vectorStr],
        );
      }

      await client.query("COMMIT");
      console.log(`✅ Ingested ${page.title} (${chunks.length} chunks)`);

      return NextResponse.json({
        success: true,
        title: page.title,
        chunks: chunks.length,
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
