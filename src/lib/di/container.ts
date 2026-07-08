import { IDatabaseAdapter, IFileStorageAdapter, IAIProvider } from "@/lib/interfaces";
import { LocalDatabaseAdapter } from "@/lib/db/local";
import { SupabaseDatabaseAdapter } from "@/lib/db/supabase";
import { LocalStorageAdapter } from "@/lib/storage/local";
import { getSupabaseClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logging/logger";

class DependencyContainer {
  private databaseAdapter: IDatabaseAdapter;
  private fileStorageAdapter: IFileStorageAdapter;
  private aiProviders: Map<string, IAIProvider> = new Map();

  constructor() {
    // Determine database adapter
    const supabaseClient = getSupabaseClient();
    if (supabaseClient) {
      logger.info("[DI] Supabase credentials detected. Initializing SupabaseDatabaseAdapter.");
      this.databaseAdapter = new SupabaseDatabaseAdapter();
    } else {
      logger.info("[DI] Supabase credentials not found. Initializing LocalDatabaseAdapter fallback.");
      this.databaseAdapter = new LocalDatabaseAdapter();
    }

    // Default Storage adapter
    this.fileStorageAdapter = new LocalStorageAdapter();
  }

  // Database injection
  public getDatabaseAdapter(): IDatabaseAdapter {
    return this.databaseAdapter;
  }

  public setDatabaseAdapter(adapter: IDatabaseAdapter): void {
    this.databaseAdapter = adapter;
  }

  // Storage injection
  public getFileStorageAdapter(): IFileStorageAdapter {
    return this.fileStorageAdapter;
  }

  public setFileStorageAdapter(adapter: IFileStorageAdapter): void {
    this.fileStorageAdapter = adapter;
  }

  // AI Provider injection
  public registerAIProvider(name: string, provider: IAIProvider): void {
    this.aiProviders.set(name, provider);
  }

  public getAIProvider(name: string): IAIProvider {
    const provider = this.aiProviders.get(name);
    if (!provider) {
      throw new Error(`AI Provider ${name} is not registered in the DI Container.`);
    }
    return provider;
  }
}

export const container = new DependencyContainer();
