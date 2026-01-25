// app/api/search/route.ts
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";
import { NextResponse } from "next/server";
import { getCurrentTime } from "@/utils/currentTime";
import { SYSTEM_PROMPT } from "@/utils/system-prompts";

// export const runtime = "edge";

const provider = createOpenAICompatible({
  name: "my-provider",
  apiKey: process.env.API_KEY || "null", // Not needed for local APIs
  baseURL: process.env.BASE_URL || "http://192.168.0.124:8888/v1",
  includeUsage: true,
});

const getSystemPrompt = () => {
  const currentTime = getCurrentTime();

  return `
    ${SYSTEM_PROMPT}

    Current date and time: ${currentTime}
  `;
};

export async function POST(req: Request) {
  const { messages = [], model = "null" } = await req.json();

  try {
    const result = streamText({
      model: provider(model),
      system: getSystemPrompt(),
      messages: messages, // Simple {role, content} format works directly
      stopSequences: ["<|im_end|>", "<|eot_id|>", "<|end|>", "</s>"],
    });

    return result.toTextStreamResponse();
  } catch (e) {
    console.error(e);

    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 },
    );
  }
}
