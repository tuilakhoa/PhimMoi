import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');
  
  res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /api-mobile/
Disallow: /watch/

Sitemap: https://phimtop1.com/sitemap.xml`);
}
