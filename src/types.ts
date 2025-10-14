import type { Plugin } from "obsidian";

export interface PureWordCountSettings {
  excludeFrontmatter: boolean;
  excludeFencedCode: boolean;
  excludeBlockquotes: boolean;
  excludeTables: boolean;
  excludeWhitespaceForChars: boolean;   // 文字数のみ空白除外
  customExcludeRegexps: string;          // 1行=1パターン（/pat/gi も可）
  statusFormat: string;                  // "Words: {words} | Chars: {chars}"
  updateDebounceMs: number;              // 補助用（CM6で不要なら0でもOK）
  useSelectionWhenPresent: boolean;        // 選択範囲があればそちらをカウント
}

export const DEFAULT_SETTINGS: PureWordCountSettings = {
  excludeFrontmatter: true,
  excludeFencedCode: true,
  excludeBlockquotes: true,
  excludeTables: true,
  excludeWhitespaceForChars: true,
  customExcludeRegexps: "",
  statusFormat: "Words: {words} | Chars: {chars}",
  updateDebounceMs: 150,
  useSelectionWhenPresent: true,
};

// 旧キー -> 新キーへの移行（空行→空白）
export async function loadAndMigrateSettings<T extends Plugin & { settings: PureWordCountSettings }>(plugin: T) {
  const data = await plugin.loadData();
  plugin.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  // @ts-ignore 旧キーがあれば転記
  if (data && typeof data.excludeBlankLinesForChars === "boolean") {
    // @ts-ignore
    plugin.settings.excludeWhitespaceForChars = data.excludeBlankLinesForChars;
    await plugin.saveData(plugin.settings);
  }
}