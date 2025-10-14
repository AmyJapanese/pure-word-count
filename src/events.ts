import type PureWordCountPlugin from "./main";
import { EditorView } from "@codemirror/view";

// “打鍵ごと”リアルタイム更新をセットアップ
export function attachRealtimeUpdates(plugin: PureWordCountPlugin) {
  // rAFで1フレームに1回だけ更新
  let rafId: number | null = null;
  const schedule = () => {
    if (rafId != null) return;
    rafId = requestAnimationFrame(() => { rafId = null; plugin.updateStatus(); });
  };

  // CM6: ドキュメント変更時のみ
  // @ts-ignore（APIはObsidianでラップされていることがある）
  if (plugin.registerEditorExtension) {
    plugin.registerEditorExtension(
      EditorView.updateListener.of(vu => {
        if (vu.docChanged && vu.view.hasFocus) schedule();
      })
    );
  } else {
    // 古い環境: editor-change にフォールバック
    plugin.registerEvent(plugin.app.workspace.on("editor-change", () => schedule()));
  }

  // ファイル切替/初期表示
  plugin.registerEvent(plugin.app.workspace.on("active-leaf-change", () => plugin.updateStatus()));
  if (plugin.app.workspace.layoutReady) {
    plugin.updateStatus();
  } else {
    plugin.app.workspace.onLayoutReady(() => plugin.updateStatus());
  }

  // 同一ファイルが外部要因でmodifyされたとき
  plugin.registerEvent(
    plugin.app.vault.on("modify", f => {
      const active = plugin.getActiveFile();
      if (active && f.path === active.path) schedule();
    })
  );
}
