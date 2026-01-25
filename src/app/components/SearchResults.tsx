"use client";

import { useEffect, useRef } from "react";

interface SearchResultsProps {
  query: string;
  content: string;
  isStreaming: boolean;
}

export function SearchResults({
  query,
  content,
  isStreaming,
}: SearchResultsProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content, isStreaming]);

  const renderContent = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    const elements: JSX.Element[] = [];
    let inCodeBlock = false;
    let codeContent = "";

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeContent = "";
        } else {
          elements.push(
            <pre
              key={`code-${index}`}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 overflow-x-auto my-4 text-sm"
            >
              <code className="text-zinc-300 font-mono">{codeContent}</code>
            </pre>,
          );
          inCodeBlock = false;
        }
        return;
      }

      if (inCodeBlock) {
        codeContent += (codeContent ? "\n" : "") + line;
        return;
      }

      if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={index}
            className="text-lg font-semibold text-zinc-100 mt-6 mb-2"
          >
            {line.slice(4)}
          </h3>,
        );
        return;
      }
      if (line.startsWith("## ")) {
        elements.push(
          <h2 key={index} className="text-xl font-bold text-zinc-50 mt-6 mb-3">
            {line.slice(3)}
          </h2>,
        );
        return;
      }
      if (line.startsWith("# ")) {
        elements.push(
          <h1 key={index} className="text-2xl font-bold text-zinc-50 mt-6 mb-3">
            {line.slice(2)}
          </h1>,
        );
        return;
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(
          <li key={index} className="text-zinc-300 ml-6 mb-1 list-disc">
            {renderInline(line.slice(2))}
          </li>,
        );
        return;
      }

      const numberedMatch = line.match(/^(\d+)\.\s(.+)/);
      if (numberedMatch) {
        elements.push(
          <li key={index} className="text-zinc-300 ml-6 mb-1 list-decimal">
            {renderInline(numberedMatch[2])}
          </li>,
        );
        return;
      }

      if (line.trim() === "") {
        elements.push(<div key={index} className="h-3" />);
        return;
      }

      elements.push(
        <p key={index} className="text-zinc-300 mb-2 leading-relaxed">
          {renderInline(line)}
        </p>,
      );
    });

    return elements;
  };

  const renderInline = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let key = 0;

    // Handle inline code
    while (remaining.includes("`")) {
      const start = remaining.indexOf("`");
      const end = remaining.indexOf("`", start + 1);
      if (end === -1) break;

      if (start > 0) parts.push(remaining.slice(0, start));
      parts.push(
        <code
          key={`c${key++}`}
          className="bg-zinc-800 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono"
        >
          {remaining.slice(start + 1, end)}
        </code>,
      );
      remaining = remaining.slice(end + 1);
    }

    if (remaining) {
      // Handle bold
      const boldParts = remaining.split(/\*\*(.+?)\*\*/g);
      boldParts.forEach((part, i) => {
        if (i % 2 === 1) {
          parts.push(
            <strong key={`b${key++}`} className="font-semibold text-zinc-100">
              {part}
            </strong>,
          );
        } else if (part) {
          parts.push(part);
        }
      });
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Query header */}
      <div className="mb-6 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-500 text-sm mb-1">
          <svg
            className="w-4 h-4"
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
          <span>Results for</span>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">{query}</h1>
      </div>

      {/* Content */}
      <div ref={contentRef} className="max-w-none">
        {renderContent(content)}
        {isStreaming && (
          <span className="inline-block w-2 h-5 bg-indigo-500 animate-pulse ml-0.5 align-middle" />
        )}
      </div>

      {/* Footer */}
      {!isStreaming && content && (
        <div className="mt-8 pt-6 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <svg
              className="w-4 h-4 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Generated by local AI • No data sent to external servers
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
