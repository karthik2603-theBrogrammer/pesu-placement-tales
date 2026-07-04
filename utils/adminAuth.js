/**
 * Shared-secret guard for admin API routes.
 * Responds with the appropriate status and returns false when unauthorised.
 */
export function requireAdmin(req, res) {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) {
    res.status(503).json({ error: "Admin token not configured on the server." });
    return false;
  }
  const provided = req.headers["x-admin-token"];
  if (!provided || provided !== configured) {
    res.status(401).json({ error: "Unauthorized." });
    return false;
  }
  return true;
}

/** Reads limit/offset query params with sane bounds. */
export function readPagination(req, { defaultLimit = 5, maxLimit = 50 } = {}) {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), maxLimit);
  const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
  return { limit, offset };
}

/** Resolves the id from a DELETE request (body preferred, query fallback). */
export function readId(req) {
  const source = req.body && Object.keys(req.body).length ? req.body : req.query;
  return parseInt(source.id, 10);
}
