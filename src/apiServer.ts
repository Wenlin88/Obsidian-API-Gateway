import { Vault, TFile } from "obsidian";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { APIBridgeSettings } from "./main";

export class APIBridgeServer {
  private server: ReturnType<typeof createServer> | null = null;
  private vault: Vault;
  private settings: APIBridgeSettings;

  constructor(vault: Vault, settings: APIBridgeSettings) {
    this.vault = vault;
    this.settings = settings;
  }

  start() {
    // Close any existing server
    this.shutdown();
    this.server = createServer((req: IncomingMessage, res: ServerResponse) =>
      this.handleRequest(req, res)
    );
    this.server.listen(this.settings.port, () => {
      console.log(`API Bridge server listening on port ${this.settings.port}`);
    });
  }

  shutdown() {
    if (this.server) {
      try {
        this.server.close();
        console.log("API Bridge server closed.");
      } catch (err) {
        console.error("Error closing server:", err);
      }
      this.server = null;
    }
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse) {
    try {
      if (!this.isAuthorized(req)) {
        this.unauthorizedResponse(res);
        return;
      }

      const url = new URL(req.url ?? "", `http://${req.headers.host}`);
      const method = req.method?.toUpperCase() || "GET";
      const pathParts = url.pathname.split("/").filter(Boolean);

      // GET /api/notes → list all notes
      if (method === "GET" && pathParts.length === 2) {
        this.listNotes(res);
        return;
      }

      // GET /api/notes/<filePath> → read a note
      if (method === "GET" && pathParts.length === 3) {
        const filePath = decodeURIComponent(pathParts[2]);
        this.readNote(filePath, res);
        return;
      }

      // POST /api/notes/<filePath> → write (create or overwrite) a note
      if (method === "POST" && pathParts.length === 3) {
        let bodyData = "";
        req.on("data", (chunk) => { bodyData += chunk; });
        req.on("end", () => {
          try {
            const parsedBody = JSON.parse(bodyData);
            this.writeNote(decodeURIComponent(pathParts[2]), parsedBody, res);
          } catch (err) {
            this.internalErrorResponse(res, err as Error);
          }
        });
        return;
      }

      this.notFoundResponse(res);
    } catch (err) {
      console.error("Server error:", err);
      this.internalErrorResponse(res, err as Error);
    }
  }

  private isAuthorized(req: IncomingMessage): boolean {
    const token = req.headers["x-api-token"];
    return token === this.settings.authToken;
  }

  private listNotes(res: ServerResponse) {
    try {
      const files = this.vault.getFiles();
      const fileList = files.map((file) => ({
        path: file.path,
        name: file.name,
      }));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ files: fileList }));
    } catch (err) {
      this.internalErrorResponse(res, err as Error);
    }
  }

  private async readNote(filePath: string, res: ServerResponse) {
    try {
      const file = this.vault.getAbstractFileByPath(filePath);
      if (!file || !(file instanceof TFile)) {
        this.notFoundResponse(res);
        return;
      }
      const content = await this.vault.read(file);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ content }));
    } catch (err) {
      this.internalErrorResponse(res, err as Error);
    }
  }

  private async writeNote(filePath: string, body: any, res: ServerResponse) {
    try {
      const { content } = body ?? {};
      if (typeof content !== "string") {
        this.badRequestResponse(res, 'Missing "content" string in request body.');
        return;
      }
      let file = this.vault.getAbstractFileByPath(filePath);
      if (!file) {
        file = await this.vault.create(filePath, content);
      } else if (!(file instanceof TFile)) {
        this.badRequestResponse(res, "Path refers to a folder, not a file.");
        return;
      } else {
        await this.vault.modify(file, content);
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "File written successfully." }));
    } catch (err) {
      this.internalErrorResponse(res, err as Error);
    }
  }

  private badRequestResponse(res: ServerResponse, message: string) {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }

  private notFoundResponse(res: ServerResponse) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }

  private unauthorizedResponse(res: ServerResponse) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized" }));
  }

  private internalErrorResponse(res: ServerResponse, err: Error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: err.message }));
  }
}
