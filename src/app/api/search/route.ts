// app/api/search/route.ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getCurrentTime } from "@/utils/currentTime";
import pool from "@/utils/db";
import { createEmbedding } from "@/utils/embeddings";
import { SYSTEM_PROMPT } from "@/utils/system-prompts";

const provider = createOpenAICompatible({
  name: "llmnet-provider",
  apiKey: process.env.API_KEY || "no-key-needed",
  baseURL: process.env.API_BASE_URL || "http://192.168.0.124:8888/v1",
});

export async function POST(req: Request) {
  try {
    const query = await req.text();
    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    // 1. RAG: Search Vector DB
    let ragContext = "";
    try {
      const embedding = await createEmbedding(query);
      const vectorStr = `[${embedding.join(",")}]`;

      const res = await pool.query(
        `
        SELECT c.content, d.title, d.url, (c.embedding <=> $1) as distance
        FROM chunks c
        JOIN documents d ON c.document_id = d.id
        ORDER BY distance ASC
        LIMIT 3;
      `,
        [vectorStr],
      );

      if (res.rows.length > 0) {
        ragContext =
          "\n\n### RETRIEVED LOCAL KNOWLEDGE\n" +
          res.rows
            .map(
              (row) =>
                `Source: ${row.title} (${row.url})\nContent: ${row.content}`,
            )
            .join("\n---\n");
        console.log(`🔍 RAG: Found ${res.rows.length} relevant chunks`);
      }
    } catch (ragErr) {
      console.error("RAG search failed (skipping):", ragErr);
    }

    const messages: { role: "user"; content: string }[] = [
      { role: "user", content: query },
    ];

    const { text } = await generateText({
      model: provider("null"),
      system: `${SYSTEM_PROMPT}
${ragContext}

Current time: ${getCurrentTime()}`,
      messages: messages,
      stopSequences: ["</s>", "<|im_end|>", "<|eot_id|>"],
    });

    if (!text || text.trim() === "") {
      throw new Error("Model returned empty text");
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : text;

    try {
      const result = JSON.parse(jsonString);
      return NextResponse.json({
        overview: result.overview || "No overview available.",
        results: Array.isArray(result.results) ? result.results : [],
        knowledgePanel: result.knowledgePanel || null,
      });
    } catch (parseError) {
      console.warn(
        "JSON Parse Error, returning raw text as overview:",
        parseError,
      );
      return NextResponse.json({
        overview: text,
        results: [],
        knowledgePanel: null,
      });
    }
  } catch (error) {
    const e = error as Error;
    console.error("Search API Error:", e);
    return NextResponse.json(
      {
        error: e.message || "An unexpected error occurred.",
        overview: `Error: ${e.message || "Could not generate results."}`,
        results: [],
      },
      { status: 500 },
    );
  }
}
