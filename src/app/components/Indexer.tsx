"use client";

import { useState } from "react";

export function Indexer() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const handleIndex = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setStatus("loading");
    setMessage("Crawling and embedding... please wait.");

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Ingestion failed");

      setStatus("success");
      setMessage(
        `Successfully indexed "${data.title}" (${data.chunks} chunks)`,
      );
      setUrl("");

      // Reset after 3 seconds
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Indexing error:", err);
      setStatus("error");
      setMessage((err as Error).message);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-zinc-900/40 border border-zinc-800 rounded-2xl shadow-xl">
      <h3 className="text-zinc-100 font-semibold mb-2 flex items-center gap-2">
        <span className="text-indigo-400">⊕</span> Add to local knowledge (RAG)
      </h3>
      <p className="text-zinc-400 text-sm mb-4">
        Enter a URL to crawl it and save it to your local Postgres Vector DB.
      </p>

      <form onSubmit={handleIndex} className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/article"
          className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-200 outline-none focus:border-indigo-500 transition-all"
          disabled={status === "loading"}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl transition-all disabled:opacity-50 font-medium"
        >
          {status === "loading" ? "Indexing..." : "Index"}
        </button>
      </form>

      {status !== "idle" && (
        <div
          className={`mt-4 text-sm ${
            status === "success"
              ? "text-emerald-400"
              : status === "error"
                ? "text-rose-400"
                : "text-indigo-400 animate-pulse"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
