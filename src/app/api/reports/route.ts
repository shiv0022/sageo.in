import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const projects = await db.listProjects();
    
    if (projects.length === 0) {
      return NextResponse.json([]);
    }

    // Get reports from latest project
    const latestProject = projects[0];
    const latestAudit = await db.getLatestAudit(latestProject.id);

    if (!latestAudit) {
      return NextResponse.json([]);
    }

    const reports = await db.getReportsByAudit(latestAudit.id);
    return NextResponse.json(reports);
  } catch (error) {
    console.error("[API] Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
