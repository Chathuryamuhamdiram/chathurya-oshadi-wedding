-- Initial Database Schema for Wedding Platform

-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT,
  external_auth_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'FAMILY_MEMBER', 'COORDINATOR', 'VIEWER')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guests Table
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_code TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  primary_contact_name TEXT,
  whatsapp_number TEXT,
  email TEXT,
  invitation_type TEXT NOT NULL CHECK (invitation_type IN ('INDIVIDUAL', 'FAMILY')),
  allowed_guest_count INTEGER NOT NULL DEFAULT 1,
  confirmed_guest_count INTEGER DEFAULT 0,
  liquor_count INTEGER DEFAULT 0,
  rsvp_status TEXT DEFAULT 'PENDING' CHECK (rsvp_status IN ('PENDING', 'ATTENDING', 'NOT_ATTENDING', 'NOT_SURE')),
  invitation_status TEXT DEFAULT 'NOT_SENT' CHECK (invitation_status IN ('NOT_SENT', 'SHARED', 'RSVP_PENDING', 'CONFIRMED', 'DECLINED')),
  invitation_sent_at TIMESTAMPTZ,
  invitation_last_shared_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_confirmed_count CHECK (confirmed_guest_count >= 0 AND confirmed_guest_count <= allowed_guest_count),
  CONSTRAINT check_liquor_count CHECK (liquor_count >= 0 AND liquor_count <= confirmed_guest_count)
);

CREATE INDEX idx_guests_invitation_code ON guests(invitation_code);
CREATE INDEX idx_guests_whatsapp_number ON guests(whatsapp_number);
CREATE INDEX idx_guests_rsvp_status ON guests(rsvp_status);

-- Budget Categories Table
CREATE TABLE budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Vendors Table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  whatsapp_number TEXT,
  email TEXT,
  service_category TEXT,
  quotation_amount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) DEFAULT 0,
  advance_paid DECIMAL(12,2) DEFAULT 0,
  outstanding_amount DECIMAL(12,2) DEFAULT 0,
  next_payment_due DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_next_payment_due ON vendors(next_payment_due);

-- Budget Items Table
CREATE TABLE budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES budget_categories(id),
  vendor_id UUID REFERENCES vendors(id),
  title TEXT NOT NULL,
  description TEXT,
  estimated_cost DECIMAL(12,2) DEFAULT 0,
  actual_cost DECIMAL(12,2) DEFAULT 0,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  payment_due_date DATE,
  payment_status TEXT DEFAULT 'NOT_STARTED' CHECK (payment_status IN ('NOT_STARTED', 'ADVANCE_PAID', 'PARTIALLY_PAID', 'FULLY_PAID', 'OVERDUE')),
  responsible_user_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_items_payment_due_date ON budget_items(payment_due_date, payment_status);

-- Tasks Table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  assigned_user_id UUID REFERENCES users(id),
  created_by_user_id UUID REFERENCES users(id),
  start_date DATE,
  due_date DATE,
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  status TEXT DEFAULT 'NOT_STARTED' CHECK (status IN ('NOT_STARTED', 'IN_PROGRESS', 'WAITING', 'COMPLETED', 'CANCELLED')),
  reminder_enabled BOOLEAN DEFAULT true,
  escalation_enabled BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_assigned_user_date ON tasks(assigned_user_id, due_date);
CREATE INDEX idx_tasks_status_date ON tasks(status, due_date);

-- Audit Logs Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  before_data JSONB,
  after_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_guests_modtime BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_vendors_modtime BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_budget_items_modtime BEFORE UPDATE ON budget_items FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER update_tasks_modtime BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_modified_column();
