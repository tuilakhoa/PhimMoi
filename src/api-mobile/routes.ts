import express from 'express';
// We re-implement the mappers here so the Mobile App gets pure mapped data
// without worrying about cors, source differences, etc.

export const mobileRouter = express.Router();

const handleFetch = async (url: string, prefix: string) => {
  const headers = { 
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  };
  if (url.includes('xxvnapi.com')) (headers as any)['Referer'] = 'https://www.xxvnapi.com/';
  if (url.includes('vsphim.com')) (headers as any)['Referer'] = 'https://nguon.vsphim.com/';

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error('API Error');
  return res.json();
};

const mapOphimMovie = (item: any, domainImage: string) => ({
  name: item.name || '',
  slug: item.slug || '',
  original_name: item.origin_name || '',
  thumb_url: item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${domainImage}/uploads/movies/${item.thumb_url}`) : '',
  poster_url: item.poster_url ? (item.poster_url.startsWith('http') ? item.poster_url : `${domainImage}/uploads/movies/${item.poster_url}`) : '',
  created: item.created?.time || item.year?.toString() || '',
  modified: item.modified?.time || '',
  description: item.content || item.description || '',
  total_episodes: parseInt(item.episode_total) || 0,
  current_episode: item.episode_current || '',
  time: item.time || '',
  quality: item.quality || '',
  language: item.lang || '',
  director: Array.isArray(item.director) ? item.director.join(', ') : (item.director || ''),
  casts: Array.isArray(item.actor) ? item.actor.join(', ') : (item.actor || '')
});

const mapVSPhimMovie = (item: any, domainImage: string) => ({
  name: item.name || '',
  slug: `vs-${item.slug || ''}`,
  original_name: item.origin_name || '',
  thumb_url: item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${domainImage}/${item.thumb_url}`) : '',
  poster_url: item.poster_url ? (item.poster_url.startsWith('http') ? item.poster_url : `${domainImage}/${item.poster_url}`) : '',
  created: item.created?.time || item.year?.toString() || '',
  modified: item.modified?.time || '',
  description: item.content || item.description || '',
  total_episodes: item.episode_total ? parseInt(item.episode_total.toString()) || 0 : 0,
  current_episode: item.episode_current || '',
  time: item.time || '',
  quality: item.quality || '',
  language: item.lang || item.language || '',
  director: Array.isArray(item.director) ? item.director.join(', ') : (item.director || ''),
  casts: Array.isArray(item.actor) ? item.actor.join(', ') : (item.actor || '')
});

const mapXXVNMovie = (item: any) => ({
  name: item.name || item.title || '',
  slug: `xx-${item.slug || ''}`,
  original_name: item.origin_name || item.original_title || '',
  thumb_url: item.thumb_url || item.poster_url || item.thumbnail || '',
  poster_url: item.poster_url || item.thumb_url || item.thumbnail || '',
  created: item.created?.time || item.year?.toString() || item.modified?.time || '',
  modified: item.modified?.time || '',
  description: item.content || item.description || '',
  total_episodes: item.episode_total ? parseInt(item.episode_total.toString()) || 0 : 0,
  current_episode: item.episode_current || '',
  time: item.time || item.duration || '',
  quality: item.quality || '',
  language: item.lang || item.language || '',
  director: Array.isArray(item.director) ? item.director.join(', ') : (item.director || ''),
  casts: Array.isArray(item.actor) ? item.actor.join(', ') : (item.actor || '')
});

const mapTopXXMovie = (item: any) => {
  const trans = item.trans?.find((t: any) => t.locale === 'vi') || item.trans?.[0] || {};
  return {
    name: trans.title || 'Untitled',
    slug: `tx-${item.code}`,
    original_name: trans.seo_title || trans.title || '',
    thumb_url: item.thumbnail || '',
    poster_url: item.images?.[0]?.path || item.thumbnail || '',
    created: item.publish_at || '',
    modified: item.updated_at || '',
    description: trans.content || trans.description || '',
    total_episodes: item.sources?.length || 1,
    current_episode: item.quality || 'Full',
    time: item.duration ? `${item.duration} phút` : '',
    quality: item.quality || 'HD',
    language: 'Tiếng Nhật',
    director: '',
    casts: item.actors?.map((a: any) => (a.trans?.find((t: any) => t.locale === 'vi') || a.trans?.[0] || {}).name).filter(Boolean).join(', ') || ''
  };
};

