import { Vault, TFile } from "obsidian";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { APIBridgeServer } from "../src/apiServer";
import { APIBridgeSettings } from "../src/main";

describe("APIBridgeServer", () => {
  let vault: Vault;
  let settings: APIBridgeSettings;
  let server: APIBridgeServer;

  beforeEach(() => {
    vault = {
      getFiles: jest.fn(),
      getAbstractFileByPath: jest.fn(),
      read: jest.fn(),
      create: jest.fn(),
      modify: jest.fn(),
    } as unknown as Vault;

    settings = {
      port: 27124,
      authToken: "my-secret-token",
    };

    server = new APIBridgeServer(vault, settings);
  });

  afterEach(() => {
    server.shutdown();
  });

  test("should start and shutdown the server", () => {
    server.start();
    expect(server["server"]).not.toBeNull();
    server.shutdown();
    expect(server["server"]).toBeNull();
  });

  test("should handle unauthorized request", (done) => {
    const req = {
      headers: { "x-api-token": "wrong-token" },
      method: "GET",
      url: "/api/notes",
    } as IncomingMessage;

    const res = {
      writeHead: jest.fn(),
      end: jest.fn(() => {
        expect(res.writeHead).toHaveBeenCalledWith(401, { "Content-Type": "application/json" });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ error: "Unauthorized" }));
        done();
      }),
    } as unknown as ServerResponse;

    server["handleRequest"](req, res);
  });

  test("should list notes", (done) => {
    const req = {
      headers: { "x-api-token": settings.authToken },
      method: "GET",
      url: "/api/notes",
    } as IncomingMessage;

    const res = {
      writeHead: jest.fn(),
      end: jest.fn(() => {
        expect(res.writeHead).toHaveBeenCalledWith(200, { "Content-Type": "application/json" });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ files: [] }));
        done();
      }),
    } as unknown as ServerResponse;

    (vault.getFiles as jest.Mock).mockReturnValue([]);
    server["handleRequest"](req, res);
  });

  test("should read a note", (done) => {
    const req = {
      headers: { "x-api-token": settings.authToken },
      method: "GET",
      url: "/api/notes/test-note",
    } as IncomingMessage;

    const res = {
      writeHead: jest.fn(),
      end: jest.fn(() => {
        expect(res.writeHead).toHaveBeenCalledWith(200, { "Content-Type": "application/json" });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ content: "Note content" }));
        done();
      }),
    } as unknown as ServerResponse;

    const file = { path: "test-note" } as TFile;
    (vault.getAbstractFileByPath as jest.Mock).mockReturnValue(file);
    (vault.read as jest.Mock).mockResolvedValue("Note content");
    server["handleRequest"](req, res);
  });

  test("should write a note", (done) => {
    const req = {
      headers: { "x-api-token": settings.authToken },
      method: "POST",
      url: "/api/notes/test-note",
      on: jest.fn((event, callback) => {
        if (event === "data") {
          callback(JSON.stringify({ content: "New content" }));
        }
        if (event === "end") {
          callback();
        }
      }),
    } as unknown as IncomingMessage;

    const res = {
      writeHead: jest.fn(),
      end: jest.fn(() => {
        expect(res.writeHead).toHaveBeenCalledWith(200, { "Content-Type": "application/json" });
        expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: "File written successfully." }));
        done();
      }),
    } as unknown as ServerResponse;

    const file = { path: "test-note" } as TFile;
    (vault.getAbstractFileByPath as jest.Mock).mockReturnValue(file);
    server["handleRequest"](req, res);
  });
});
