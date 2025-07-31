/*
  # Create Intern Management System Database Schema

  1. New Tables
    - `students` - Student profiles and information
    - `tpos` - Training & Placement Officers
    - `colleges` - College information
    - `job_descriptions` - Job postings and requirements
    - `call_logs` - Call history and transcripts
    - `meetings` - Meeting schedules
    - `offers` - Job offers
    - `interview_panels` - Interview panel members
    - `workflow_steps` - Automated workflow tracking
    - `jotform_responses` - Student applications from JotForm

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  college text NOT NULL,
  course text NOT NULL,
  year integer NOT NULL CHECK (year >= 1 AND year <= 4),
  cgpa decimal(3,2) NOT NULL CHECK (cgpa >= 0 AND cgpa <= 10),
  skills text[] DEFAULT '{}',
  experience text DEFAULT '',
  resume text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'shortlisted', 'selected', 'rejected')),
  applied_positions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TPOs table
CREATE TABLE IF NOT EXISTS tpos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  college text NOT NULL,
  designation text NOT NULL,
  job_descriptions text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Colleges table
CREATE TABLE IF NOT EXISTS colleges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  tpo_contact text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Job descriptions table
CREATE TABLE IF NOT EXISTS job_descriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  description text NOT NULL,
  requirements text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  duration text NOT NULL,
  stipend integer NOT NULL,
  location text NOT NULL,
  type text DEFAULT 'hybrid' CHECK (type IN ('remote', 'onsite', 'hybrid')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'draft', 'closed')),
  tpo_id uuid REFERENCES tpos(id),
  applicants integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Call logs table
CREATE TABLE IF NOT EXISTS call_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id),
  tpo_id uuid REFERENCES tpos(id),
  contact_type text NOT NULL CHECK (contact_type IN ('student', 'tpo')),
  duration integer DEFAULT 0,
  status text DEFAULT 'scheduled' CHECK (status IN ('completed', 'missed', 'scheduled')),
  notes text DEFAULT '',
  transcript jsonb DEFAULT '[]',
  jotform_sent boolean DEFAULT false,
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  mentor_name text NOT NULL,
  mentor_email text NOT NULL,
  scheduled_at timestamptz NOT NULL,
  duration integer NOT NULL,
  meeting_link text NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) NOT NULL,
  job_id uuid REFERENCES job_descriptions(id) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  stipend integer NOT NULL,
  start_date date NOT NULL,
  duration text NOT NULL,
  terms_and_conditions text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Interview panels table
CREATE TABLE IF NOT EXISTS interview_panels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_descriptions(id) NOT NULL,
  panelists jsonb NOT NULL DEFAULT '[]',
  scheduled_date timestamptz,
  meeting_link text,
  created_at timestamptz DEFAULT now()
);

-- Workflow steps table
CREATE TABLE IF NOT EXISTS workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_descriptions(id) NOT NULL,
  step text NOT NULL CHECK (step IN ('tpo_contact', 'jotform_sent', 'applications_received', 'resume_screening', 'shortlist_created', 'interviews_scheduled', 'interviews_completed', 'offers_sent')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- JotForm responses table
CREATE TABLE IF NOT EXISTS jotform_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid REFERENCES job_descriptions(id) NOT NULL,
  student_data jsonb NOT NULL,
  submitted_at timestamptz DEFAULT now(),
  screened boolean DEFAULT false,
  shortlisted boolean DEFAULT false,
  rating decimal(3,1),
  evaluation_notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tpos ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_panels ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE jotform_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can read all data" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert students" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update students" ON students FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all tpos" ON tpos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert tpos" ON tpos FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update tpos" ON tpos FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all colleges" ON colleges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert colleges" ON colleges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update colleges" ON colleges FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all job_descriptions" ON job_descriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert job_descriptions" ON job_descriptions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update job_descriptions" ON job_descriptions FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all call_logs" ON call_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert call_logs" ON call_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update call_logs" ON call_logs FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all meetings" ON meetings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert meetings" ON meetings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update meetings" ON meetings FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all offers" ON offers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert offers" ON offers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update offers" ON offers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all interview_panels" ON interview_panels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert interview_panels" ON interview_panels FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update interview_panels" ON interview_panels FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all workflow_steps" ON workflow_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert workflow_steps" ON workflow_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update workflow_steps" ON workflow_steps FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can read all jotform_responses" ON jotform_responses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert jotform_responses" ON jotform_responses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update jotform_responses" ON jotform_responses FOR UPDATE TO authenticated USING (true);