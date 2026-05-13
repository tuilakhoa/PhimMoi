import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

// Fallback image
const DEFAULT_IMAGE = "https://phim.nguonc.com/public/images/Film/kwPN5eeCEcEh347j7aW8BudNVF4.jpg";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // AVDB Proxy to bypass CORS
  app.get('/api/avdb', async (req, res) => {
    try {
      const url = new URL('https://avdbapi.com/api.php/provide/vod');
      url.searchParams.append('at', 'json');
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString());
      console.log(`AVDB Proxy calling: ${url.toString()} - Status: ${apiRes.status}`);
      if (!apiRes.ok) {
        throw new Error(`AVDB API responded with status: ${apiRes.status}`);
      }
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      console.error("AVDB Proxy Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  let vite: any;

  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Do NOT app.use(vite.middlewares) yet, because we need to intercept index.html requests
  }

  // Intercept requests for movie details and inject meta tags
  app.get('/film/:slug', async (req, res, next) => {
    try {
      const slug = req.params.slug;
      
      // Fetch movie detail from Ophim API
      let movieData: any = null;
      try {
        const apiRes = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);
        if (apiRes.ok) {
          const json = await apiRes.json();
          if (json.status === 'success' || json.status === true) {
            movieData = json.data?.item;
          }
        }
      } catch (err) {
        console.error("Failed to fetch movie data for SEO:", err);
      }

      // Read html template
      let template = '';
      if (process.env.NODE_ENV !== "production") {
        template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
      } else {
        template = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
      }

      // If we have movie data, replace the meta tags
      if (movieData) {
        const title = `Xem phim ${movieData.name || ''} (${movieData.origin_name || ''}) Vietsub Thuyết minh mới nhất | PhimHay`;
        const descriptionRaw = movieData.content || movieData.description || '';
        const description = descriptionRaw.replace(/<[^>]+>/g, '').trim().substring(0, 160) + '...';
        
        let thumb = DEFAULT_IMAGE;
        const domainImage = "https://img.ophim.live";
        if (movieData.poster_url) {
          thumb = movieData.poster_url.startsWith('http') ? movieData.poster_url : `${domainImage}/uploads/movies/${movieData.poster_url}`;
        } else if (movieData.thumb_url) {
          thumb = movieData.thumb_url.startsWith('http') ? movieData.thumb_url : `${domainImage}/uploads/movies/${movieData.thumb_url}`;
        }

        // Keywords
        const genreKeywords = (movieData.category || []).map((c: any) => c.name).join(', ');
        const keywords = `xem phim, xem phim online, phim hay, phim vietsub, phim thuyết minh, ${movieData.name || ''}, ${movieData.origin_name || ''}, ${genreKeywords}`;

        template = template.replace(
          /<title>.*?<\/title>/i, 
          `<title>${title}</title>`
        );
        template = template.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, 
          `<meta name="description" content="${description}">`
        );
        template = template.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, 
          `<meta property="og:title" content="${title}">`
        );
        template = template.replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, 
          `<meta property="og:description" content="${description}">`
        );
        
        // Add image tags
        template = template.replace(
          /<\/head>/,
          `<meta property="og:image" content="${thumb}">
    <meta name="keywords" content="${keywords}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${thumb}">
  </head>`
        );
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (vite) {
        vite.ssrFixStacktrace(e);
      }
      console.log(e.stack);
      next(e);
    }
  });

  // Then apply Vite middleware for all other requests
  if (process.env.NODE_ENV !== "production") {
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false })); // Don't serve index.html automatically here, let the catch-all handle it
    
    // Catch-all for SPA router (non-movie pages)
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
