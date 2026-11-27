import { defineMiddleware } from 'astro:middleware';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  "img-src 'self' data: https://gateway.pinata.cloud",
  "connect-src 'self' https://soroban-testnet.stellar.org https://friendbot.stellar.org https://gateway.pinata.cloud",
  "frame-ancestors 'none'",
  "base-uri 'self'",
].join('; ');

export const onRequest = defineMiddleware(async (_contexto, next) => {
  const res = await next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('Content-Security-Policy-Report-Only', CSP);
  return res;
});
