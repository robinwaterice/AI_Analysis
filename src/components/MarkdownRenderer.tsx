/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from "react";
import { Check, Copy } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
  isDark?: boolean;
}

export default function MarkdownRenderer({ content, isDark = false }: MarkdownRendererProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("無法複製文字:", err);
    }
  };

  // 渲染為富文本
  const parsedBlocks = useMemo(() => {
    if (!content) return [];

    const lines = content.split("\n");
    const blocks: React.ReactNode[] = [];
    let currentTableRows: string[][] = [];
    let inTable = false;
    let tableHasHeader = false;

    // 用來輔助行內標籤轉換的函數（處理粗體、行內代碼、Emoji 等）
    const renderInlineText = (text: string) => {
      let raw = text;
      const parts: (string | React.ReactNode)[] = [];
      let currentIdx = 0;
      const regex = /(\*\*(.*?)\*\*|`(.*?)`|💡|📊|📈|📋|⚠️)/g;
      let match;
      
      while ((match = regex.exec(raw)) !== null) {
        const matchIdx = match.index;
        if (matchIdx > currentIdx) {
          parts.push(raw.substring(currentIdx, matchIdx));
        }
        
        const fullMatch = match[0];
        if (fullMatch.startsWith("**") && fullMatch.endsWith("**")) {
          parts.push(
            <strong 
              key={matchIdx} 
              className={`font-semibold px-1.5 py-0.5 rounded-sm transition-colors ${
                isDark 
                  ? "text-amber-300 border-b border-amber-500/20 bg-amber-500/10" 
                  : "text-slate-900 border-b border-orange-200 bg-orange-50/40"
              }`}
            >
              {match[2]}
            </strong>
          );
        } else if (fullMatch.startsWith("`") && fullMatch.endsWith("`")) {
          parts.push(
            <code 
              key={matchIdx} 
              className={`font-mono text-xs px-1.5 py-0.5 rounded border transition-colors ${
                isDark 
                  ? "text-pink-300 bg-pink-950/40 border-pink-900/30" 
                  : "text-rose-600 bg-rose-50 border-rose-100"
              }`}
            >
              {match[3]}
            </code>
          );
        } else {
          parts.push(<span key={matchIdx} className="mr-1 inline-block">{fullMatch}</span>);
        }
        currentIdx = regex.lastIndex;
      }
      
      if (currentIdx < raw.length) {
        parts.push(raw.substring(currentIdx));
      }
      
      return parts.length > 0 ? parts : text;
    };

    // 輔助將暫存的表格輸出為 JSX
    const pushTableBlock = (key: number) => {
      if (currentTableRows.length === 0) return;
      
      const headers = tableHasHeader ? currentTableRows[0] : [];
      const bodyRows = tableHasHeader ? currentTableRows.slice(2) : currentTableRows;

      blocks.push(
        <div 
          key={`table-${key}`} 
          className={`w-full my-6 overflow-hidden rounded-xl border transition-all shadow-sm ${
            isDark 
              ? "bg-slate-800/35 border-slate-700/50" 
              : "bg-white border-slate-200/80"
          }`}
        >
          <div className="overflow-x-auto">
            <table className={`w-full border-collapse text-left text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {headers.length > 0 && (
                <thead className={`border-b transition-colors ${isDark ? "bg-slate-800/90 border-slate-700/50" : "bg-slate-50/80 border-slate-200"}`}>
                  <tr>
                    {headers.map((h, idx) => (
                      <th
                        key={`th-${idx}`}
                        className={`px-4 py-3 font-semibold text-xs uppercase tracking-wider ${
                          isDark ? "text-slate-200 bg-slate-850/60" : "text-slate-850 bg-slate-100/60"
                        }`}
                      >
                        {h.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody className={`divide-y ${isDark ? "divide-slate-800/40" : "divide-slate-100"}`}>
                {bodyRows.map((row, rowIdx) => (
                  <tr 
                    key={`tr-${rowIdx}`} 
                    className={`transition-colors ${
                      isDark 
                        ? "hover:bg-slate-800/40 odd:bg-slate-900/10 even:bg-slate-800/20" 
                        : "hover:bg-slate-50/50 odd:bg-white even:bg-slate-50/30"
                    }`}
                  >
                    {row.map((cell, cellIdx) => (
                      <td key={`td-${cellIdx}`} className="px-4 py-3 font-medium whitespace-nowrap">
                        {renderInlineText(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
      
      currentTableRows = [];
      inTable = false;
      tableHasHeader = false;
    };

    let lineIdx = 0;
    while (lineIdx < lines.length) {
      const line = lines[lineIdx];
      const trimmed = line.trim();

      if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1) {
        inTable = true;
        const cells = line.split("|").slice(1, -1);
        currentTableRows.push(cells);
        
        if (cells.every(c => c.trim().match(/^:?-+:?$/))) {
          tableHasHeader = true;
        }
        
        lineIdx++;
        continue;
      } else if (inTable) {
        pushTableBlock(lineIdx);
      }

      if (!trimmed) {
        lineIdx++;
        continue;
      }

      // 標題
      if (trimmed.startsWith("# ")) {
        blocks.push(
          <h1 
            key={lineIdx} 
            className={`text-2xl font-black mt-8 mb-4 border-b pb-2.5 flex items-center gap-2 ${
              isDark ? "text-white border-slate-800" : "text-slate-900 border-slate-200"
            }`}
          >
            {renderInlineText(trimmed.replace("# ", ""))}
          </h1>
        );
      } else if (trimmed.startsWith("## ")) {
        blocks.push(
          <h2 
            key={lineIdx} 
            className={`text-xl font-bold mt-7 mb-3.5 flex items-center gap-2 border-l-4 border-indigo-500 pl-3 ${
              isDark ? "text-slate-100" : "text-slate-800"
            }`}
          >
            {renderInlineText(trimmed.replace("## ", ""))}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        blocks.push(
          <h3 
            key={lineIdx} 
            className={`text-lg font-bold mt-5 mb-2.5 pl-1 ${
              isDark ? "text-slate-200" : "text-slate-800"
            }`}
          >
            {renderInlineText(trimmed.replace("### ", ""))}
          </h3>
        );
      }
      // 無序列表
      else if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
        const itemContent = trimmed.substring(2);
        blocks.push(
          <div key={lineIdx} className={`flex items-start gap-2.5 my-2 pl-4 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
            <span className="text-sm">{renderInlineText(itemContent)}</span>
          </div>
        );
      }
      // 有序列表
      else if (/^\d+\.\s/.test(trimmed)) {
        const match = trimmed.match(/^(\d+)\.\s(.*)/);
        const num = match ? match[1] : "1";
        const itemContent = match ? match[2] : trimmed;
        blocks.push(
          <div key={lineIdx} className={`flex items-start gap-2.5 my-2 pl-4 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            <span className={`font-semibold text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isDark ? "text-indigo-300 bg-slate-800 border border-indigo-500/20" : "text-indigo-600 bg-indigo-50"
            }`}>
              {num}
            </span>
            <span className="text-sm">{renderInlineText(itemContent)}</span>
          </div>
        );
      }
      // 區塊塊/特別卡片引言
      else if (trimmed.startsWith("> ")) {
        const quoteContent = trimmed.substring(2);
        blocks.push(
          <blockquote 
            key={lineIdx} 
            className={`border-l-4 px-4 py-3.5 rounded-r-lg my-4 text-sm italic leading-relaxed ${
              isDark 
                ? "border-indigo-500 bg-indigo-500/5 text-slate-350" 
                : "border-amber-400 bg-amber-50/50 text-slate-700 shadow-inner"
            }`}
          >
            {renderInlineText(quoteContent)}
          </blockquote>
        );
      }
      // 程式碼區塊
      else if (trimmed.startsWith("```")) {
        let codeContent = "";
        lineIdx++;
        while (lineIdx < lines.length && !lines[lineIdx].trim().startsWith("```")) {
          codeContent += lines[lineIdx] + "\n";
          lineIdx++;
        }
        blocks.push(
          <pre key={lineIdx} className="bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-4.5 my-4.5 font-mono text-xs overflow-x-auto shadow-xl leading-relaxed">
            <code>{codeContent.trim()}</code>
          </pre>
        );
      }
      // 普通段落
      else {
        const isHighlight = trimmed.startsWith("💡") || trimmed.startsWith("⚠️") || trimmed.startsWith("🚀");
        if (isHighlight) {
          blocks.push(
            <div 
              key={lineIdx} 
              className={`p-4 rounded-xl my-4 text-sm leading-relaxed shadow-sm border ${
                isDark 
                  ? "bg-indigo-950/40 border-indigo-900/50 text-slate-300" 
                  : "bg-indigo-50/50 border-indigo-100/60 text-slate-700"
              }`}
            >
              {renderInlineText(trimmed)}
            </div>
          );
        } else {
          blocks.push(
            <p key={lineIdx} className={`text-sm leading-relaxed my-3 pl-1 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {renderInlineText(trimmed)}
            </p>
          );
        }
      }

      lineIdx++;
    }

    if (inTable && currentTableRows.length > 0) {
      pushTableBlock(lineIdx);
    }

    return blocks;
  }, [content, isDark]);

  return (
    <div className={`relative rounded-2xl p-6 sm:p-8 transition-all ${
      isDark 
        ? "bg-slate-900 text-slate-200" 
        : "border border-slate-100 bg-slate-50/35 shadow-inner"
    }`}>
      {/* 複製與複歸面板 */}
      <div className="absolute top-4 right-4 z-10">
        <button
          id="btn-copy-report"
          onClick={handleCopyAll}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm border ${
            copied
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : isDark
              ? "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
          }`}
          title="複製報告 Markdown 內容"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              已複製報告！
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              複製完整報告
            </>
          )}
        </button>
      </div>

      {/* 報告內容 */}
      <div className={`prose max-w-none transition-colors ${isDark ? "prose-invert text-slate-300" : "prose-slate text-slate-700"}`}>
        {parsedBlocks.length > 0 ? (
          parsedBlocks
        ) : (
          <p className="text-slate-400 text-sm italic">等待 AI 分析結果...</p>
        )}
      </div>
    </div>
  );
}
