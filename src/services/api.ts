import { MovieListResponse, MovieDetailResponse, Movie } from '../types';

const API_BASE = '/api/ophim-movies';

const mapOphimMovie = (item: any, domainImage: string): Movie => ({
  name: item.name || '',
  slug: item.slug || '',
  original_name: item.origin_name || '',
  thumb_url: item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${domainImage}/uploads/movies/${item.thumb_url}`) : '',
  poster_url: item.poster_url ? (item.poster_url.startsWith('http') ? item.poster_url : `${domainImage}/uploads/movies/${item.poster_url}`) : (item.thumb_url ? (item.thumb_url.startsWith('http') ? item.thumb_url : `${domainImage}/uploads/movies/${item.thumb_url}`) : ''),
  created: item.created?.time || item.year?.toString() || '',
  modified: item.modified?.time || '',
  description: item.content || item.description || '',
  total_episodes: item.episode_total ? parseInt(item.episode_total) || 0 : 0,
  current_episode: item.episode_current || '',
  time: item.time || '',
  quality: item.quality || '',
  language: item.lang || '',
  director: Array.isArray(item.director) ? item.director.join(', ') : (item.director || ''),
  casts: Array.isArray(item.actor) ? item.actor.join(', ') : (item.actor || '')
});

const mapOphimListResponse = (res: any): MovieListResponse => {
  const domainImage = res.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
  return {
    status: res.status === 'success' || res.status ? 'success' : 'error',
    paginate: {
      current_page: res.data?.params?.pagination?.currentPage || 1,
      total_items: res.data?.params?.pagination?.totalItems || 0,
      total_page: res.data?.params?.pagination?.totalItemsPerPage 
        ? Math.ceil((res.data.params.pagination.totalItems) / res.data.params.pagination.totalItemsPerPage)
        : 1,
      items_per_page: res.data?.params?.pagination?.totalItemsPerPage || 24,
    },
    items: res.data?.items?.map((item: any) => mapOphimMovie(item, domainImage)) || []
  };
};

const mapOphimDetailResponse = (res: any): MovieDetailResponse => {
  const domainImage = res.data?.APP_DOMAIN_CDN_IMAGE || 'https://img.ophim.live';
  const item = res.data?.item || {};
  return {
    status: res.status === 'success' || res.status ? 'success' : 'error',
    movie: {
      ...mapOphimMovie(item, domainImage),
      category: item.category,
      episodes: item.episodes?.map((epServer: any) => ({
        server_name: epServer.server_name,
        items: epServer.server_data?.map((ep: any) => ({
          name: ep.name,
          slug: ep.slug,
          embed: ep.link_embed,
          m3u8: ep.link_m3u8
        })) || []
      })) || []
    }
  };
};

export const nguoncApi = {
  getNewMovies: async (page: number = 1): Promise<MovieListResponse> => {
    const res = await fetch(`${API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`);
    const json = await res.json();
    return mapOphimListResponse(json);
  },
  getMoviesByCategory: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    const res = await fetch(`${API_BASE}/danh-sach/${slug}?page=${page}`);
    const json = await res.json();
    return mapOphimListResponse(json);
  },
  getMoviesByGenre: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    const res = await fetch(`${API_BASE}/the-loai/${slug}?page=${page}`);
    const json = await res.json();
    return mapOphimListResponse(json);
  },
  getMoviesByCountry: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    const res = await fetch(`${API_BASE}/quoc-gia/${slug}?page=${page}`);
    const json = await res.json();
    return mapOphimListResponse(json);
  },
  getMoviesByYear: async (year: string, page: number = 1): Promise<MovieListResponse> => {
    const res = await fetch(`${API_BASE}/nam-phat-hanh/${year}?page=${page}`);
    const json = await res.json();
    return mapOphimListResponse(json);
  },
  searchMovies: async (keyword: string, page: number = 1): Promise<MovieListResponse> => {
    const res = await fetch(`${API_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`);
    const json = await res.json();
    return mapOphimListResponse(json);
  },
  getMovieDetail: async (slug: string): Promise<MovieDetailResponse> => {
    const res = await fetch(`${API_BASE}/phim/${slug}`);
    const json = await res.json();
    return mapOphimDetailResponse(json);
  }
};
