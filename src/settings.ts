import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import APIBridgePlugin from "./main";

export class APIBridgeSettingTab extends PluginSettingTab {
  plugin: APIBridgePlugin;

  constructor(app: App, plugin: APIBridgePlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "API Bridge Settings" });

    // Port setting
    new Setting(containerEl)
      .setName("Port")
      .setDesc("Port on which the local API server will listen.")
      .addText((text) =>
        text
          .setPlaceholder("27124")
          .setValue(String(this.plugin.settings.port))
          .onChange(async (value) => {
            const port = Number(value);
            if (!isNaN(port)) {
              this.plugin.settings.port = port;
              await this.plugin.saveSettings();
              await this.plugin.reloadServer();
              new Notice(`API server port updated to ${port} and restarted.`);
            }
          })
      );

    // Auth Token setting
    new Setting(containerEl)
      .setName("Auth Token")
      .setDesc("Requests must include this token in the X-API-Token header.")
      .addText((text) =>
        text
          .setPlaceholder("my-secret-token")
          .setValue(this.plugin.settings.authToken)
          .onChange(async (value) => {
            this.plugin.settings.authToken = value.trim();
            await this.plugin.saveSettings();
            new Notice("Auth token updated.");
          })
      );
  }
}
