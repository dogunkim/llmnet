export async function createEmbedding(text: string): Promise<number[]> {
  const response = await fetch(
    process.env.EMBEDDING_URL || "http://192.168.0.124:8889/v1/embeddings",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: text,
        model: process.env.EMBEDDING_MODEL || "null",
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Embedding request failed: ${errorBody}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}
