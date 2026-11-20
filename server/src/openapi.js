const problem = { $ref: '#/components/schemas/Problem' };
const json = (schema) => ({ content: { 'application/json': { schema } } });
const problemRes = (description) => ({ description, content: { 'application/problem+json': { schema: problem } } });

export const openapi = {
  openapi: '3.0.3',
  info: { title: 'Kishankumar Patel Portfolio API', version: '1.0.0' },
  servers: [{ url: '/' }],
  paths: {
    '/api/health': {
      get: { summary: 'Health check', responses: { 200: { description: 'OK', ...json({ type: 'object', properties: { status: { type: 'string' }, db: { type: 'string' } } }) } } },
    },
    '/api/projects': {
      get: {
        summary: 'List projects',
        parameters: [{ name: 'tag', in: 'query', schema: { type: 'string', enum: ['backend', 'web', 'data-ml', 'systems', 'testing'] } }],
        responses: { 200: { description: 'Projects', ...json({ type: 'array', items: { $ref: '#/components/schemas/Project' } }) }, 400: problemRes('Unknown tag') },
      },
    },
    '/api/projects/{id}': {
      get: {
        summary: 'Get a project',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project', ...json({ $ref: '#/components/schemas/Project' }) }, 404: problemRes('Not found') },
      },
    },
    '/api/skills': {
      get: { summary: 'List skill categories', responses: { 200: { description: 'Skills', ...json({ type: 'array', items: { $ref: '#/components/schemas/SkillCategory' } }) } } },
    },
    '/api/experience': {
      get: { summary: 'List work experience', responses: { 200: { description: 'Experience', ...json({ type: 'array', items: { $ref: '#/components/schemas/Experience' } }) } } },
    },
    '/api/contact': {
      post: {
        summary: 'Send a contact message',
        requestBody: { required: true, ...json({ $ref: '#/components/schemas/ContactRequest' }) },
        responses: {
          202: { description: 'Accepted', ...json({ type: 'object', properties: { id: { type: 'integer' }, delivered: { type: 'boolean' } } }) },
          400: problemRes('Validation failed'),
          429: problemRes('Rate limited'),
        },
      },
    },
  },
  components: {
    schemas: {
      Problem: { type: 'object', properties: { type: { type: 'string' }, title: { type: 'string' }, status: { type: 'integer' }, detail: { type: 'string' }, errors: { type: 'object', additionalProperties: { type: 'array', items: { type: 'string' } } } } },
      Project: {
        type: 'object',
        properties: {
          id: { type: 'string' }, title: { type: 'string' }, summary: { type: 'string' },
          highlights: { type: 'array', items: { type: 'string' } }, tech: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } }, period: { type: 'string' },
          repoUrl: { type: 'string', nullable: true }, featured: { type: 'boolean' },
        },
      },
      SkillCategory: { type: 'object', properties: { category: { type: 'string' }, items: { type: 'array', items: { type: 'string' } } } },
      Experience: {
        type: 'object',
        properties: { id: { type: 'string' }, role: { type: 'string' }, company: { type: 'string' }, location: { type: 'string' }, period: { type: 'string' }, highlights: { type: 'array', items: { type: 'string' } } },
      },
      ContactRequest: {
        type: 'object',
        required: ['name', 'email', 'message'],
        properties: { name: { type: 'string', minLength: 2, maxLength: 100 }, email: { type: 'string', format: 'email' }, message: { type: 'string', minLength: 10, maxLength: 2000 }, website: { type: 'string', description: 'Honeypot – leave empty' } },
      },
    },
  },
};
