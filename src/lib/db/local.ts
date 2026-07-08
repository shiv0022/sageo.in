import fs from "fs";
import path from "path";
import { IDatabaseAdapter } from "@/lib/interfaces";
import { IAuditDocument } from "@/types/domain";
import { DatabaseError } from "@/lib/errors/exceptions";
import { logger } from "@/lib/logging/logger";

export class LocalDatabaseAdapter implements IDatabaseAdapter {
  private memoryDb: Map<string, IAuditDocument> = new Map();
  private jobStates: Map<string, { progress: number; status: string }> = new Map();
  private storageDir: string;

  constructor() {
    this.storageDir = path.join(process.cwd(), ".data", "audits");
    this.initStorage();
  }

  private initStorage(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
      }
    } catch (err) {
      logger.warn("Could not create local storage directory for audits. Falling back to in-memory mode.", err);
    }
  }

  private getFilePath(auditId: string): string {
    return path.join(this.storageDir, `${auditId}.json`);
  }

  public async writeAudit(doc: IAuditDocument): Promise<void> {
    try {
      // In-memory backup
      this.memoryDb.set(doc.id, doc);

      // File System backup
      if (fs.existsSync(this.storageDir)) {
        const filePath = this.getFilePath(doc.id);
        fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf8");
        logger.info(`Successfully wrote audit ${doc.id} to local filesystem.`);
      }
    } catch (error) {
      throw new DatabaseError(`Failed to write audit ${doc.id} to database.`, { rawError: error });
    }
  }

  public async readAudit(auditId: string): Promise<IAuditDocument | null> {
    try {
      // Try memory first
      if (this.memoryDb.has(auditId)) {
        return this.memoryDb.get(auditId) || null;
      }

      // Try file system
      const filePath = this.getFilePath(auditId);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        const doc = JSON.parse(raw) as IAuditDocument;
        this.memoryDb.set(auditId, doc); // Cache in memory
        return doc;
      }

      return null;
    } catch (error) {
      throw new DatabaseError(`Failed to read audit ${auditId} from database.`, { rawError: error });
    }
  }

  public async queryAudits(filter: Record<string, any>): Promise<IAuditDocument[]> {
    try {
      const audits: IAuditDocument[] = [];

      // Scan file system if available
      if (fs.existsSync(this.storageDir)) {
        const files = fs.readdirSync(this.storageDir);
        for (const file of files) {
          if (file.endsWith(".json")) {
            const filePath = path.join(this.storageDir, file);
            try {
              const raw = fs.readFileSync(filePath, "utf8");
              const doc = JSON.parse(raw) as IAuditDocument;
              audits.push(doc);
            } catch (err) {
              logger.warn(`Failed to parse audit file: ${file}`, err);
            }
          }
        }
      } else {
        // Use memory db
        audits.push(...Array.from(this.memoryDb.values()));
      }

      // Simple filter matching
      return audits.filter((audit) => {
        for (const [key, value] of Object.entries(filter)) {
          if ((audit as any)[key] !== value) {
            return false;
          }
        }
        return true;
      });
    } catch (error) {
      throw new DatabaseError("Failed to query audits from local database.", { rawError: error });
    }
  }

  public async updateJobProgress(jobId: string, progress: number, status: string): Promise<void> {
    try {
      this.jobStates.set(jobId, { progress, status });
      logger.debug(`Job ${jobId} progress updated to ${progress}%: ${status}`);
    } catch (error) {
      throw new DatabaseError(`Failed to update progress for job ${jobId}`, { rawError: error });
    }
  }

  public getJobState(jobId: string): { progress: number; status: string } | null {
    return this.jobStates.get(jobId) || null;
  }
}
