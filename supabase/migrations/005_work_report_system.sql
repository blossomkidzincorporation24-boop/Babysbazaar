-- ==============================================================================
-- BABY'S BAZAAR — MIGRATION 005: DATABASE + WORK REPORT MANAGEMENT SYSTEM
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEAM USERS TABLE (Team Members & Staff)
CREATE TABLE IF NOT EXISTS team_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'manager', 'staff', 'sales', 'inventory', 'delivery')),
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. WORK LOGS TABLE (Individual daily tasks & hour logs)
CREATE TABLE IF NOT EXISTS work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES team_users(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  work_title TEXT NOT NULL,
  work_description TEXT,
  work_category TEXT NOT NULL DEFAULT 'General' CHECK (work_category IN ('Store Operations', 'Customer Support', 'Inventory Management', 'Order Packing & Delivery', 'Catalogue Management', 'Marketing & Social Media', 'General', 'Cleaning & Store Maintenance')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'in_progress', 'pending')),
  start_time TIME,
  end_time TIME,
  total_hours NUMERIC(5, 2) NOT NULL DEFAULT 8.00 CHECK (total_hours >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TASK LOGS TABLE (Assigned tasks and deliverables)
CREATE TABLE IF NOT EXISTS task_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assigned_to UUID REFERENCES team_users(id) ON DELETE SET NULL,
  task_title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. DAILY REPORTS TABLE (Snapshot aggregations)
CREATE TABLE IF NOT EXISTS daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
  total_team_members INTEGER NOT NULL DEFAULT 0,
  members_worked INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  pending_tasks INTEGER NOT NULL DEFAULT 0,
  total_hours NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
  report_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. ACTIVITY LOGS (Ensure module and user_id columns exist)
ALTER TABLE activity_logs 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES team_users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS module TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ DEFAULT now();

-- 6. INDEXES FOR FAST REPORT QUERIES & DEDUPLICATION
CREATE INDEX IF NOT EXISTS idx_work_logs_user_date ON work_logs(user_id, work_date);
CREATE INDEX IF NOT EXISTS idx_work_logs_date ON work_logs(work_date);
CREATE INDEX IF NOT EXISTS idx_work_logs_status ON work_logs(status);
CREATE INDEX IF NOT EXISTS idx_work_logs_category ON work_logs(work_category);
CREATE INDEX IF NOT EXISTS idx_task_logs_assigned ON task_logs(assigned_to);
CREATE INDEX IF NOT EXISTS idx_task_logs_status ON task_logs(status);
CREATE INDEX IF NOT EXISTS idx_task_logs_due_date ON task_logs(due_date);
CREATE INDEX IF NOT EXISTS idx_daily_reports_date ON daily_reports(report_date);
CREATE INDEX IF NOT EXISTS idx_team_users_status ON team_users(status);

-- 7. ENABLE ROW LEVEL SECURITY
ALTER TABLE team_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access team_users') THEN
    CREATE POLICY "Admin full access team_users" ON team_users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access work_logs') THEN
    CREATE POLICY "Admin full access work_logs" ON work_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access task_logs') THEN
    CREATE POLICY "Admin full access task_logs" ON task_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin full access daily_reports') THEN
    CREATE POLICY "Admin full access daily_reports" ON daily_reports FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- 9. INITIAL SEED DATA (Store Team Members)
INSERT INTO team_users (name, email, role, phone, status)
VALUES 
  ('Kavimalar (Store Manager)', 'manager@babysbazaar.shop', 'manager', '+91 84898 24888', 'active'),
  ('Store Staff - Sales & Customer Desk', 'sales@babysbazaar.shop', 'sales', '+91 84898 24888', 'active'),
  ('Inventory & Stock Specialist', 'inventory@babysbazaar.shop', 'inventory', '+91 84898 24888', 'active')
ON CONFLICT (email) DO NOTHING;
