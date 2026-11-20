// All configuration comes from environment variables (or a local, git-ignored .env file).
export function loadConfig(env = process.env) {
  const defaultEmail = 'patelkishan6214@gmail.com';
  const smtpUser = (env.SMTP_USER || defaultEmail).trim();
  const contactTo = (env.CONTACT_TO || defaultEmail).trim();
  const smtpHost = (env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpPass = env.SMTP_PASS ? env.SMTP_PASS.replace(/\s+/g, '') : undefined;
  const smtpFrom = env.SMTP_FROM && env.SMTP_FROM.includes(smtpUser)
    ? env.SMTP_FROM.trim()
    : `"Kishankumar Patel Portfolio" <${smtpUser}>`;

  return {
    port: Number(env.PORT) || 5080,
    dbPath: env.DB_PATH || './data/portfolio.db',
    corsOrigins: (env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
    trustProxy: env.TRUST_PROXY === 'true',
    contactRateLimit: { windowMs: 10 * 60 * 1000, max: Number(env.CONTACT_RATE_LIMIT) || 5 },
    smtp: {
      host: smtpHost,
      port: Number(env.SMTP_PORT) || 465,
      user: smtpUser,
      pass: smtpPass,
      from: smtpFrom,
      to: contactTo,
    },
  };
}
