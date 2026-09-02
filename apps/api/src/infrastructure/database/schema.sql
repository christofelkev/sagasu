-- SAGASU Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(100) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_logo VARCHAR(500),
  location VARCHAR(255) NOT NULL,
  remote BOOLEAN NOT NULL DEFAULT false,
  employment_type VARCHAR(50) NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  responsibilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  nice_to_have JSONB DEFAULT '[]'::jsonb,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  salary JSONB,
  posted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url TEXT NOT NULL,
  source_platform VARCHAR(100) NOT NULL,
  deduplication_sources JSONB DEFAULT '[]'::jsonb,
  match_score INTEGER NOT NULL DEFAULT 0,
  match_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_match_score ON jobs(match_score DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);

CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'default',
  personal JSONB NOT NULL DEFAULT '{}'::jsonb,
  career JSONB NOT NULL DEFAULT '{}'::jsonb,
  experiences JSONB NOT NULL DEFAULT '[]'::jsonb,
  educations JSONB NOT NULL DEFAULT '[]'::jsonb,
  resumes JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS profile_skills (
  id VARCHAR(100) PRIMARY KEY,
  profile_id VARCHAR(100) NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  level VARCHAR(50) NOT NULL,
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profile_skills_profile_id ON profile_skills(profile_id);

CREATE TABLE IF NOT EXISTS applications (
  id VARCHAR(100) PRIMARY KEY,
  job_id VARCHAR(100) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'SAVED',
  status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  prepared_materials JSONB,
  target_submission_date VARCHAR(50),
  applied_date VARCHAR(50),
  salary_expectation VARCHAR(100),
  contact_person JSONB,
  interviews JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

CREATE TABLE IF NOT EXISTS preferences (
  id VARCHAR(100) PRIMARY KEY DEFAULT 'default',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
