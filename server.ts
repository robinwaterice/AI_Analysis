import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// 延遲初始化 GoogleGenAI，並加入 'aistudio-build' User-Agent 首部
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("伺服器未配置 GEMINI_API_KEY 密鑰，請到 Settings > Secrets 中設定。");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// 商業數據分析專用系統提示詞
const SYSTEM_INSTRUCTIONS = `你是一位頂尖的資深數據分析科學家與商業智慧 (Business Intelligence) 專家。
請幫使用者對其提供的 CSV 報表資料進行多維度、極其詳盡且具商業價值的統計分析與解讀。

你必須遵循以下規範：
1. 必須全程使用【繁體中文 (zh-TW)】進行分析與回答，口吻需專業、客觀且語意精準（例如請使用「數據、整合、專案、轉化率」等繁體中文術語，不要用簡體字詞）。
2. 在分析中切勿提及你的 AI 模型名稱（例如 Gemini 等），也不要提及你是按照特定的 System Prompt 指令或代碼而行。
3. CSV 數據可能帶有表頭（Header），請根據表頭聰明地解析並區分對應的特徵與內容。
4. 分析報告必須架構清晰、層次分明，並利用 Markdown 語法及表格來進行精美的高質感呈現，格式必須完全遵循以下結構：
   
   # 📊 數據分析與決策洞察報告
   
   ## 1. 📋 數據概要與結構解析
   *描述數據的基本屬性：包含那些欄位（欄位說明）、總資料筆數、資料時間範圍（如有發現），以及是否有缺漏值、離群值或異常資料等。*
   
   ## 2. 📈 關鍵統計指標與摘要
   *請對各個數值指標進行核心統計分析，如總和、平均值、中位數、最大值/最小值、增長率、轉換率等。*
   *【核心要求】必須使用「Markdown 表格」來美觀呈現數據摘要，以便一目了然（包含指標、計算值與業務解讀）。*
   
   ## 3. 🔍 核心發現、關聯與趨勢分析
   *深度探索數據背後的關鍵故事，分析各維度之間的正負相關性、特定時間點或類別的增長趨勢、是否有特別突出的異常高峰值或低谷值等。*
   
   ## 4. 💡 AI 行動方針與策略建議
   *基於本分析結果，提出 3~5 點明確、可落地執行、具備高商業價值的具體優化或改善建議，並指出該如何執行以達成業務增長或流程效率提升。*

確保排版乾淨俐落、重點用粗體標記、表格邊界清晰，使報告具備高階決策分析的深度。`;

// AI 數據分析 API 端點
app.post("/api/analyze", async (req: express.Request, res: express.Response) => {
  const { csvData, customQuery } = req.body;

  if (!csvData || typeof csvData !== "string" || csvData.trim() === "") {
    return res.status(400).json({ error: "請貼上或選擇有效的 CSV 數據資料！" });
  }

  try {
    const client = getGeminiClient();

    let userPrompt = `以下是待分析的 CSV 數據資料：\n\n\`\`\`csv\n${csvData}\n\`\`\``;

    if (customQuery && typeof customQuery === "string" && customQuery.trim() !== "") {
      userPrompt += `\n\n【使用者特定分析要求/問題】：\n${customQuery}\n\n請務必在產出的報告中，深度解答上述特定要求！`;
    }

    // 當 model 未指定時，對於 text processing / data analysis 的 basic task 使用 gemini-3.5-flash
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        temperature: 0.2, // 保持數據精確率
      }
    });

    const resultMarkdown = response.text || "無法生成分析結果，請重試。";
    res.json({ markdown: resultMarkdown });
  } catch (err: any) {
    console.error("AI 數據分析出錯:", err);
    res.status(500).json({ 
      error: err.message || "AI 分析過程發生錯誤，請確認已在 Settings > Secrets 中配置有效的 GEMINI_API_KEY。" 
    });
  }
});

// Vite & 靜態資源中間件整合
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

startServer();
