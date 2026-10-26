-- ====================================================================
-- SEMS - APEX SPORTS MANAGEMENT SYSTEM
-- PostgreSQL Unified Production Database Schema
-- ====================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(64) PRIMARY KEY,
  roll_number VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  college VARCHAR(128) DEFAULT 'MPGI',
  gender VARCHAR(16) NOT NULL DEFAULT 'Male',
  residency VARCHAR(32) NOT NULL DEFAULT 'Hosteller', -- 'Hosteller' or 'Day Scholar'
  hostel_name VARCHAR(128),
  room_number VARCHAR(64),
  phone VARCHAR(32),
  sports JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_students_roll ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_residency ON students(residency);

-- 2. EQUIPMENT TABLE
CREATE TABLE IF NOT EXISTS equipment (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  sport VARCHAR(64) NOT NULL,
  category VARCHAR(64) NOT NULL,
  total_quantity INTEGER NOT NULL DEFAULT 1,
  available_quantity INTEGER NOT NULL DEFAULT 1,
  issued_quantity INTEGER NOT NULL DEFAULT 0,
  condition VARCHAR(32) DEFAULT 'Good',
  location VARCHAR(128) DEFAULT 'Hostel Sports Store Bay',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipment_sport ON equipment(sport);
CREATE INDEX IF NOT EXISTS idx_equipment_available ON equipment(available_quantity);

-- 3. EQUIPMENT LOANS TABLE
CREATE TABLE IF NOT EXISTS loans (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64),
  student_name VARCHAR(128) NOT NULL,
  student_roll VARCHAR(64) NOT NULL,
  residency VARCHAR(32) DEFAULT 'Hosteller',
  hostel_name VARCHAR(128),
  room_number VARCHAR(64),
  phone VARCHAR(32),
  equipment_id VARCHAR(64),
  equipment_name VARCHAR(128) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expected_return TIMESTAMP WITH TIME ZONE,
  is_flexible_return BOOLEAN DEFAULT false,
  returned_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(32) NOT NULL DEFAULT 'Active', -- 'Active', 'Overdue', 'Returned'
  return_condition VARCHAR(32),
  notes TEXT,
  handover_photo_url TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_student_id ON loans(student_id);
CREATE INDEX IF NOT EXISTS idx_loans_equipment_id ON loans(equipment_id);

-- 4. ATTENDANCE SESSIONS TABLE
CREATE TABLE IF NOT EXISTS attendance_sessions (
  id VARCHAR(64) PRIMARY KEY,
  date DATE NOT NULL,
  sport VARCHAR(64) NOT NULL,
  session_time VARCHAR(64) NOT NULL, -- 'Morning (06:00 AM - 08:30 AM)' or 'Evening (04:30 PM - 07:00 PM)'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_session UNIQUE (date, sport, session_time)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date_sport ON attendance_sessions(date, sport);

-- 5. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS attendance_records (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  student_id VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'Absent', -- 'Present', 'Absent', 'Late'
  remark TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_student_session UNIQUE (session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_records_session_id ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_records_student_id ON attendance_records(student_id);

-- 6. DAY SCHOLAR GATE PASSES TABLE
CREATE TABLE IF NOT EXISTS day_scholar_passes (
  id VARCHAR(64) PRIMARY KEY,
  pass_code VARCHAR(64),
  gate_number VARCHAR(128),
  gate_location VARCHAR(128),
  guard_name VARCHAR(128),
  guard_phone VARCHAR(32),
  status VARCHAR(32) DEFAULT 'Authorized',
  issued_by VARCHAR(128) DEFAULT 'Sports Admin',
  authorized_by VARCHAR(128) DEFAULT 'Sports Admin',
  authorized_students JSONB DEFAULT '[]'::jsonb,
  students JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  date VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_passes_created ON day_scholar_passes(created_at DESC);
