import { loadConfig } from './config.js';
import { openDatabase } from './data/db.js';
import { createPortfolioService } from './services/portfolioService.js';
import { createContactService } from './services/contactService.js';
import { createEmailSender } from './services/emailSender.js';
import { createApp } from './app.js';

const config = loadConfig();
const db = openDatabase(config.dbPath);
const app = createApp({
  db,
  config,
  portfolio: createPortfolioService(db),
  contact: createContactService({ db, emailSender: createEmailSender(config.smtp) }),
});

const server = app.listen(config.port, () => {
  console.log(`API listening on http://localhost:${config.port}  (docs: /api/docs)`);
  if (config.smtp?.user) {
    console.log(`SMTP configured: sending via ${config.smtp.user} -> delivering to ${config.smtp.to}`);
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => { db.close(); process.exit(0); }));
}
