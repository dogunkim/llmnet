# 🌐 LLMNet

**The Offline Internet.** A premium, private, and AI-powered search experience that lives entirely on your machine.

LLMNet transforms your local LLMs into a structured search engine. It combines the power of local generative AI with a high-performance Vector Database (RAG) to provide instant, offline answers from your own knowledge base.

---

### ✨ Key Features

- **🔒 100% Private:** Your queries and data never leave your local network.
- **🧠 Local RAG:** Index any website or wiki into a persistent Postgres Vector DB.
- **⚡ Instant Results:** Sub-second semantic search using pgvector & HNSW indexing.
- **🎨 Premium UI:** A glassmorphic, dark-mode interface inspired by modern search engines.
- **🌐 No Internet Required:** Once indexed, your knowledge stays available offline.

---

### 🛠️ Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Intelligence:** Local LLMs (via OpenAI-compatible APIs)
- **Database:** PostgreSQL with `pgvector`
- **Orchestration:** Bun, Cheerio (Crawl), Turndown (Markdown)

---

### 🚀 Quick Start

#### 1. Requirements
Ensure you have the following running locally:
- **LLM Server:** Port configured in `.env` (e.g., Llama.cpp, Ollama)
- **Embedding Server:** Port configured in `.env`
- **Database:** Postgres with the `vector` extension (see `postgres-pgvector/`)

#### 2. Configuration
Configure your environment variables in `.env`:
```bash
# Example configuration
API_BASE_URL=http://localhost:8888/v1
EMBEDDING_URL=http://localhost:8889/v1/embeddings
```

#### 3. Setup & Run
```bash
# Install dependencies
bun install

# Initialize Database
bun postgres-pgvector/migrate.ts

# Start the engine
bun dev
```

Visit [localhost:3000](http://localhost:3000) to start searching.

---

### ⊕ Add Knowledge

LLMNet features a recursive ingestion pipeline. Simply paste a documentation URL or a GitHub Wiki link into the **Indexer**, and the system will:
1. **Crawl** the site (Recursive BFS).
2. **Convert** content to clean Markdown.
3. **Chunk** text using a Recursive Character Splitter.
4. **Embed & Store** vectors for semantic retrieval.

---

<p align="center">
  <i>Built for those who value privacy and data sovereignty.</i>
</p>
