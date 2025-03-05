import { App, PluginManifest } from "obsidian";
import APIBridgePlugin, { APIBridgeSettings } from "../src/main";
import { APIBridgeServer } from "../src/apiServer";

describe("APIBridgePlugin", () => {
  let app: App;
  let manifest: PluginManifest;
  let plugin: APIBridgePlugin;

  beforeEach(async () => {
    app = new App();
    manifest = {
      id: "obsidian-api-bridge",
      name: "Obsidian API Bridge",
      version: "0.0.1",
      minAppVersion: "0.0.1",
      description: "A secure local API server plugin that exposes endpoints for reading, writing, and editing your Obsidian notes.",
      author: "Henri Wenlin",
      authorUrl: "https://github.com/Wenlin88",
      isDesktopOnly: true,
    } as PluginManifest;

    plugin = new APIBridgePlugin(app, manifest);
    await plugin.onload();
  });

  afterEach(async () => {
    await plugin.onunload();
  });

  test("should load settings", async () => {
    const defaultSettings: APIBridgeSettings = {
      port: 27124,
      authToken: "my-secret-token",
    };
    expect(plugin.settings).toEqual(defaultSettings);
  });

  test("should start and shutdown the API server", () => {
    const apiServer = plugin["apiServer"] as APIBridgeServer;
    expect(apiServer).not.toBeNull();
    expect(apiServer["server"]).not.toBeNull();

    plugin.onunload();
    expect(apiServer["server"]).toBeNull();
  });

  test("should reload the API server", async () => {
    const apiServer = plugin["apiServer"] as APIBridgeServer;
    const originalServerInstance = apiServer["server"];

    await plugin.reloadServer();
    expect(apiServer["server"]).not.toBe(originalServerInstance);
  });
});
