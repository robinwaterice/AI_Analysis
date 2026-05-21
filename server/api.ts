import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: "15mb" }));

// 延遲初始化 GoogleGenAI
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("伺服器未配置 GEMINI_API_KEY 密鑰，請在環境變數或 .env.local 檔案中設定。");
    }
    ai = new GoogleGenAI({
      apiKey: apiKey
    });
  }
  return ai;
}

// 商業數據分析專用系統提示詞
const SYSTEM_INSTRUCTIONS = `你是一位專業的資料分析師。
你的任務是接收一段 CSV 或表格結構的原始數據，理解其欄位意義，並提出精確的摘要報告與洞察。

請務必嚴格遵循以下 Markdown 輸出格式：

### 1. 📊 資料概況與欄位理解
簡要說明這份資料的主題是什麼，並列出關鍵欄位的意義。

### 2. ⚠️ 異常與缺值檢查
檢查資料中是否有空白（例如缺少數量或金額）、極端值（例如不合理的高價），並將發現的異常項目條列出來。若無異常，說明「未發現明顯異常」。

### 3. 📈 統計與趨勢洞察
請回答以下問題的總結：
- **總計概況**：銷售數量或總金額的大概加總。
- **分類表現**：哪個業務員或哪項產品表現最好？
- **業務建議**：從數據中給出 1-2 個可以執行的商業建議。

請以 Markdown 格式輸出，所有繁體中文部分必須使用**繁體中文**回覆，不要包含任何額外的問候語或結語。`;

// AI 數據分析 API 端點
apiRouter.post("/analyze", async (req: express.Request, res: express.Response) => {
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
      error: err.message || "AI 分析過程發生錯誤，請確認已在環境變數或 .env.local 檔案中配置有效的 GEMINI_API_KEY。" 
    });
  }
});
