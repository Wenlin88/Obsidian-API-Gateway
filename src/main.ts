import { App, Notice, Plugin } from "obsidian";
import { APIBridgeServer } from "./apiServer";
import { APIBridgeSettingTab } from "./settings";

export interface APIBridgeSettings {
  port: number;
  authToken: string;
}

const DEFAULT_SETTINGS: APIBridgeSettings = {
  port: 27124,
  authToken: "my-secret-token",
};

export default class APIBridgePlugin extends Plugin {
  settings: APIBridgeSettings;
  private apiServer: APIBridgeServer;

  async onload() {
    console.log("Loading API Bridge Plugin...");
    await this.loadSettings();

    // Initialize and start the API server
    this.apiServer = new APIBridgeServer(this.app.vault, this.settings);
    this.apiServer.start();

    // Add the settings tab
    this.addSettingTab(new APIBridgeSettingTab(this.app, this));

    // Add a command to reload the server
    this.addCommand({
      id: "reload-api-bridge-server",
      name: "Reload API Bridge Server",
      callback: async () => {
        await this.reloadServer();
        new Notice("API Bridge server reloaded.");
      },
    });
  }

  async onunload() {
    console.log("Unloading API Bridge Plugin...");
    this.apiServer.shutdown();
  }

  async loadSettings() {
    const data = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async reloadServer() {
    this.apiServer.shutdown();
    this.apiServer = new APIBridgeServer(this.app.vault, this.settings);
    this.apiServer.start();
  }
}
