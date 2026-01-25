async function testEmbedding() {
  const response = await fetch(
    process.env.EMBEDDING_URL || "http://192.168.0.124:8889/v1/embeddings",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: "test",
        model: process.env.EMBEDDING_MODEL || "null",
      }),
    },
  );

  if (!response.ok) {
    console.error("Embedding request failed:", await response.text());
    return;
  }

  const data = await response.json();
  console.log("Embedding length:", data.data[0].embedding.length);
}

testEmbedding();
