declare module "xmldom" {
  export class DOMParser {
    constructor(options?: {
      locator?: unknown;
      errorHandler?: {
        warning?: (message: string) => void;
        error?: (message: string) => void;
        fatalError?: (message: string) => void;
      };
    });

    parseFromString(source: string, mimeType: string): Document;
  }
}
