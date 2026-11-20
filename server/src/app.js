import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { TAGS } from './data/content.js';
import { validateContact } from './validation/contact.js';
import { asyncHandler, errorHandler, HttpError, notFoundHandler, rateLimit, sendProblem } from './middleware.js';
import { openapi } from './openapi.js';

const TAG_IDS = new Set(TAGS.map((t) => t.id));

/**
 * Builds the Express app. Dependencies are injected so tests can swap them.
 * @param {{ portfolio, contact, db, config, logger? }} deps
 */
export function createApp({ portfolio, contact, db, config, logger = console }) {
  const app = express();
  app.disable('x-powered-by');
  if (config.trustProxy) app.set('trust proxy', 1);

  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
    next();
  });
  app.use(
    '/api',
    cors({
      origin(origin, cb) {
        // Requests without an Origin header (curl, health checks) are allowed.
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`CORS: origin ${origin} is not allowed`));
      },
      methods: ['GET', 'POST'],
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  app.get('/api/health', (req, res) => {
    let dbStatus = 'ok';
    try {
      db.prepare('SELECT 1').get();
    } catch {
      dbStatus = 'error';
    }
    res.status(dbStatus === 'ok' ? 200 : 503).json({ status: dbStatus === 'ok' ? 'healthy' : 'degraded', db: dbStatus });
  });

  app.get('/api/projects', asyncHandler(async (req, res) => {
    const { tag } = req.query;
    if (tag !== undefined && (typeof tag !== 'string' || !TAG_IDS.has(tag))) {
      throw new HttpError(400, 'Bad Request', `Unknown tag. Use one of: ${[...TAG_IDS].join(', ')}`);
    }
    res.json(await portfolio.listProjects(tag));
  }));

  app.get('/api/projects/:id', asyncHandler(async (req, res) => {
    const project = await portfolio.getProject(req.params.id);
    if (!project) throw new HttpError(404, 'Not Found', `Project '${req.params.id}' was not found`);
    res.json(project);
  }));

  app.get('/api/skills', asyncHandler(async (req, res) => res.json(await portfolio.listSkills())));
  app.get('/api/experience', asyncHandler(async (req, res) => res.json(await portfolio.listExperience())));

  app.post(
    '/api/contact',
    rateLimit(config.contactRateLimit),
    asyncHandler(async (req, res) => {
      const result = validateContact(req.body);
      if (!result.success) {
        return sendProblem(res, 400, 'Validation failed', 'One or more fields are invalid', { errors: result.errors });
      }
      const outcome = await contact.submit(result.data, req.ip);
      res.status(202).json(outcome);
    }),
  );

  app.get('/api/openapi.json', (req, res) => res.json(openapi));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapi));

  app.use(notFoundHandler);
  app.use(errorHandler(logger));
  return app;
}
