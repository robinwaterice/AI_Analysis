/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  Info, 
  Table, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Send,
  Loader2,
  AlertTriangle,
  Database,
  Clock,
  CheckCircle,
  Play,
  Monitor,
  ShieldCheck,
  CodeXml,
  Cpu
} from "lucide-react";
import { CSV_TEMPLATES } from "./data";
import MarkdownRenderer from "./components/MarkdownRenderer";
import { AnalysisResult } from "./types";

export default function App() {
  const [csvText, setCsvText] = useState("");
  const [customQueryText, setCustomQueryText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showSystemPrompt, setShowSystemPrompt] = useState(false);

  // 處理範例模板一鍵填入
  const handleSelectTemplate = (id: string, content: string) => {
    setCsvText(content);
    setSelectedTemplate(id);
    setError(null);
  };

  // 處理清空資料
  const handleClear = () => {
    setCsvText("");
    setCustomQueryText("");
    setResult(null);
    setError(null);
    setSelectedTemplate(null);
  };

  // 執行 AI 數據分析
  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) {
      setError("請先輸入或選擇一組 CSV 數據資料！");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvData: csvText,
          customQuery: customQueryText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "伺服器在分析資料時發生未知錯誤。");
      }

      setResult({
        markdown: data.markdown,
        timestamp: new Date().toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        csvSize: new Blob([csvText]).size,
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "連線至 AI 分析伺服器失敗，請確認您的網路狀況或 API Key 配置。");
    } finally {
      setLoading(false);
    }
  };

  // 針對側欄模板，取得對應 Icon Element
  const getTemplateIcon = (iconName: string) => {
    switch (iconName) {
      case "ShoppingBag":
        return <ShoppingBag className="w-5 h-5 text-indigo-500" />;
      case "TrendingUp":
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "Users":
        return <Users className="w-5 h-5 text-amber-500" />;
      default:
        return <Table className="w-5 h-5 text-slate-500" />;
    }
  };

  // 靜態展示後台運作的 System Prompt，使用者可展開預覽，增加信任度與可玩性
  const SYSTEM_INSTRUCTION_PREVIEW = `你是一位專業的資料分析師。
任務是接收一段 CSV 或表格結構的原始數據，理解其欄位意義，並提出精確的摘要報告與洞察。

請務必嚴格遵循以下 Markdown 輸出格式：
1. 📊 資料概況與欄位理解
2. ⚠️ 異常與缺值檢查
3. 📈 統計與趨勢洞察 (總計概況、分類表現、業務建議)`;

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-950 font-sans p-4 sm:p-6 md:p-8 flex flex-col">
      
      {/* 頂部裝飾霓虹條 */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50" />

      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 mt-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200/60 ring-4 ring-indigo-50">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                AI 數據分析與洞察工具
              </h1>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                Bento v2.4
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold tracking-wide mt-0.5">
              系統狀態：<span className="text-emerald-600 font-extrabold animate-pulse">● 線上就緒 (Stable)</span>
            </p>
          </div>
        </div>

        {/* 模型與 API 盾牌資訊 */}
        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-500">託管模型：</span>
            <span className="text-slate-800 font-bold">Gemini-3.5-Flash</span>
          </div>
          <div className="px-4 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-2 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-800 font-bold">繁體中文數據安全代理解析</span>
          </div>
        </div>
      </header>

      {/* Main Content Bento Grid - 12 欄響應式佈局 */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        
        {/* ==================== 左側區塊：佔 5 欄 ==================== */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          
          {/* 板塊 1：一鍵帶入範例數據 (Bento Box 1) */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-indigo-500" />
                一鍵帶入範例數據
              </h2>
              <span className="text-[9px] bg-indigo-50 text-indigo-600 font-bold px-2.5 py-0.5 rounded-full uppercase">
                多領域樣板
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3.5">
              {CSV_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    id={`btn-tpl-${tpl.id}`}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id, tpl.content)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex gap-3 ${
                      isSelected 
                        ? "bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-100 shadow-sm text-slate-900"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex-shrink-0 bg-white p-2 rounded-lg border border-slate-200/60 shadow-inner flex items-center justify-center">
                      {getTemplateIcon(tpl.iconName)}
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5 leading-tight">
                        {tpl.name}
                        {isSelected && (
                          <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal font-normal">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 板塊 2：CSV 數據貼上與輸入區域 (Bento Box 2) */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col transition-all hover:shadow-md">
            <form onSubmit={handleAnalyze} className="space-y-4">
              
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Table className="w-4.5 h-4.5 text-indigo-500" />
                  匯入 CSV 數據來源
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono border border-slate-200/40">
                    UTF-8 支援
                  </span>
                  {csvText && (
                    <button
                      id="btn-clear-all"
                      type="button"
                      onClick={handleClear}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2 py-1 rounded hover:bg-rose-50 transition-colors flex items-center gap-1"
                      title="清空輸入框"
                    >
                      <Trash2 className="w-3 h-3" />
                      清空
                    </button>
                  )}
                </div>
              </div>

              {/* CSV Textarea */}
              <div className="relative">
                <textarea
                  id="csv-input"
                  rows={8}
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    setSelectedTemplate(null);
                  }}
                  placeholder="請在此貼上 CSV 數據，首行需含欄位表頭：&#10;&#10;月份,產品,銷售額,訂單數&#10;1月,3C硬體,1200000,450&#10;2月,極致美妝,890000,1200&#10;3月,潮流鞋包,1540000,850"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-mono text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                />
                <div className="absolute bottom-2.5 right-2.5 text-[9px] text-slate-400 font-mono bg-white/90 border px-1.5 py-0.5 rounded shadow-sm">
                  大小: {new Blob([csvText]).size} B
                </div>
              </div>

              {/* 特定分析目標 (自訂問題) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-slate-700 text-xs font-bold pl-0.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>指定次要探討目標 (選填)</span>
                </div>
                <input
                  id="custom-query-input"
                  type="text"
                  value={customQueryText}
                  onChange={(e) => setCustomQueryText(e.target.value)}
                  placeholder="如：『預測下半季度的趨勢，並給出重點改進方針』"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* 遞交執行按鈕 */}
              <button
                id="btn-start-analysis"
                type="submit"
                disabled={loading || !csvText.trim()}
                className={`w-full py-3 px-5 rounded-xl font-bold text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                  loading
                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                    : !csvText.trim()
                    ? "bg-slate-100 text-slate-300 border border-slate-200 cursor-not-allowed"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-lg shadow-indigo-200"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>AI 科學家正計算與渲染數據中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>啟動 AI 商業指標分析</span>
                  </>
                )}
              </button>

            </form>
          </section>

          {/* 板塊 3：系統指令常數 (System Prompt 顯示) - 展示 AI 的內核程式邏輯 (Bento Box 3) */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <CodeXml className="w-4 h-4 text-slate-400" />
                系統指令常數 (System Prompt)
              </h2>
              <button
                type="button"
                onClick={() => setShowSystemPrompt(!showSystemPrompt)}
                className="text-[10px] text-indigo-600 hover:text-indigo-700 font-bold hover:underline"
              >
                {showSystemPrompt ? "收合指令" : "預覽指令"}
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 leading-normal pl-0.5">
              本工具內設「多維度商業決策指令常數」，AI 會依此解析欄位、導出決策指標。
            </p>

            {showSystemPrompt ? (
              <div id="system-prompt-block" className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-3 max-h-40 overflow-y-auto transition-all scrollbar-thin">
                <code className="text-[10px] text-slate-500 leading-relaxed block whitespace-pre-wrap font-mono">
                  {SYSTEM_INSTRUCTION_PREVIEW}
                </code>
              </div>
            ) : (
              <div className="mt-2.5 bg-slate-50/50 rounded-lg p-2.5 border border-slate-200 border-dashed text-center">
                <span className="text-[9px] text-slate-400 font-medium italic flex items-center justify-center gap-1">
                  💡 * 系統指令已完全鎖定，以確保繁體中文格式的一致與精緻
                </span>
              </div>
            )}
          </section>

        </div>

        {/* ==================== 右側區塊：佔 7 欄 ==================== */}
        <div className="col-span-12 lg:col-span-7 flex flex-col">
          
          {/* 錯誤警告橫幅 */}
          {error && (
            <div id="error-banner" className="bg-rose-50 border border-rose-200 rounded-2xl p-4.5 mb-6 flex gap-3 items-start text-rose-700 shadow-sm animate-fade-in flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h3 className="font-bold text-xs">AI 管道解析錯誤</h3>
                <p className="text-[11px] text-rose-600/90 leading-relaxed font-normal">
                  {error}
                </p>
                <p className="text-[10px] text-rose-500 font-normal">
                  請至 <code className="bg-rose-100/80 px-1 py-0.5 font-mono text-rose-800 rounded">.env.local</code> 檔案或環境變數設定有效的 <code className="bg-rose-100/80 px-1 py-0.5 font-mono text-rose-800 rounded">GEMINI_API_KEY</code> 金鑰以解除阻擋。
                </p>
              </div>
            </div>
          )}

          {/* AI 分析結果本體 (Bento Box 4 - 深色主題 `bg-slate-900` 超強質感) */}
          <section id="analysis-bento-card" className="bg-slate-900 border border-slate-850 rounded-3xl shadow-2xl flex flex-col flex-grow overflow-hidden relative min-h-[500px]">
            
            {/* 上邊界 header 區 */}
            <div className="px-6 py-4.5 border-b border-slate-800/85 flex items-center justify-between flex-shrink-0 bg-slate-950/40">
              <div className="flex items-center gap-2.5 text-white">
                <div className={`w-2.5 h-2.5 rounded-full ${result ? "bg-emerald-400 animate-pulse" : "bg-indigo-400"}`} />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">
                  AI 智能即時洞察報告
                </h2>
              </div>
              
              {/* 若有結果，顯示解析大小 */}
              {result && (
                <span className="text-[9px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700">
                  FILE: {(result.csvSize / 1024).toFixed(2)} KB
                </span>
              )}
            </div>

            {/* 主要滾動內容區 */}
            <div className="flex-grow p-6 sm:p-8 overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 select-text">
              {result ? (
                <div className="space-y-6">
                  {/* 印表頂部 metadata 資訊 */}
                  <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      生成時間: {result.timestamp}
                    </span>
                    <span className="text-indigo-400 font-bold">Secure Transport Layer Verified</span>
                  </div>

                  {/* 渲染富文本 Markdown */}
                  <MarkdownRenderer content={result.markdown} isDark={true} />
                </div>
              ) : (
                /* Empty state引導 */
                <div id="ai-empty-state" className="h-full flex flex-col items-center justify-center text-center p-8 sm:p-12 my-auto">
                  <div className="w-16 h-16 bg-slate-800/40 rounded-2xl flex items-center justify-center text-indigo-400 border border-slate-700/50 shadow-inner mb-6 animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-wide">
                    數據洞察報告在此生成
                  </h3>
                  <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                    您可以在左側手動貼上 CSV 資料，或點選高階範例一鍵載入。隨後點擊「開始 AI 數據分析」即可查看圖表指標！
                  </p>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button
                      id="btn-trial-now"
                      type="button"
                      onClick={() => handleSelectTemplate(CSV_TEMPLATES[0].id, CSV_TEMPLATES[0].content)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-indigo-300 hover:text-indigo-200 hover:bg-slate-750 font-bold text-xs rounded-xl border border-slate-700 transition-all shadow-sm active:scale-[0.98]"
                    >
                      <Play className="w-3 h-3 text-indigo-400" />
                      快速試用商品 YTD 銷售
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 下邊界 footer 狀態區 (滿足 Bento 儀表盤科學感) */}
            <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row justify-between gap-1.5 flex-shrink-0">
              <span className="flex items-center gap-1 text-slate-400">
                <Monitor className="w-3.5 h-3.5" />
                <span>INTERFACE TYPE: BENTO DASHBOARD PRO</span>
              </span>
              <div className="flex gap-4">
                <span>API STATUS: 200 OK</span>
                <span>LATENCY: N/A</span>
              </div>
            </div>

          </section>

        </div>

      </main>

      {/* Footer Bar */}
      <footer className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-4 border-t border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <span>Version 2.4.0-STABLE</span>
          <span>React 19 & TypeScript</span>
          <span>Bento Grid Premium UI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>SSL 加密傳輸安全連線已建立</span>
        </div>
      </footer>

    </div>
  );
}
