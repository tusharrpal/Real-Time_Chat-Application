import 'dotenv/config';

const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...configuredOrigins,
]);

// Vercel generates a different URL for branch and preview deployments.
// Keep this scoped to this project's deployment names instead of allowing
// every vercel.app website.
const vercelDeploymentPattern =
  /^https:\/\/real-time-chat-application(?:-[a-z0-9-]+)?\.vercel\.app$/i;

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');
  return allowedOrigins.has(normalizedOrigin) || vercelDeploymentPattern.test(normalizedOrigin);
};

export const corsOrigin = (origin, callback) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin ${origin} is not allowed by CORS`));
};

export const corsOptions = {
  origin: corsOrigin,
  credentials: true,
};
