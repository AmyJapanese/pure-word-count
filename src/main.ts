import { MarkdownView, Plugin, TFile } from "obsidian";
import { loadAndMigrateSettings, PureWordCountSettings } from "./types";
import { stripForWordCount, stripForCharCount } from "./filters";
import { countWordsUsingBestEffort } from "./counter";
import { PureWordCountSettingTab } from "./settings";
import { attachRealtimeUpdates } from "./events";

export default class PureWordCountPlugin extends Plugin {
  settings!: PureWordCountSettings;
  statusEl: HTMLElement | null = null;

  async onload() {
    await loadAndMigrateSettings(this);

    this.statusEl = this.addStatusBarItem();
    this.statusEl.setText("Pure WC: —");

    this.addSettingTab(new PureWordCountSettingTab(this.app, this));

    attachRealtimeUpdates(this);  // ← ここだけでOK
    this.updateStatus();          // 念のため初回
  }

  private getSelectedOrFullText(): string {
  const md = this.app.workspace.getActiveViewOfType(MarkdownView);
  const editor = md?.editor;
  if (!editor) return "";

  if (this.settings.useSelectionWhenPresent) {
    // 複数選択にも対応（CM6）
    // @ts-ignore: Obsidian Editor には getSelections() がある
    if (typeof editor.getSelections === "function") {
      // @ts-ignore
      const arr: string[] = editor.getSelections();
      const picked = arr.filter(s => s && s.length > 0).join("\n");
      if (picked.length > 0) return picked;
    } else {
      const s = editor.getSelection();
      if (s && s.length > 0) return s;
    }
  }
  return editor.getValue();
}

  // 他モジュールから使う小物
  getActiveFile(): TFile | null {
    const md = this.app.workspace.getActiveViewOfType(MarkdownView);
    return md?.file ?? null;
  }
  private getActiveText(): string {
    const md = this.app.workspace.getActiveViewOfType(MarkdownView);
    return md?.editor?.getValue() ?? "";
  }

  // ステータス更新（公開：events.ts が呼ぶ）
  updateStatus() {
    if (!this.statusEl) return;
    try {
      const text = this.getSelectedOrFullText();  // ← ここだけ変更
      const wcText = stripForWordCount(text, this.settings);
      const ccText = stripForCharCount(text, this.settings);
      const words = countWordsUsingBestEffort(wcText);
      const chars = [...ccText].length;
      const label = this.settings.statusFormat
        .replace("{words}", String(words))
        .replace("{chars}", String(chars));
        this.statusEl.setText(label);
    } catch (e) {
      console.error("[pure-word-count] update failed:", e);
      this.statusEl.setText("Pure WC: error");
    }
  }
  // main.ts の PureWordCountPlugin 内に追加
  async saveSettings() {
    await this.saveData(this.settings);
    this.updateStatus(); // 保存後に表示を即更新
  }

  // 便利版：設定を部分更新して即保存・反映
  async updateAndSave(patch: Partial<PureWordCountSettings>) {
    Object.assign(this.settings, patch);
    await this.saveData(this.settings);
    this.updateStatus();
  }

}
