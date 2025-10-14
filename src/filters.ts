import type { PureWordCountSettings } from "./types";

// ユーザー定義の除外正規表現を作る
export function buildCustomRegexps(settings: PureWordCountSettings): RegExp[] {
  const raw = settings.customExcludeRegexps?.trim();
  if (!raw) return [];
  const lines = raw.split("\n").map(s => s.trim()).filter(Boolean);

  const regs: RegExp[] = [];
  for (const line of lines) {
    const m = line.match(/^\/(.+)\/([a-z]*)$/i);
    try {
      regs.push(m ? new RegExp(m[1], m[2]) : new RegExp(line, "g"));
    } catch { /* 無効なパターンは無視 */ }
  }
  return regs;
}

// 単語数カウント用の下処理
export function stripForWordCount(src: string, settings: PureWordCountSettings): string {
  let s = src;

  if (settings.excludeFrontmatter) {
    // 先頭frontmatterのみ安全に除去
    s = s.replace(/^(---\s*\n)[\s\S]*?\n---\s*\n?/, "");
  }
  if (settings.excludeFencedCode) {
    s = s.replace(/```[\s\S]*?```/g, "");
    s = s.replace(/~~~[\s\S]*?~~~/g, "");
  }
  if (settings.excludeBlockquotes) {
    s = s.split("\n").filter(line => !/^\s*>/.test(line)).join("\n");
  }
  if (settings.excludeTables) {
    s = s.split("\n").filter(line =>
      !/^\s*\|/.test(line) && !/^\s*:?-{3,}:?\|?/.test(line)
    ).join("\n");
  }

  for (const rx of buildCustomRegexps(settings)) {
    s = s.replace(rx, "");
  }
  return s;
}

// 文字数カウント用の下処理（空白類も除去）
export function stripForCharCount(src: string, settings: PureWordCountSettings): string {
  let s = stripForWordCount(src, settings);
  if (settings.excludeWhitespaceForChars) {
    s = s.replace(/[\s\u00A0\u3000\u200B-\u200D\uFEFF]+/g, "");
  }
  return s;
}
