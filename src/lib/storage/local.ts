import fs from "fs";
import path from "path";
import { IFileStorageAdapter } from "@/lib/interfaces";
import { logger } from "@/lib/logging/logger";
import { BaseError } from "@/lib/errors/exceptions";

export class LocalStorageAdapter implements IFileStorageAdapter {
  private baseDir: string;
  private publicUrlPrefix: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), "public", "reports");
    this.publicUrlPrefix = "/reports";
    this.initStorage();
  }

  private initStorage(): void {
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch (err) {
      logger.error("Could not create local storage directory for files.", err);
    }
  }

  public async uploadFile(key: string, data: Buffer, contentType: string): Promise<string> {
    try {
      const filePath = path.join(this.baseDir, key);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, data);
      logger.info(`File uploaded locally: ${key} (${contentType})`);
      return `${this.publicUrlPrefix}/${key}`;
    } catch (error) {
      throw new BaseError(`Failed to upload file ${key} locally`, { rawError: error });
    }
  }

  public async getDownloadUrl(key: string): Promise<string> {
    const filePath = path.join(this.baseDir, key);
    if (!fs.existsSync(filePath)) {
      throw new BaseError(`File not found: ${key}`);
    }
    return `${this.publicUrlPrefix}/${key}`;
  }

  public async deleteFile(key: string): Promise<void> {
    try {
      const filePath = path.join(this.baseDir, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`File deleted locally: ${key}`);
      }
    } catch (error) {
      throw new BaseError(`Failed to delete file ${key} locally`, { rawError: error });
    }
  }
}
export const localStorageAdapter = new LocalStorageAdapter();
