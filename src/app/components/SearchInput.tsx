"use client";

import { useEffect, useRef, useState } from "react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  initialQuery?: string;
  variant?: "hero" | "compact";
}

export function SearchInput({
  onSearch,
  isSearching,
  initialQuery = "",
  variant = "hero",
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (variant === "hero" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isSearching) {
      onSearch(query.trim());
    }
  };

  const isHero = variant === "hero";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`relative ${isHero ? "max-w-2xl mx-auto" : "max-w-xl"}`}>
        <div
          className={`
            flex items-center gap-3 bg-zinc-900 
            border border-zinc-700 rounded-2xl
            hover:border-zinc-500 focus-within:border-indigo-500
            transition-all duration-300
            ${isHero ? "px-6 py-4" : "px-4 py-3"}
          `}
        >
          {/* Search Icon */}
          <svg
            className={`shrink-0 text-zinc-500 ${isHero ? "w-6 h-6" : "w-5 h-5"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search anything with AI..."
            disabled={isSearching}
            className={`
              flex-1 bg-transparent outline-none 
              placeholder-zinc-500 text-zinc-100 
              disabled:opacity-50
              ${isHero ? "text-lg" : "text-base"}
            `}
          />

          {/* Loading spinner or submit button */}
          {isSearching ? (
            <div
              className={`
                shrink-0 border-2 border-zinc-700 border-t-indigo-500
                rounded-full animate-spin
                ${isHero ? "w-6 h-6" : "w-5 h-5"}
              `}
            />
          ) : (
            query.trim() && (
              <button
                type="submit"
                className={`
                  shrink-0 bg-indigo-600 hover:bg-indigo-500
                  text-white font-medium rounded-xl
                  transition-all duration-200
                  ${isHero ? "px-5 py-2 text-sm" : "px-4 py-1.5 text-xs"}
                `}
              >
                Search
              </button>
            )
          )}
        </div>
      </div>

      {isHero && (
        <p className="text-center text-zinc-500 text-sm mt-4">
          Powered by local AI • No internet required • Private & offline
        </p>
      )}
    </form>
  );
}
