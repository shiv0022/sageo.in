-- ==============================================================================
-- SEO Intelligence Platform — Supabase Database Schema & Storage Setup
-- ==============================================================================
-- Run this script in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → Paste & Run
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Projects Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  website_url TEXT NOT NULL,
  competitor_url TEXT,
  github_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for listing projects by creation date
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- ------------------------------------------------------------------------------
-- 2. Audits Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  seo_score INTEGER DEFAULT 0 NOT NULL,
  aeo_score INTEGER DEFAULT 0 NOT NULL,
  geo_score INTEGER DEFAULT 0 NOT NULL,
  access_score INTEGER DEFAULT 0 NOT NULL,
  lighthouse_scores JSONB DEFAULT '{}'::jsonb,
  technology_stack JSONB DEFAULT '{}'::jsonb,
  website_understanding JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for querying audits by project and latest audit lookup
CREATE INDEX IF NOT EXISTS idx_audits_project_id ON public.audits(project_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. Issues Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  impact TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  confidence INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fetching issues by audit
CREATE INDEX IF NOT EXISTS idx_issues_audit_id ON public.issues(audit_id);

-- ------------------------------------------------------------------------------
-- 4. Reports Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID NOT NULL REFERENCES public.audits(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fetching reports by audit
CREATE INDEX IF NOT EXISTS idx_reports_audit_id ON public.reports(audit_id);

-- ------------------------------------------------------------------------------
-- 5. Row Level Security (RLS) & Access Policies
-- ------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access (Anon key)
CREATE POLICY "Allow public select on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public insert on projects" ON public.projects FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on audits" ON public.audits FOR SELECT USING (true);
CREATE POLICY "Allow public insert on audits" ON public.audits FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on issues" ON public.issues FOR SELECT USING (true);
CREATE POLICY "Allow public insert on issues" ON public.issues FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select on reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Allow public insert on reports" ON public.reports FOR INSERT WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. Storage Setup (PDF Reports Bucket)
-- ------------------------------------------------------------------------------
-- Create public storage bucket for PDF reports if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Public Storage Access Policies
CREATE POLICY "Public Read Access for Reports Bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'reports');

CREATE POLICY "Public Insert Access for Reports Bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'reports');
