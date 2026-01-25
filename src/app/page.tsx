"use client";

import { useCallback, useState } from "react";
import { Logo } from "./components/Logo";
import { SearchInput } from "./components/SearchInput";
import { SearchResults } from "./components/SearchResults";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchData {
  overview: string;
  results: SearchResult[];
  knowledgePanel?: string;
}

export default function Home() {
  const [searchState, setSearchState] = useState<{
    query: string;
    data: SearchData | null;
    isSearching: boolean;
    hasSearched: boolean;
    error: string | null;
  }>({
    query: "",
    data: null,
    isSearching: false,
    hasSearched: false,
    error: null,
  });

  const handleSearch = useCallback(async (query: string) => {
    setSearchState({
      query,
      data: null,
      isSearching: true,
      hasSearched: true,
      error: null,
    });

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: query,
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();

      setSearchState((prev) => ({
        ...prev,
        data: data,
        isSearching: false,
      }));
    } catch (error) {
      console.error("Search error:", error);
      setSearchState((prev) => ({
        ...prev,
        error:
          "⚠️ An error occurred. Please ensure your local AI server is running at localhost:8888 and try again.",
        isSearching: false,
      }));
    }
  }, []);

  const handleResultClick = useCallback(
    (title: string) => {
      const result = searchState.data?.results.find((r) => r.title === title);
      if (result) {
        const url = result.url.startsWith("http")
          ? result.url
          : `https://${result.url}`;
        window.open(url, "_blank");
      }
    },
    [searchState.data],
  );

  const handleNewSearch = useCallback(() => {
    setSearchState({
      query: "",
      data: null,
      isSearching: false,
      hasSearched: false,
      error: null,
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950">
      {searchState.hasSearched ? (
        /* Results View */
        <div>
          {/* Header */}
          <header className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800">
            <div className="max-w-5xl mx-auto px-4 py-4">
              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={handleNewSearch}
                  className="shrink-0 hover:opacity-80 transition-opacity"
                >
                  <Logo size="sm" showText={false} />
                </button>
                <div className="flex-1">
                  <SearchInput
                    onSearch={handleSearch}
                    isSearching={searchState.isSearching}
                    initialQuery={searchState.query}
                    variant="compact"
                  />
                </div>
              </div>
            </div>
          </header>

          {/* Results */}
          <main className="max-w-4xl mx-auto px-4 py-8">
            {searchState.error ? (
              <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-400 text-center">
                {searchState.error}
              </div>
            ) : (
              <SearchResults
                query={searchState.query}
                data={searchState.data}
                isSearching={searchState.isSearching}
                onResultClick={handleResultClick}
              />
            )}
          </main>
        </div>
      ) : (
        /* Hero View */
        <div className="min-h-screen flex flex-col items-center justify-center px-4">
          <div className="w-full max-w-2xl mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>

            {/* Tagline */}
            <h1 className="text-4xl md:text-5xl font-bold text-zinc-100 mb-4">
              The Offline Internet
            </h1>
            <p className="text-lg text-zinc-400 mb-8 max-w-lg mx-auto">
              Search the web without the web. AI-powered results generated
              locally on your machine.
            </p>

            {/* Search */}
            <SearchInput
              onSearch={handleSearch}
              isSearching={searchState.isSearching}
              variant="hero"
            />

            {/* Feature pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <span className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400">
                🔒 100% Private
              </span>
              <span className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400">
                ⚡ Instant Results
              </span>
              <span className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400">
                🌐 No Internet Needed
              </span>
              <span className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400">
                🧠 AI Powered
              </span>
            </div>
          </div>

          {/* Footer hint */}
          <div className="absolute bottom-6 left-0 right-0 text-center">
            <p className="text-zinc-600 text-sm">
              Ensure your local LLM server is running at{" "}
              <code className="text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded">
                localhost:8888
              </code>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
