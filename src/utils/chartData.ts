// src/utils/chartData.ts
export function parseCsvToData(csvText: string) {
  if (!csvText) return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj: Record<string, any> = {};
    header.forEach((key, i) => {
      const value = values[i]?.trim();
      const num = Number(value);
      obj[key] = isNaN(num) ? value : num;
    });
    return obj;
  });
}
