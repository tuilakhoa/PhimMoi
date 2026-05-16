import { MovieListResponse, MovieDetailResponse, Movie } from '../types';

// ================= VSPHIM ==================
const VSPHIM_API = '/api/vsphim-movies';

const mapVSPhimMovie = (item: any, domainImage: string): Movie => ({
  name: item.name || '',
  slug: `vs-${item.slug || ''}`, // prefix vs-
  original_name: item.origin_name || '',
  thumb_url: item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${domainImage}/${item.thumb_url}`) : '',
  poster_url: item.poster_url ? (item.poster_url.startsWith('http') ? item.poster_url : `${domainImage}/${item.poster_url}`) : (item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${domainImage}/${item.thumb_url}`) : ''),
  created: item.created?.time || item.year?.toString() || item.modified?.time || '',
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

export const vsphimApi = {
  getNewMovies: async (page: number = 1, category?: string, country?: string): Promise<MovieListResponse> => {
    try {
      let url = `${VSPHIM_API}/danh-sach/phim-moi-cap-nhat?page=${page}`;
      if (category || country) {
        url = `${VSPHIM_API}/danh-sach?page=${page}`;
        if (category) url += `&category=${category}`;
        if (country) url += `&country=${country}`;
      }
      
      const res = await fetch(url);
      const json = await res.json();
      
      const domainImage = json.pathImage || '';
      return {
        status: json.status ? 'success' : 'error',
        paginate: {
          current_page: json.pagination?.currentPage || page,
          total_items: json.pagination?.totalItems || 0,
          total_page: json.pagination?.totalPages || 1,
          items_per_page: json.pagination?.totalItemsPerPage || 24,
        },
        items: (json.items || []).map((item: any) => mapVSPhimMovie(item, domainImage))
      };
    } catch(e) {
      return { status: 'error', items: [], paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 24 } };
    }
  },
  getMovieDetail: async (slug: string): Promise<MovieDetailResponse> => {
    const realSlug = slug.replace('vs-', '');
    const res = await fetch(`${VSPHIM_API}/phim/${realSlug}`);
    const json = await res.json();
    
    // Some sources might nest it under json.movie or json.item
    const item = json.movie || json.item || {};
    const domainImage = json.pathImage || '';
    
    return {
      status: json.status ? 'success' : 'error',
      movie: {
        ...mapVSPhimMovie(item, domainImage),
        category: item.category,
        episodes: (json.episodes || item.episodes || json.movie?.episodes)?.map((epServer: any) => ({
          server_name: epServer.server_name,
          items: epServer.server_data?.map((ep: any) => ({
            name: ep.name,
            slug: ep.slug,
            embed: ep.link_embed || ep.link || ep.link_m3u8,
            m3u8: ep.link_m3u8 || ep.link
          })) || []
        })) || []
      }
    };
  },
  searchMovies: async (keyword: string, page: number = 1): Promise<MovieListResponse> => {
    try {
      // VSPHIM search endpoint: /tim-kiem?keyword=... is standard for Ophim/Nguon sources
      const url = `${VSPHIM_API}/tim-kiem?page=${page}&keyword=${encodeURIComponent(keyword)}`;
      const res = await fetch(url);
      const json = await res.json();
      
      const domainImage = json.pathImage || '';
      return {
        status: json.status ? 'success' : 'error',
        paginate: {
          current_page: json.pagination?.currentPage || page,
          total_items: json.pagination?.totalItems || 0,
          total_page: json.pagination?.totalPages || 1,
          items_per_page: json.pagination?.totalItemsPerPage || 24,
        },
        items: (json.items || []).map((item: any) => mapVSPhimMovie(item, domainImage))
      };
    } catch(e) {
      return { status: 'error', items: [], paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 24 } };
    }
  }
};

// ================= XXVN ==================
const XXVN_API = '/api/xxvn-movies';

const mapXXVNMovie = (item: any): Movie => ({
  name: item.name || item.title || '',
  slug: `xx-${item.slug || ''}`, // prefix xx-
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

export const xxvnApi = {
  getNewMovies: async (page: number = 1): Promise<MovieListResponse> => {
    try {
      const url = `${XXVN_API}/phim-moi-cap-nhat?page=${page}`;
      const res = await fetch(url);
      const json = await res.json();
      
      const items = json.movies || json.items || [];
      return {
        status: json.status ? 'success' : 'error',
        paginate: {
          current_page: json.page || page,
          total_items: 1000, // They might not provide total, fake it
          total_page: Math.max(page + 1, 100),
          items_per_page: items.length || 24,
        },
        items: items.map((item: any) => mapXXVNMovie(item))
      };
    } catch(e) {
      return { status: 'error', items: [], paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 24 } };
    }
  },
  getMovieDetail: async (slug: string): Promise<MovieDetailResponse> => {
    const realSlug = slug.replace('xx-', '');
    const res = await fetch(`${XXVN_API}/phim/${realSlug}`);
    const json = await res.json();
    
    const item = json.movie || json.item || {};
    
    return {
      status: json.status ? 'success' : 'error',
      movie: {
        ...mapXXVNMovie(item),
        category: item.category,
        episodes: (json.episodes || item.episodes || json.movie?.episodes)?.map((epServer: any) => ({
          server_name: epServer.server_name,
          items: epServer.server_data?.map((ep: any) => ({
            name: ep.name,
            slug: ep.slug,
            embed: ep.link_embed || ep.link || ep.link_m3u8,
            m3u8: ep.link_m3u8 || ep.link
          })) || []
        })) || []
      }
    };
  },
  searchMovies: async (keyword: string, page: number = 1): Promise<MovieListResponse> => {
    try {
      // XXVN search endpoint: /tim-kiem?keyword=...
      const url = `${XXVN_API}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`;
      const res = await fetch(url);
      const json = await res.json();
      
      const items = json.results || json.movies || json.items || [];
      return {
        status: json.status ? 'success' : 'error',
        paginate: {
          current_page: json.page || page,
          total_items: json.totalItems || 100, 
          total_page: json.totalPages || 1,
          items_per_page: items.length || 24,
        },
        items: items.map((item: any) => mapXXVNMovie(item))
      };
    } catch(e) {
      return { status: 'error', items: [], paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 24 } };
    }
  }
};
