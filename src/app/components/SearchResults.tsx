"use client";

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

interface SearchResultsProps {
  query: string;
  data: SearchData | null;
  isSearching: boolean;
  onResultClick: (query: string) => void;
}

export function SearchResults({
  query,
  data,
  isSearching,
  onResultClick,
}: SearchResultsProps) {
  if (isSearching && !data) {
    return (
      <div className="animate-in fade-in duration-500 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-12 animate-pulse mt-12">
          {/* <div className="h-32 bg-zinc-900/50 rounded-2xl border border-zinc-800" /> */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-1/4 bg-zinc-900/80 rounded" />
              <div className="h-6 w-3/4 bg-zinc-900/80 rounded" />
              <div className="h-16 w-full bg-zinc-900/80 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Main Results Column */}
      <div className="flex-1 min-w-0">
        {/* Results Header */}
        <div className="text-zinc-500 text-sm mb-6">
          About {data.results.length} results for{" "}
          <span className="text-zinc-300 font-medium font-mono">{query}</span>
        </div>

        {/* AI Overview Box */}
        {data.overview && (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 mb-10 shadow-sm shadow-indigo-500/5">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              AI Overview
            </h2>
            <div className="text-zinc-200 text-lg leading-relaxed whitespace-pre-line">
              {data.overview}
            </div>
          </div>
        )}

        {/* Search Result Cards */}
        <div className="space-y-12">
          {data.results.map((result) => (
            <div
              key={`${result.url}-${result.title}`}
              className="group max-w-2xl"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] overflow-hidden shrink-0">
                    {result.url.includes("github")
                      ? "GH"
                      : result.url.includes("wikipedia")
                        ? "W"
                        : "🔗"}
                  </div>
                  <span className="truncate max-w-xs">{result.url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onResultClick(result.title)}
                  className="text-left text-xl font-medium text-indigo-400 group-hover:underline decoration-indigo-400 underline-offset-4 cursor-pointer"
                >
                  {result.title}
                </button>
                <p className="text-zinc-400 text-sm leading-relaxed mt-1">
                  {result.snippet}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar / Knowledge Panel */}
      {data.knowledgePanel && (
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-100 mb-4 text-left">
              About
            </h2>
            <div className="text-sm text-zinc-400 space-y-3 whitespace-pre-line leading-relaxed text-left">
              {data.knowledgePanel}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
