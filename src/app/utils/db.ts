import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "vectoruser",
  password: process.env.DB_PASSWORD || "vectorpass",
  database: process.env.DB_NAME || "vectordb",
});

export async function initDb() {
  const client = await pool.connect();
  try {
    // Create extension
    await client.query("CREATE EXTENSION IF NOT EXISTS vector;");

    // Create documents table
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id SERIAL PRIMARY KEY,
        url TEXT UNIQUE,
        title TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create chunks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS chunks (
        id SERIAL PRIMARY KEY,
        document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
        content TEXT,
        embedding vector(768),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create vector index (HNSW supports up to 2000 dimensions easily)
    await client.query(`
      CREATE INDEX IF NOT EXISTS chunks_embedding_idx ON chunks 
      USING hnsw (embedding vector_cosine_ops);
    `);

    console.log("✓ Database initialized successfully");
  } catch (err) {
    console.error("Failed to initialize database:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
