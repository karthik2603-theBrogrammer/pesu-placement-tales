const FEATURE_REQUEST_SCHEMA = `
  CREATE TABLE IF NOT EXISTS feature_requests (
    id SERIAL PRIMARY KEY,
    title VARCHAR(140) NOT NULL,
    description TEXT NOT NULL,
    requester_name VARCHAR(80),
    status VARCHAR(24) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const BUG_REPORT_SCHEMA = `
  CREATE TABLE IF NOT EXISTS bug_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(140) NOT NULL,
    description TEXT NOT NULL,
    reproduction_steps TEXT,
    page_url TEXT,
    reporter_name VARCHAR(80),
    status VARCHAR(24) NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

const FEEDBACK_INDEXES = {
  feature: `
    CREATE INDEX IF NOT EXISTS feature_requests_created_at_idx
    ON feature_requests (created_at DESC);
  `,
  bug: `
    CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx
    ON bug_reports (created_at DESC);
  `,
};

export const FEEDBACK_TYPES = {
  feature: {
    schema: FEATURE_REQUEST_SCHEMA,
    index: FEEDBACK_INDEXES.feature,
    tableName: "feature_requests",
    listQuery: `
      SELECT id, title, description, requester_name, status, created_at,
             COALESCE(upvote, 0) AS upvote, COALESCE(downvote, 0) AS downvote
      FROM feature_requests
      ORDER BY (COALESCE(upvote, 0) - COALESCE(downvote, 0)) DESC, created_at DESC;
    `,
  },
  bug: {
    schema: BUG_REPORT_SCHEMA,
    index: FEEDBACK_INDEXES.bug,
    tableName: "bug_reports",
    listQuery: `
      SELECT id, title, description, reproduction_steps, page_url, reporter_name, status, created_at
      FROM bug_reports
      ORDER BY created_at DESC;
    `,
  },
};

export async function ensureFeedbackTable(sql, type) {
  const config = FEEDBACK_TYPES[type];
  if (!config) {
    throw new Error("Invalid feedback type.");
  }

  await sql(config.schema);
  await sql(config.index);
}

export function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateRequiredText(value, fieldName, maxLength) {
  const normalizedValue = normalizeText(value);

  if (!normalizedValue) {
    return `${fieldName} is required.`;
  }

  if (normalizedValue.length > maxLength) {
    return `${fieldName} must be ${maxLength} characters or fewer.`;
  }

  return null;
}
