import { IDatabaseAdapter } from "@/lib/interfaces";
import { IAuditDocument } from "@/types/domain";
import { getSupabaseClient } from "@/lib/supabase/client";
import { DatabaseError } from "@/lib/errors/exceptions";
import { logger } from "@/lib/logging/logger";

export class SupabaseDatabaseAdapter implements IDatabaseAdapter {
  private getClient() {
    const client = getSupabaseClient();
    if (!client) {
      throw new DatabaseError("Supabase client is not configured.");
    }
    return client;
  }

  public async writeAudit(doc: IAuditDocument): Promise<void> {
    try {
      const client = this.getClient();
      
      const payload = {
        id: doc.id,
        target_url: doc.targetUrl,
        created_at: doc.createdAt,
        status: doc.status,
        scores: doc.scores,
        context: doc.context,
        intent: doc.intent,
        discovery: doc.discovery,
        recommendations: doc.recommendations
      };

      const { error } = await client
        .from("audits_kb") // Partitioned table matching Knowledge Base pattern
        .upsert(payload);

      if (error) {
        throw error;
      }
      logger.info(`Successfully wrote audit ${doc.id} to Supabase`);
    } catch (error) {
      throw new DatabaseError(`Failed to write audit ${doc.id} to Supabase`, { rawError: error });
    }
  }

  public async readAudit(auditId: string): Promise<IAuditDocument | null> {
    try {
      const client = this.getClient();

      const { data, error } = await client
        .from("audits_kb")
        .select()
        .eq("id", auditId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data) return null;

      return {
        id: data.id,
        targetUrl: data.target_url,
        createdAt: data.created_at,
        status: data.status,
        scores: data.scores,
        context: data.context,
        intent: data.intent,
        discovery: data.discovery,
        recommendations: data.recommendations
      };
    } catch (error) {
      throw new DatabaseError(`Failed to read audit ${auditId} from Supabase`, { rawError: error });
    }
  }

  public async queryAudits(filter: Record<string, any>): Promise<IAuditDocument[]> {
    try {
      const client = this.getClient();

      let query = client.from("audits_kb").select();

      for (const [key, value] of Object.entries(filter)) {
        query = query.eq(key, value);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map((item) => ({
        id: item.id,
        targetUrl: item.target_url,
        createdAt: item.created_at,
        status: item.status,
        scores: item.scores,
        context: item.context,
        intent: item.intent,
        discovery: item.discovery,
        recommendations: item.recommendations
      }));
    } catch (error) {
      throw new DatabaseError("Failed to query audits from Supabase", { rawError: error });
    }
  }

  public async updateJobProgress(jobId: string, progress: number, status: string): Promise<void> {
    try {
      const client = this.getClient();

      const { error } = await client
        .from("job_progress")
        .upsert({
          job_id: jobId,
          progress_percent: progress,
          status_message: status,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }
      logger.debug(`Job ${jobId} progress updated to ${progress}% in Supabase.`);
    } catch (error) {
      throw new DatabaseError(`Failed to update progress for job ${jobId} in Supabase`, { rawError: error });
    }
  }
}
export const supabaseDatabaseAdapter = new SupabaseDatabaseAdapter();
