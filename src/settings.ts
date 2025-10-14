import { App, PluginSettingTab, Setting } from "obsidian";
import type PureWordCountPlugin from "./main";

export class PureWordCountSettingTab extends PluginSettingTab {
  plugin: PureWordCountPlugin;

  constructor(app: App, plugin: PureWordCountPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h1", { text: "Pure Word Count - Settings" });
    containerEl.createEl("h2", { text: "Exclude settings" });

    new Setting(containerEl)
      .setName("Exclude: Frontmatter")
      .addToggle(t => t
        .setValue(this.plugin.settings.excludeFrontmatter)
        .onChange(async v => { this.plugin.settings.excludeFrontmatter = v; await this.plugin.saveData(this.plugin.settings); })
      );

    new Setting(containerEl)
      .setName("Exclude: fenced code (``` / ~~~)")
      .addToggle(t => t
        .setValue(this.plugin.settings.excludeFencedCode)
        .onChange(async v => { this.plugin.settings.excludeFencedCode = v; await this.plugin.saveData(this.plugin.settings); })
      );

    new Setting(containerEl)
      .setName("Exclude: quotes (lines starting with >)")
      .addToggle(t => t
        .setValue(this.plugin.settings.excludeBlockquotes)
        .onChange(async v => { this.plugin.settings.excludeBlockquotes = v; await this.plugin.saveData(this.plugin.settings); })
      );

    new Setting(containerEl)
      .setName("Exclude: tables (lines starting with |)")
      .addToggle(t => t
        .setValue(this.plugin.settings.excludeTables)
        .onChange(async v => { this.plugin.settings.excludeTables = v; await this.plugin.saveData(this.plugin.settings); })
      );

    new Setting(containerEl)
      .setName("Characters only: remove whitespace")
      .setDesc("Remove spaces, line breaks, tabs, NBSP, zero-width, etc. before counting characters (word count unaffected).")
      .addToggle(t => t
        .setValue(this.plugin.settings.excludeWhitespaceForChars)
        .onChange(async v => { this.plugin.settings.excludeWhitespaceForChars = v; await this.plugin.saveData(this.plugin.settings); })
      );

    containerEl.createEl("h2", { text: "Accessibility" });

    new Setting(containerEl)
      .setName("Status format")
      .setDesc("Tokens: {words}, {chars}")
      .addText(t => t
        .setPlaceholder("Words: {words} | Chars: {chars}")
        .setValue(this.plugin.settings.statusFormat)
        .onChange(async v => {
          this.plugin.settings.statusFormat = v || "Words: {words} | Chars: {chars}";
          await this.plugin.saveData(this.plugin.settings);
        })
      );

    containerEl.createEl("h2", { text: "Advanced" });

    new Setting(containerEl)
      .setName("Custom exclusion regex")
      .setDesc("One pattern per line. /pattern/flags is supported. Example: /<[^>]+>/g")
      .addTextArea(ta => {
        ta.setPlaceholder("/^%%[\\s\\S]*?%%$/gm\n/\\{\\{.+?\\}\\}/g");
        ta.setValue(this.plugin.settings.customExcludeRegexps);
        ta.inputEl.rows = 6;
        ta.onChange(async v => {
          this.plugin.settings.customExcludeRegexps = v;
          await this.plugin.saveData(this.plugin.settings);
      });
    });
  }
}
