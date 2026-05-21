/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CsvTemplate {
  id: string;
  name: string;
  description: string;
  iconName: string; // 用於指定 Lucide-React 圖標
  content: string;
}

export interface AnalysisResult {
  markdown: string;
  timestamp: string;
  csvSize: number;
}
