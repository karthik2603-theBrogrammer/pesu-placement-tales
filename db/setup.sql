-- Creates a fresh, empty database for local development.
-- Run once against your own Neon (or any Postgres) database, then load db/seed.sql.
-- db/schema.sql is a snapshot of production for reference and is not meant to be run.

CREATE TABLE IF NOT EXISTS company (
  id BIGSERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_description VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS company_visited (
  id SERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL,
  year BIGINT NOT NULL,
  base_salary DOUBLE PRECISION NOT NULL,
  ctc DOUBLE PRECISION NOT NULL,
  internship_stipend DOUBLE PRECISION NOT NULL,
  girls_only BOOLEAN NOT NULL,
  internship_only BOOLEAN NOT NULL,
  fte_only BOOLEAN NOT NULL,
  internship_fte BOOLEAN NOT NULL,
  total_hired BIGINT NOT NULL,
  males_hired BIGINT NOT NULL,
  females_hired BIGINT NOT NULL,
  job_title VARCHAR(255),
  cgpa_cutoff DOUBLE PRECISION,
  remarks TEXT,
  streams_allowed TEXT,
  tier SMALLINT,
  summer_internship BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS student_placed (
  id BIGSERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  middle_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  company_placed_id BIGINT NOT NULL,
  year_placed BIGINT NOT NULL,
  batch_of BIGINT NOT NULL DEFAULT 2025,
  linkedin_url VARCHAR(255) NOT NULL,
  phone_number VARCHAR(15),
  remarks_markdown TEXT NOT NULL,
  admin_verified BOOLEAN DEFAULT false,
  upvote INTEGER DEFAULT 0,
  downvote INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  job_title VARCHAR(255) NOT NULL DEFAULT '',
  internship_fte BOOLEAN NOT NULL DEFAULT false,
  internship_only BOOLEAN NOT NULL DEFAULT false,
  fte_only BOOLEAN NOT NULL DEFAULT false,
  summer_internship BOOLEAN NOT NULL DEFAULT false,
  verdict VARCHAR(16) NOT NULL DEFAULT 'selected',
  degree VARCHAR(16) NOT NULL DEFAULT 'CSE',
  is_anonymous BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS feature_requests (
  id SERIAL PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  requester_name VARCHAR(80),
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  upvote INTEGER NOT NULL DEFAULT 0,
  downvote INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS bug_reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  reproduction_steps TEXT,
  page_url TEXT,
  reporter_name VARCHAR(80),
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS maintainer_requests (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  batch VARCHAR(20) NOT NULL,
  department VARCHAR(120) NOT NULL,
  degree VARCHAR(120) NOT NULL,
  linkedin_url TEXT NOT NULL,
  email VARCHAR(180) NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
