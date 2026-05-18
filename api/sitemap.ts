import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getStaticRoutes, getMovieSlugsTotalPages, getMovieSlugsForSitemap, generateSitemapXml, generateSitemapIndexXml } from '../src/services/sitemapService.js';

// We process fewer items per sitemap file to keep Serverless time well under 10 seconds.
// 500 items = ~21 API pages = 1 batch. This will run in ~1-2 seconds!
const ITEMS_PER_SITEMAP = 500;

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
      const slugs = await getMovieSlugsForSitemap(page, ITEMS_PER_SITEMAP);
      
      if (slugs.length === 0) {
        return res.status(404).send('Not found');
      }

      const now = new Date().toISOString();
      // Each slug generates 2 URLs, so max 1000 URLs per sub-sitemap file, very optimal.
      const movieUrls = slugs.flatMap(slug => [
        { loc: `https://phimtop1.com/film/${slug}`, lastmod: now, changefreq: 'weekly', priority: '0.6' },
        { loc: `https://phimtop1.com/xem-phim/${slug}`, lastmod: now, changefreq: 'weekly', priority: '0.6' }
      ]);

      return res.send(generateSitemapXml(movieUrls));
    }

    // Default: Sitemap Index
    const totalPages = await getMovieSlugsTotalPages(ITEMS_PER_SITEMAP);
    
    const sitemaps = [
      'https://phimtop1.com/sitemap-static.xml'
    ];

    // Don't generate too many (e.g. limit to 100 max for overall sanity, ~50,000 movies)
    const limitedPages = Math.min(totalPages, 100);
    for (let i = 1; i <= limitedPages; i++) {
      sitemaps.push(`https://phimtop1.com/sitemap-movies-${i}.xml`);
    }

    return res.send(generateSitemapIndexXml(sitemaps));
  } catch (error) {
    console.error('Sitemap error:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
