// app/api/search/route.ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getCurrentTime } from "@/utils/currentTime";
import { SYSTEM_PROMPT } from "@/utils/system-prompts";

const provider = createOpenAICompatible({
  name: "llmnet-provider",
  apiKey: process.env.API_KEY || "no-key-needed",
  baseURL: process.env.BASE_URL || "http://192.168.0.124:8888/v1",
});

export async function POST(req: Request) {
  try {
    const query = await req.text();

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const messages: { role: "user"; content: string }[] = [
      { role: "user", content: query },
    ];

    const { text } = await generateText({
      model: provider("null"),
      system: `${SYSTEM_PROMPT}\n\nCurrent time: ${getCurrentTime()}`,
      messages: messages,
      stopSequences: ["</s>", "<|im_end|>", "<|eot_id|>"],
    });

    if (!text || text.trim() === "") {
      throw new Error("Model returned empty text");
    }

    // Advanced JSON extraction: find the first '{' and matching '}'
    // This handles cases where the LLM adds text before/after the JSON
    let jsonString = text.trim();
    const firstBrace = jsonString.indexOf("{");
    const lastBrace = jsonString.lastIndexOf("}");

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      jsonString = jsonString.substring(firstBrace, lastBrace + 1);
    }

    try {
      const result = JSON.parse(jsonString);
      return NextResponse.json({
        overview: result.overview || "No overview available.",
        results: Array.isArray(result.results) ? result.results : [],
        knowledgePanel: result.knowledgePanel || null,
      });
    } catch (parseError) {
      console.error(
        "JSON Parse Error:",
        parseError,
        "Extracted string:",
        jsonString,
      );

      // If parsing fails, we try one more thing: clean common markdown issues
      try {
        const cleaned = jsonString
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const secondTry = JSON.parse(cleaned);
        return NextResponse.json({
          overview: secondTry.overview || "No overview available.",
          results: Array.isArray(secondTry.results) ? secondTry.results : [],
          knowledgePanel: secondTry.knowledgePanel || null,
        });
      } catch {
        // Absolute fallback: return text as overview
        return NextResponse.json({
          overview: text,
          results: [],
          knowledgePanel: null,
        });
      }
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