mobileRouter.get('/home', async (req, res) => {
  try {
    const page = req.query.page || '1';
    
    // Fetch latest from Ophim
    const ophimRes = await handleFetch(`https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${page}`, 'phim');
    const domainImage = ophimRes.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
    const items = (ophimRes.data?.items || []).map((item: any) => mapOphimMovie(item, domainImage));

    res.json({
      status: 'success',
      paginate: {
        current_page: ophimRes.data?.params?.pagination?.currentPage || 1,
        total_items: ophimRes.data?.params?.pagination?.totalItems || 0,
        total_page: Math.ceil((ophimRes.data?.params?.pagination?.totalItems || 0) / (ophimRes.data?.params?.pagination?.totalItemsPerPage || 24)),
      },
      items
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

mobileRouter.get('/adult/home', async (req, res) => {
  try {
    const page = req.query.page || '1';
    
    const [topxxRes, vsphimRes] = await Promise.all([
      handleFetch(`https://topxx.vip/api/v1/movies/latest?page=${page}&per_page=12`, 'tx'),
      handleFetch(`https://nguon.vsphim.com/api/danh-sach/phim-moi-cap-nhat?page=${page}`, 'vs')
    ]);

    const items = [
      ...(topxxRes.data || []).map(mapTopXXMovie),
      ...(vsphimRes.items || []).slice(0, 12).map((item: any) => mapVSPhimMovie(item, vsphimRes.pathImage || ''))
    ];

    res.json({
      status: 'success',
      paginate: {
        current_page: parseInt(page as string),
        total_items: 1000,
        total_page: 100
      },
      items
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

mobileRouter.get('/movies/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    let movieDetail: any = null;

    if (slug.startsWith('tx-')) {
      const realId = slug.replace('tx-', '');
      const data = await handleFetch(`https://topxx.vip/api/v1/movies/${realId}`, 'tx');
      const item = data.data;
      const movie = mapTopXXMovie(item);
      movieDetail = {
        ...movie,
        episodes: [{
          server_name: 'VIP',
          items: (item.sources || []).map((s: any, idx: number) => ({
            name: 'Tap ' + (idx + 1), slug: 'ep-' + idx, embed: s.link, m3u8: s.link
          }))
        }]
      };
    } else if (slug.startsWith('vs-')) {
      const realId = slug.replace('vs-', '');
      const data = await handleFetch(`https://nguon.vsphim.com/api/phim/${realId}`, 'vs');
      const item = data.movie || data.item || {};
      const movie = mapVSPhimMovie(item, data.pathImage || '');
      movieDetail = {
        ...movie,
        episodes: (data.episodes || item.episodes)?.map((server: any) => ({
          server_name: server.server_name,
          items: server.server_data?.map((ep: any) => ({
            name: ep.name, slug: ep.slug, embed: ep.link_embed || ep.link, m3u8: ep.link_m3u8 || ep.link
          }))
        })) || []
      };
    } else if (slug.startsWith('xx-')) {
      const realId = slug.replace('xx-', '');
      const data = await handleFetch(`https://www.xxvnapi.com/api/phim/${realId}`, 'xx');
      const item = data.movie || data.item || {};
      const movie = mapXXVNMovie(item);
      movieDetail = {
        ...movie,
        episodes: (data.episodes || item.episodes)?.map((server: any) => ({
          server_name: server.server_name,
          items: server.server_data?.map((ep: any) => ({
            name: ep.name, slug: ep.slug, embed: ep.link_embed || ep.link, m3u8: ep.link_m3u8 || ep.link
          }))
        })) || []
      };
    } else {
      const data = await handleFetch(`https://ophim1.com/v1/api/phim/${slug}`, 'ophim');
      const item = data.data?.item || {};
      const domainImage = data.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
      const movie = mapOphimMovie(item, domainImage);
      movieDetail = {
        ...movie,
        episodes: item.episodes?.map((server: any) => ({
          server_name: server.server_name,
          items: server.server_data?.map((ep: any) => ({
            name: ep.name, slug: ep.slug, embed: ep.link_embed || ep.link, m3u8: ep.link_m3u8 || ep.link
          }))
        })) || []
      };
    }

    res.json({ status: 'success', movie: movieDetail });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});
