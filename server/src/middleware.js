// RFC 7807 problem details helpers and small middleware.

export class HttpError extends Error {
  constructor(status, title, detail, extra = {}) {
    super(detail || title);
    this.status = status;
    this.title = title;
    this.extra = extra;
  }
}

export function sendProblem(res, status, title, detail, extra = {}) {
  res
    .status(status)
    .type('application/problem+json')
    .json({ type: 'about:blank', title, status, ...(detail ? { detail } : {}), ...extra });
}

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFoundHandler(req, res) {
  sendProblem(res, 404, 'Not Found', `No route for ${req.method} ${req.path}`);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(logger) {
  return (err, req, res, _next) => {
    if (err instanceof HttpError) return sendProblem(res, err.status, err.title, err.message, err.extra);
    if (err.type === 'entity.parse.failed') return sendProblem(res, 400, 'Bad Request', 'Malformed JSON body');
    if (err.type === 'entity.too.large') return sendProblem(res, 413, 'Payload Too Large');
    if (err.message?.startsWith('CORS')) return sendProblem(res, 403, 'Forbidden', err.message);
    logger.error(err);
    sendProblem(res, 500, 'Internal Server Error', 'An unexpected error occurred');
  };
}

/** Fixed-window in-memory rate limiter keyed by client IP. */
export function rateLimit({ windowMs, max, now = () => Date.now() }) {
  const hits = new Map();
  return (req, res, next) => {
    const t = now();
    const key = req.ip ?? 'unknown';
    let entry = hits.get(key);
    if (!entry || t >= entry.reset) {
      entry = { count: 0, reset: t + windowMs };
      hits.set(key, entry);
    }
    entry.count++;
    if (hits.size > 10_000) for (const [k, v] of hits) if (t >= v.reset) hits.delete(k);
    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - t) / 1000)));
      return sendProblem(res, 429, 'Too Many Requests', 'Please wait a few minutes before sending another message.');
    }
    next();
  };
}
