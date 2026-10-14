-- Fake sample data for local development. Every person, number and story here is made up.
-- Load after db/setup.sql. Safe to re-run: it clears these tables first.

TRUNCATE company, company_visited, student_placed, feature_requests, bug_reports, maintainer_requests
  RESTART IDENTITY;

INSERT INTO company (company_name, company_description) VALUES
  ('Acme Cloud', 'Cloud infrastructure and developer tooling'),
  ('Globex Payments', 'Digital payments and fintech platform'),
  ('Initech Systems', 'Enterprise software and analytics');

INSERT INTO company_visited (
  company_id, year, job_title, base_salary, ctc, internship_stipend,
  girls_only, internship_only, fte_only, internship_fte, summer_internship,
  total_hired, males_hired, females_hired, cgpa_cutoff, tier, streams_allowed, remarks
) VALUES
  (1, 2025, 'Software Engineer',  18.0, 30.0, 80000, false, false, false, true,  false, 6, 4, 2, 7.5, 1, 'CSE, ECE', 'Online test, two technical rounds, one HR round'),
  (2, 2025, 'Backend Engineer',   14.0, 22.0, 60000, false, false, true,  false, false, 4, 3, 1, 7.0, 1, 'CSE',      'DSA heavy coding test'),
  (3, 2024, 'Data Analyst Intern', 0.0,  0.0, 40000, false, true,  false, false, false, 3, 1, 2, 6.5, 2, 'CSE, AIML', 'SQL and aptitude test');

INSERT INTO student_placed (
  first_name, middle_name, last_name, company_placed_id, year_placed, batch_of,
  linkedin_url, phone_number, remarks_markdown, job_title, verdict, degree,
  internship_fte, internship_only, fte_only, summer_internship, is_anonymous, upvote, downvote
) VALUES
  ('Asha', '', 'Rao', 1, 2025, 2025, 'https://www.linkedin.com/in/example-asha', NULL,
   E'## Rounds\n\n- **Online test:** 2 medium DSA questions in 90 minutes\n- **Technical 1:** Graphs and system design basics\n- **HR:** Projects and teamwork\n\n## Tips\n\n- Practise explaining your approach out loud',
   'Software Engineer', 'selected', 'CSE', true, false, false, false, false, 12, 1),
  ('John', '', 'Doe', 2, 2025, 2025, '', NULL,
   E'## Rounds\n\n- **Online test:** 3 DSA questions\n- **Technical 1:** Low-level design of a payment ledger\n\n## Tips\n\n- Revise SQL joins and indexing',
   'Backend Engineer', 'rejected', 'ECE', false, false, true, false, true, 5, 0),
  ('Rahul', 'K', 'Menon', 3, 2024, 2025, 'https://www.linkedin.com/in/example-rahul', NULL,
   E'## Rounds\n\n- **Aptitude + SQL test**\n- **Case study interview**\n\n## Tips\n\n- Know window functions',
   'Data Analyst Intern', 'selected', 'AIML', false, true, false, false, false, 3, 0);

INSERT INTO feature_requests (title, description, requester_name, status, upvote) VALUES
  ('Dark mode', 'A dark theme for late-night prep sessions.', 'Sample User', 'under_consideration', 4),
  ('Filter by CGPA cutoff', 'Let me filter companies by their CGPA cutoff.', NULL, 'open', 2);

INSERT INTO bug_reports (title, description, reproduction_steps, page_url, reporter_name, status) VALUES
  ('Search box loses focus', 'Typing quickly in search drops characters.', E'1. Open home page\n2. Type fast', '/', 'Sample User', 'open');
