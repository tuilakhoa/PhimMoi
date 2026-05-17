import express from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer } from "vite";

// Fallback image
const DEFAULT_IMAGE = "https://phim.nguonc.com/public/images/Film/kwPN5eeCEcEh347j7aW8BudNVF4.jpg";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Hỗ trợ CORS cho Mobile App
  const cors = (await import('cors')).default;
  app.use(cors());

  // API cho Mobile App
  const { mobileRouter } = await import('./src/api-mobile/routes.js');
  app.use('/api/app', mobileRouter);

  // OPhim Proxy
  app.get('/api/ophim-movies/*', async (req, res) => {
    try {
      const apiPath = req.params[0];
      const url = new URL(`https://ophim1.com/v1/api/${apiPath}`);
      
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!apiRes.ok) return res.status(apiRes.status).send(await apiRes.text());
      res.json(await apiRes.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // TopXX Proxy to bypass CORS (replacing old AVDB)
  app.get('/api/topxx-movies/*', async (req, res) => {
    try {
      const apiPath = req.params[0];
      const url = new URL(`https://topxx.vip/api/v1/${apiPath}`);
      
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      console.log(`TopXX Proxy calling: ${url.toString()} - Status: ${apiRes.status}`);
      
      if (!apiRes.ok) {
        let errorText = '';
        try {
          errorText = await apiRes.text();
        } catch (e) {}
        
        if (apiRes.status === 404) {
          console.error(`TopXX API Info: Endpoint not found (${url.toString()})`);
          return res.status(404).json({ error: 'Endpoint not found', data: [], items: [] });
        }
        
        console.error(`TopXX API Error (${apiRes.status}):`, errorText.substring(0, 200) + (errorText.length > 200 ? '...' : ''));
        return res.status(apiRes.status).send(errorText);
      }
      
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      console.error("TopXX Proxy Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Nguonc Proxy
  app.get('/api/nguonc-movies/*', async (req, res) => {
    try {
      const apiPath = req.params[0];
      const url = new URL(`https://phim.nguonc.com/api/${apiPath}`);
      
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString(), {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!apiRes.ok) return res.status(apiRes.status).send(await apiRes.text());
      res.json(await apiRes.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // XXVN Proxy
  app.get('/api/xxvn-movies/*', async (req, res) => {
    try {
      const apiPath = req.params[0];
      const url = new URL(`https://www.xxvnapi.com/api/${apiPath}`);
      
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString(), {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.xxvnapi.com/'
        }
      });
      
      if (!apiRes.ok) return res.status(apiRes.status).send(await apiRes.text());
      res.json(await apiRes.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // VSPhim Proxy
  app.get('/api/vsphim-movies/*', async (req, res) => {
    try {
      const apiPath = req.params[0];
      const url = new URL(`https://nguon.vsphim.com/api/${apiPath}`);
      
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString(), {
        headers: { 
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://nguon.vsphim.com/'
        }
      });
      
      if (!apiRes.ok) return res.status(apiRes.status).send(await apiRes.text());
      res.json(await apiRes.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Cosplay Proxy to bypass CORS
  app.get('/api/cosplay/*', async (req, res) => {
    try {
      const apiPath = req.params[0];
      const url = new URL(`https://cosplaytele.com/wp-json/wp/v2/${apiPath}`);
      
      Object.keys(req.query).forEach(key => {
        if (req.query[key]) {
          url.searchParams.append(key, req.query[key] as string);
        }
      });
      
      const apiRes = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (!apiRes.ok) {
        const errorText = await apiRes.text();
        return res.status(apiRes.status).send(errorText);
      }
      
      const data = await apiRes.json();
      
      // Forward pagination headers from WordPress
      const total = apiRes.headers.get('x-wp-total');
      const totalPages = apiRes.headers.get('x-wp-totalpages');
      if (total) res.setHeader('x-wp-total', total);
      if (totalPages) res.setHeader('x-wp-totalpages', totalPages);
      
      res.json(data);
    } catch (err: any) {
      console.error("Cosplay Proxy Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // --- API v1 for Crawlers ---
  
  // 1. Movie List (Ophim based)
  app.get('/api/v1/movies', async (req, res) => {
    try {
      const page = req.query.page || '1';
      const apiRes = await fetch(`https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`);
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 2. Movie Details
  app.get('/api/v1/movies/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      const apiRes = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 3. Adult Movies (TopXX based)
  app.get('/api/v1/adult/movies', async (req, res) => {
    try {
      const page = req.query.page || '1';
      const apiRes = await fetch(`https://topxx.vip/api/v1/movies?page=${page}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 3.1. Adult Movie Details (TopXX)
  app.get('/api/v1/adult/movies/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const apiRes = await fetch(`https://topxx.vip/api/v1/movies/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 6. Search Movies (Ophim based)
  app.get('/api/v1/search', async (req, res) => {
    try {
      const keyword = req.query.keyword || '';
      const limit = req.query.limit || '10';
      const apiRes = await fetch(`https://ophim1.com/v1/api/tim-kiem?keyword=${keyword}&limit=${limit}`);
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 4. Cosplay Albums
  app.get('/api/v1/cosplay/albums', async (req, res) => {
    try {
      const page = req.query.page || '1';
      const apiRes = await fetch(`https://cosplaytele.com/wp-json/wp/v2/posts?page=${page}&per_page=20`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      
      // Map to a cleaner structure for crawlers
      const albums = data.map((post: any) => ({
        id: post.id,
        title: post.title.rendered,
        slug: post.slug,
        date: post.date,
        link: `/cosplay/${post.slug}`,
        thumbnail: post.jetpack_featured_media_url || post.yoast_head_json?.og_image?.[0]?.url
      }));
      
      res.json({
        status: 'success',
        total: apiRes.headers.get('x-wp-total'),
        pages: apiRes.headers.get('x-wp-totalpages'),
        items: albums
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 5. Cosplay Album Details
  app.get('/api/v1/cosplay/albums/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const apiRes = await fetch(`https://cosplaytele.com/wp-json/wp/v2/posts/${id}`, {
        headers: { 'Accept': 'application/json' }
      });
      if (!apiRes.ok) throw new Error('Source API error');
      const data = await apiRes.json();
      
      res.json({
        status: 'success',
        id: data.id,
        title: data.title.rendered,
        content: data.content.rendered,
        date: data.date,
        thumbnail: data.jetpack_featured_media_url
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
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

  // --- Dynamic SEO Injection ---

  const injectMeta = (template: string, seo: { title: string, description: string, image?: string, keywords?: string, url?: string }) => {
    let output = template;
    const { title, description, image = DEFAULT_IMAGE, keywords, url } = seo;

    output = output.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    output = output.replace(/<meta\s+name="title"\s+content="[^"]*"\s*\/?>/i, `<meta name="title" content="${title}">`);
    output = output.replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}">`);
    output = output.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}">`);
    output = output.replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}">`);
    
    if (image) {
      output = output.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${image}">`);
      output = output.replace(/<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${image}">`);
    }

    if (keywords) {
      output = output.replace(/<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i, `<meta name="keywords" content="${keywords}">`);
    }

    output = output.replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}">`);
    output = output.replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}">`);

    return output;
  };

  const getTemplate = async (req: express.Request) => {
    let template = '';
    if (process.env.NODE_ENV !== "production") {
      template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
      template = await vite.transformIndexHtml(req.originalUrl, template);
    } else {
      template = fs.readFileSync(path.resolve(process.cwd(), 'dist/index.html'), 'utf-8');
    }
    return template;
  };

  // Movie Details Route
  app.get('/film/:slug', async (req, res, next) => {
    try {
      const slug = req.params.slug;
      let movieData: any = null;
      try {
        if (slug.startsWith('tx-')) {
          const realId = slug.replace('tx-', '');
          const apiRes = await fetch(`https://topxx.vip/api/v1/movies/${realId}`);
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.status === 'success' && json.data) {
              const item = json.data;
              const trans = item.trans?.find((t: any) => t.locale === 'vi') || item.trans?.[0] || {};
              movieData = {
                name: trans.title,
                origin_name: trans.seo_title || trans.title,
                content: trans.content || trans.description,
                poster_url: item.images?.[0]?.path || item.thumbnail,
                category: item.genres?.map((g: any) => ({ 
                  name: g.trans?.find((t: any) => t.locale === 'vi')?.name || g.trans?.[0]?.name 
                }))
              };
            }
          }
        } else if (slug.startsWith('xx-')) {
          const realId = slug.replace('xx-', '');
          const apiRes = await fetch(`https://www.xxvnapi.com/api/phim/${realId}`);
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.status && json.movie) {
              const item = json.movie;
              movieData = {
                name: item.name,
                origin_name: item.origin_name,
                content: item.content,
                poster_url: item.thumb_url || item.poster_url
              };
            }
          }
        } else if (slug.startsWith('vs-')) {
          const realId = slug.replace('vs-', '');
          const apiRes = await fetch(`https://nguon.vsphim.com/api/phim/${realId}`);
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.status === 'success' && json.movie) {
              const item = json.movie;
              movieData = {
                name: item.name,
                origin_name: item.origin_name,
                content: item.content,
                poster_url: item.thumb_url || item.poster_url
              };
            }
          }
        } else {
          const apiRes = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);
          if (apiRes.ok) {
            const json = await apiRes.json();
            if (json.status === 'success' || json.status === true) {
              movieData = json.data?.item;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch movie data for SEO:", err);
      }

      let template = await getTemplate(req);

      if (movieData) {
        const title = `Xem phim ${movieData.name || ''} (${movieData.origin_name || ''}) Vietsub Thuyết minh mới nhất | PhimTop1`;
        const descriptionRaw = movieData.content || movieData.description || '';
        const description = descriptionRaw.replace(/<[^>]+>/g, '').trim().substring(0, 160) + '...';
        
        let thumb = DEFAULT_IMAGE;
        const domainImage = "https://img.ophim.live";
        if (movieData.poster_url) {
          thumb = movieData.poster_url.startsWith('http') ? movieData.poster_url : `${domainImage}/uploads/movies/${movieData.poster_url}`;
        } else if (movieData.thumb_url) {
          thumb = movieData.thumb_url.startsWith('http') ? movieData.thumb_url : `${domainImage}/uploads/movies/${movieData.thumb_url}`;
        }

        const genreKeywords = (movieData.category || []).map((c: any) => c.name).join(', ');
        const keywords = `xem phim, xem phim online, phim hay, phim vietsub, phim thuyết minh, ${movieData.name || ''}, ${movieData.origin_name || ''}, ${genreKeywords}`;

        template = injectMeta(template, { title, description, image: thumb, keywords });
      }

      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  // Catch-all with Static Route SEO
  app.get('*', async (req, res, next) => {
    // Only intercept HTML requests
    if (req.path.includes('.') && !req.path.endsWith('.html')) return next();
    
    try {
      const url = req.path;
      let template = await getTemplate(req);
      
      let seo: { title: string, description: string, keywords: string, image?: string } = {
        title: "PhimTop1 - Xem phim online, Phim 18+ & Cosplay Nude",
        description: "PhimTop1 - Nền tảng giải trí đa kênh: Xem phim online, phim người lớn 18+, JAV Vietsub và ảnh Cosplay Nude nghệ thuật. Chất lượng 4K, cập nhật mỗi ngày.",
        keywords: "phim moi, phim hay, phim 18+, jav vietsub, cosplay nude, xem phim online, phim cap 3, phimtop1"
      };

      if (url === '/') {
        // Already default
      } else if (url.includes('/nguoi-lon/cosplay/')) {
        const id = url.split('/').pop();
        try {
          const apiRes = await fetch(`https://cosplaytele.com/wp-json/wp/v2/posts/${id}`);
          if (apiRes.ok) {
            const data = await apiRes.json();
            seo.title = `${data.title.rendered} - Album Cosplay Nude Nóng Bỏng | PhimTop1`;
            seo.description = `Xem bộ ảnh ${data.title.rendered} chất lượng cao, cosplay nude nghệ thuật cực phê tại PhimTop1.`;
            seo.image = data.jetpack_featured_media_url || DEFAULT_IMAGE;
          }
        } catch (e) {}
      } else if (url.startsWith('/the-loai/') || url.startsWith('/quoc-gia/')) {
        const parts = url.split('/');
        const category = parts[parts.length - 1];
        seo.title = `Danh sách phim ${category} mới nhất | PhimTop1`;
        seo.description = `Tổng hợp phim ${category} hay nhất, cập nhật liên tục với chất lượng cao tại PhimTop1.`;
      } else if (url === '/nguoi-lon/cosplay') {
        seo.title = "Cosplay Nude - Album Ảnh Nóng Show Hàng Nghệ Thuật | PhimTop1";
        seo.description = "Bộ sưu tập album ảnh cosplay nude, show hàng, ảnh nóng nghệ thuật từ các hot girl, model nổi tiếng nhất.";
      } else if (url === '/kham-pha') {
        seo.title = "Khám Phá Phim Hay - Gợi Ý Xem Phim Cho Bạn | PhimTop1";
      }

      template = injectMeta(template, seo);
      res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
    } catch (e: any) {
      if (vite) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  if (process.env.NODE_ENV !== "production") {
    app.use(vite.middlewares);
  } else {
    // Serve static files from dist
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    
    // Catch-all for SPA router - should not be needed because we have app.get('*') above
    // but we can leave it for safety or just rely on the above
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
