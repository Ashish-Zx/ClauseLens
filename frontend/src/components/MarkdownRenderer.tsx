"use client";

import React from "react";

interface MarkdownRendererProps {
  content: string;
}

/**
 * Clean, zero-dependency Markdown & Table renderer tailored for legal clauses,
 * structured comparison tables, bullet points, bold terms, and inline [1] citations.
 */
export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // 1. Detect Markdown Table block
    if (line.startsWith("|") && line.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .slice(1, -1)
            .split("|")
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        const isSeparator = (rowStr: string) => /^[\s|:-]+$/.test(rowStr);
        const bodyStartIndex = isSeparator(tableLines[1]) ? 2 : 1;
        const bodyRows = tableLines.slice(bodyStartIndex).map(parseRow);

        elements.push(
          <div
            key={`table-${i}`}
            className="my-4 overflow-x-auto rounded-lg border border-zinc-200/90 bg-white shadow-subtle"
          >
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/90 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="py-2.5 px-3.5">
                      {formatInlineText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/70 text-zinc-700">
                {bodyRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-zinc-50/70 transition-colors"
                  >
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-2.5 px-3.5 leading-relaxed ${
                          cIdx === 0 ? "font-medium text-zinc-900" : ""
                        }`}
                      >
                        {formatInlineText(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 2. Detect Headings (### or ##)
    if (line.startsWith("### ")) {
      elements.push(
        <h4
          key={`h4-${i}`}
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mt-4 mb-1.5"
        >
          {formatInlineText(line.replace("### ", ""))}
        </h4>
      );
      i++;
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-sm font-semibold text-zinc-900 mt-4 mb-2"
        >
          {formatInlineText(line.replace("## ", ""))}
        </h3>
      );
      i++;
      continue;
    }

    // 3. Detect Unordered Bullet Lists
    if (line.startsWith("- ") || line.startsWith("* ")) {
      const listItems: string[] = [];
      while (
        i < lines.length &&
        (lines[i].trim().startsWith("- ") || lines[i].trim().startsWith("* "))
      ) {
        listItems.push(lines[i].trim().slice(2));
        i++;
      }

      elements.push(
        <ul
          key={`ul-${i}`}
          className="my-2.5 space-y-1.5 pl-4 list-disc marker:text-zinc-400 text-[13px] text-zinc-700 leading-relaxed"
        >
          {listItems.map((item, idx) => (
            <li key={idx}>{formatInlineText(item)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // 4. Standard Paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-[13.5px] leading-relaxed text-zinc-800 my-2 first:mt-0 last:mb-0"
      >
        {formatInlineText(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-2">{elements}</div>;
}

/**
 * Formats inline **bold**, `code`, and [1] citation markers cleanly.
 */
function formatInlineText(text: string): React.ReactNode[] {
  // Split on **bold**, `code`, or [number] citations
  const tokenRegex = /(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="font-mono text-[11.5px] bg-zinc-100 text-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (/^\[\d+\]$/.test(part)) {
      return (
        <span
          key={index}
          className="inline-flex items-center justify-center font-mono text-[10.5px] font-semibold bg-zinc-900 text-white px-1.5 py-0.2 rounded mx-0.5 align-baseline"
        >
          {part}
        </span>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
