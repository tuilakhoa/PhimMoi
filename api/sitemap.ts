import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStaticRoutes, getAllMovieSlugs, generateSitemapXml, generateSitemapIndexXml } from '../src/services/sitemapService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { type, page } = req.query;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate');

  try {
    if (type === 'static') {
      const routes = getStaticRoutes();
      return res.send(generateSitemapXml(routes));
    }

    if (type === 'movies') {
      const p = parseInt(page as string) || 1;
      const slugs = await getAllMovieSlugs();
      
      const itemsPerPage = 10000; // Smaller chunks for serverless reliability
      const start = (p - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedSlugs = slugs.slice(start, end);

      if (paginatedSlugs.length === 0 && p > 1) {
        return res.status(404).send('Page not found');
      }

      const now = new Date().toISOString();
      const movieUrls = paginatedSlugs.flatMap(slug => [
        { loc: `https://phimtop1.com/film/${slug}`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
        { loc: `https://phimtop1.com/xem-phim/${slug}`, lastmod: now, changefreq: 'weekly', priority: '0.6' }
      ]);

      return res.send(generateSitemapXml(movieUrls));
    }

    // Default: Sitemap Index
    const slugs = await getAllMovieSlugs();
    const itemsPerPage = 10000;
    const totalPages = Math.max(1, Math.ceil(slugs.length / itemsPerPage));
    
    const sitemaps = [
      'https://phimtop1.com/sitemap-static.xml'
    ];

    for (let i = 1; i <= totalPages; i++) {
      sitemaps.push(`https://phimtop1.com/sitemap-movies-${i}.xml`);
    }

    return res.send(generateSitemapIndexXml(sitemaps));
  } catch (error) {
    console.error('Sitemap error:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
