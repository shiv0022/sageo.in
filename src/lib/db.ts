// ============================================================
// Database Layer - Supabase + Local JSON Fallback
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Project, Audit, Issue, Report } from "@/types";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import { logger } from "@/lib/logging/logger";

// --- Storage Interface ---

export interface DatabaseAdapter {
  // Projects
  createProject(data: Omit<Project, "id" | "created_at">): Promise<Project>;
  getProject(id: string): Promise<Project | null>;
  listProjects(): Promise<Project[]>;

  // Audits
  createAudit(data: Omit<Audit, "id" | "created_at">): Promise<Audit>;
  getAudit(id: string): Promise<Audit | null>;
  getAuditsByProject(projectId: string): Promise<Audit[]>;
  getLatestAudit(projectId: string): Promise<Audit | null>;

  // Issues
  createIssues(issues: Omit<Issue, "id">[]): Promise<Issue[]>;
  getIssuesByAudit(auditId: string): Promise<Issue[]>;

  // Reports
  createReport(data: Omit<Report, "id" | "created_at">): Promise<Report>;
  getReportsByAudit(auditId: string): Promise<Report[]>;
}

// ============================================================
// Supabase Adapter
// ============================================================

class SupabaseAdapter implements DatabaseAdapter {
  private client: SupabaseClient;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    this.client = createClient(url, key);
  }

  async createProject(data: Omit<Project, "id" | "created_at">): Promise<Project> {
    const { data: project, error } = await this.client
      .from("projects")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.client
      .from("projects")
      .select()
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  async listProjects(): Promise<Project[]> {
    const { data, error } = await this.client
      .from("projects")
      .select()
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async createAudit(data: Omit<Audit, "id" | "created_at">): Promise<Audit> {
    const { data: audit, error } = await this.client
      .from("audits")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return audit;
  }

  async getAudit(id: string): Promise<Audit | null> {
    const { data, error } = await this.client
      .from("audits")
      .select()
      .eq("id", id)
      .single();
    if (error) return null;
    return data;
  }

  async getAuditsByProject(projectId: string): Promise<Audit[]> {
    const { data, error } = await this.client
      .from("audits")
      .select()
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getLatestAudit(projectId: string): Promise<Audit | null> {
    const { data, error } = await this.client
      .from("audits")
      .select()
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    if (error) return null;
    return data;
  }

  async createIssues(issues: Omit<Issue, "id">[]): Promise<Issue[]> {
    const { data, error } = await this.client
      .from("issues")
      .insert(issues)
      .select();
    if (error) throw error;
    return data || [];
  }

  async getIssuesByAudit(auditId: string): Promise<Issue[]> {
    const { data, error } = await this.client
      .from("issues")
      .select()
      .eq("audit_id", auditId)
      .order("priority");
    if (error) throw error;
    return data || [];
  }

  async createReport(data: Omit<Report, "id" | "created_at">): Promise<Report> {
    const { data: report, error } = await this.client
      .from("reports")
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return report;
  }

  async getReportsByAudit(auditId: string): Promise<Report[]> {
    const { data, error } = await this.client
      .from("reports")
      .select()
      .eq("audit_id", auditId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  }
}

// ============================================================
// Local JSON Adapter (Fallback)
// ============================================================

class LocalJsonAdapter implements DatabaseAdapter {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), ".data");
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(collection: string): string {
    return path.join(this.dataDir, `${collection}.json`);
  }

  private read<T>(collection: string): T[] {
    const filePath = this.getFilePath(collection);
    if (!fs.existsSync(filePath)) return [];
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(raw) as T[];
    } catch {
      return [];
    }
  }

  private write<T>(collection: string, data: T[]): void {
    const filePath = this.getFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  async createProject(data: Omit<Project, "id" | "created_at">): Promise<Project> {
    const projects = this.read<Project>("projects");
    const project: Project = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    projects.push(project);
    this.write("projects", projects);
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    const projects = this.read<Project>("projects");
    return projects.find((p) => p.id === id) || null;
  }

  async listProjects(): Promise<Project[]> {
    return this.read<Project>("projects").sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async createAudit(data: Omit<Audit, "id" | "created_at">): Promise<Audit> {
    const audits = this.read<Audit>("audits");
    const audit: Audit = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    audits.push(audit);
    this.write("audits", audits);
    return audit;
  }

  async getAudit(id: string): Promise<Audit | null> {
    const audits = this.read<Audit>("audits");
    return audits.find((a) => a.id === id) || null;
  }

  async getAuditsByProject(projectId: string): Promise<Audit[]> {
    return this.read<Audit>("audits")
      .filter((a) => a.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getLatestAudit(projectId: string): Promise<Audit | null> {
    const audits = await this.getAuditsByProject(projectId);
    return audits[0] || null;
  }

  async createIssues(issues: Omit<Issue, "id">[]): Promise<Issue[]> {
    const allIssues = this.read<Issue>("issues");
    const created = issues.map((issue) => ({
      ...issue,
      id: uuidv4(),
    }));
    allIssues.push(...created);
    this.write("issues", allIssues);
    return created;
  }

  async getIssuesByAudit(auditId: string): Promise<Issue[]> {
    return this.read<Issue>("issues").filter((i) => i.audit_id === auditId);
  }

  async createReport(data: Omit<Report, "id" | "created_at">): Promise<Report> {
    const reports = this.read<Report>("reports");
    const report: Report = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    reports.push(report);
    this.write("reports", reports);
    return report;
  }

  async getReportsByAudit(auditId: string): Promise<Report[]> {
    return this.read<Report>("reports")
      .filter((r) => r.audit_id === auditId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

// ============================================================
// In-Memory Adapter (Production Fallback without Supabase)
// ============================================================

class InMemoryAdapter implements DatabaseAdapter {
  private projects: Project[] = [];
  private audits: Audit[] = [];
  private issues: Issue[] = [];
  private reports: Report[] = [];

  async createProject(data: Omit<Project, "id" | "created_at">): Promise<Project> {
    const project: Project = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.projects.push(project);
    return project;
  }

  async getProject(id: string): Promise<Project | null> {
    return this.projects.find((p) => p.id === id) || null;
  }

  async listProjects(): Promise<Project[]> {
    return [...this.projects].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async createAudit(data: Omit<Audit, "id" | "created_at">): Promise<Audit> {
    const audit: Audit = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.audits.push(audit);
    return audit;
  }

  async getAudit(id: string): Promise<Audit | null> {
    return this.audits.find((a) => a.id === id) || null;
  }

  async getAuditsByProject(projectId: string): Promise<Audit[]> {
    return this.audits
      .filter((a) => a.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getLatestAudit(projectId: string): Promise<Audit | null> {
    const audits = await this.getAuditsByProject(projectId);
    return audits[0] || null;
  }

  async createIssues(issues: Omit<Issue, "id">[]): Promise<Issue[]> {
    const created = issues.map((issue) => ({
      ...issue,
      id: uuidv4(),
    }));
    this.issues.push(...created);
    return created;
  }

  async getIssuesByAudit(auditId: string): Promise<Issue[]> {
    return this.issues.filter((i) => i.audit_id === auditId);
  }

  async createReport(data: Omit<Report, "id" | "created_at">): Promise<Report> {
    const report: Report = {
      ...data,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    this.reports.push(report);
    return report;
  }

  async getReportsByAudit(auditId: string): Promise<Report[]> {
    return this.reports
      .filter((r) => r.audit_id === auditId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}

// ============================================================
// Factory - returns correct adapter based on env
// ============================================================

let _db: DatabaseAdapter | null = null;

export function getDb(): DatabaseAdapter {
  if (_db) return _db;

  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasSupabase) {
    logger.info("[DB] Using Supabase adapter");
    _db = new SupabaseAdapter();
  } else {
    if (process.env.NODE_ENV === "development") {
      logger.info("[DB] Using local JSON adapter (no Supabase credentials found, development mode)");
      _db = new LocalJsonAdapter();
    } else {
      logger.info("[DB] Using in-memory adapter (no Supabase credentials found, production mode)");
      _db = new InMemoryAdapter();
    }
  }

  return _db;
}
