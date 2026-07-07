-- Auto-generated schema snapshot of the public schema.
-- Source: live database (scripts/dump-schema.mjs).
-- Generated: 2026-07-05T16:01:13.697Z

CREATE TABLE bug_reports (
  id INTEGER NOT NULL DEFAULT nextval('bug_reports_id_seq'::regclass),
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  reproduction_steps TEXT,
  page_url TEXT,
  reporter_name VARCHAR(80),
  status VARCHAR(24) NOT NULL DEFAULT 'open'::character varying,
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

CREATE TABLE company (
  id BIGINT NOT NULL DEFAULT nextval('company_id_seq'::regclass),
  company_name VARCHAR(255) NOT NULL,
  company_description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE company_visited (
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
  id INTEGER NOT NULL DEFAULT nextval('company_visited_id_seq'::regclass),
  job_title VARCHAR(255),
  cgpa_cutoff DOUBLE PRECISION,
  remarks TEXT,
  streams_allowed TEXT,
  tier SMALLINT,
  summer_internship BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

CREATE TABLE feature_requests (
  id INTEGER NOT NULL DEFAULT nextval('feature_requests_id_seq'::regclass),
  title VARCHAR(140) NOT NULL,
  description TEXT NOT NULL,
  requester_name VARCHAR(80),
  status VARCHAR(24) NOT NULL DEFAULT 'open',
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  upvote INTEGER NOT NULL DEFAULT 0,
  downvote INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE student_placed (
  id BIGINT NOT NULL DEFAULT nextval('student_placed_id_seq'::regclass),
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
  job_title VARCHAR(255) NOT NULL DEFAULT ''::character varying,
  internship_fte BOOLEAN NOT NULL DEFAULT false,
  internship_only BOOLEAN NOT NULL DEFAULT false,
  fte_only BOOLEAN NOT NULL DEFAULT false,
  summer_internship BOOLEAN NOT NULL DEFAULT false,
  verdict VARCHAR(16) NOT NULL DEFAULT 'selected'::character varying,
  degree VARCHAR(16) NOT NULL DEFAULT 'CSE'::character varying,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

CREATE TABLE tasks (
  task_id INTEGER NOT NULL DEFAULT nextval('tasks_task_id_seq'::regclass),
  task VARCHAR(255) NOT NULL,
  task_date_added DATE NOT NULL,
  concerned_link VARCHAR(255),
  status TASK_STATUS NOT NULL,
  topic_related VARCHAR(255),
  PRIMARY KEY (task_id)
);
