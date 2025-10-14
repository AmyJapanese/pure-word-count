// Obsidian純正が使えれば使う。なければ賢い近似。
declare global { interface Window { obsidian?: any } }

export function countWordsUsingBestEffort(text: string): number {
  const maybeWordCount = window?.obsidian?.wordCount;
  if (typeof maybeWordCount === "function") {
    try { return Number(maybeWordCount(text)) || 0; } catch {}
  }

  // 近似：CJK塊を1語、残りは空白split
  const cjkMatches = text.match(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]+/gu);
  const cjkWords = cjkMatches ? cjkMatches.length : 0;
  const asciiPart = text.replace(/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/gu, " ");
  const asciiWords = asciiPart.trim().split(/\s+/).filter(Boolean).length;
  return cjkWords + asciiWords;
}