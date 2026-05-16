import { MovieListResponse, MovieDetailResponse, Movie, MovieDetail, ActorListResponse, Actor } from '../types';

const API_BASE = '/api/topxx-movies';

const mapTopXXActor = (item: any): Actor => {
  const trans = item.trans?.find((t: any) => t.locale === 'vi') || item.trans?.[0] || {};
  return {
    gender: item.gender,
    avatar: item.avatar,
    birth_date: item.birth_date,
    name: trans.name || 'Unknown',
    slug: trans.slug || item.code || '',
    movies_count: item.movies_count || 0
  };
};

const mapTopXXMovie = (item: any): Movie => {
  const trans = item.trans?.find((t: any) => t.locale === 'vi') || item.trans?.[0] || {};
  
  // Use code as ID but with a prefix to distinguish from other APIs
  const id = item.code;
  
  return {
    name: trans.title || 'Untitled',
    slug: `tx-${id}`,
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
    language: item.countries?.[0]?.trans?.find((t: any) => t.locale === 'vi')?.name || 'Tiếng Nhật',
    director: '',
    casts: item.actors?.map((a: any) => {
      const aTrans = a.trans?.find((t: any) => t.locale === 'vi') || a.trans?.[0] || {};
      return aTrans.name;
    }).filter(Boolean).join(', ') || ''
  };
};

const mapTopXXDetail = (item: any): MovieDetail => {
  const movie = mapTopXXMovie(item);
  
  const episodes = [{
    server_name: 'TopXX VIP',
    items: (item.sources || []).map((source: any, idx: number) => ({
      name: (item.sources.length > 1) ? `Tập ${idx + 1}` : 'Full',
      slug: `ep-${idx + 1}`,
      embed: source.link,
      m3u8: source.link.includes('.m3u8') ? source.link : ''
    }))
  }];

  const genres = (item.genres || []).map((g: any) => {
    const gTrans = g.trans?.find((t: any) => t.locale === 'vi') || g.trans?.[0] || {};
    return {
      id: g.code,
      name: gTrans.name,
      slug: g.code
    };
  });

  return {
    ...movie,
    category: genres,
    episodes,
    actors: (item.actors || []).map(mapTopXXActor),
    images: item.images || []
  };
};

export const topxxApi = {
  getNewMovies: async (page: number = 1, genreCode?: string): Promise<MovieListResponse> => {
    try {
      let url = `${API_BASE}/movies/latest?page=${page}&per_page=30`;
      
      // If a genre is specified, use the correct genre movies endpoint
      if (genreCode) {
        url = `${API_BASE}/genres/${genreCode}/movies?page=${page}&per_page=30`;
      }
      
      const res = await fetch(url);
      const json = await res.json();
      
      const data = json.data || [];
      const meta = json.meta || {};

      return {
        status: 'success',
        paginate: {
          current_page: meta.current_page || page,
          total_page: meta.last_page || 1,
          total_items: meta.total || data.length,
          items_per_page: meta.per_page || 30,
        },
        items: data.map(mapTopXXMovie)
      };
    } catch (error) {
      console.error('TopXX API Error:', error);
      return { 
        status: 'error', 
        items: [], 
        paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 30 } 
      };
    }
  },

  getMoviesByCountry: async (countryCode: string, page: number = 1): Promise<MovieListResponse> => {
    try {
      const res = await fetch(`${API_BASE}/countries/${countryCode}/movies?page=${page}&per_page=30`);
      const json = await res.json();
      
      const data = json.data || [];
      const meta = json.meta || {};

      return {
        status: 'success',
        paginate: {
          current_page: meta.current_page || page,
          total_page: meta.last_page || 1,
          total_items: meta.total || data.length,
          items_per_page: meta.per_page || 30,
        },
        items: data.map(mapTopXXMovie)
      };
    } catch (error) {
      console.error('TopXX Country API Error:', error);
      return { 
        status: 'error', 
        items: [], 
        paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 30 } 
      };
    }
  },

  getActors: async (page: number = 1, search?: string): Promise<ActorListResponse> => {
    try {
      let url = `${API_BASE}/actors?page=${page}&per_page=20&locale=vi`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const res = await fetch(url);
      const json = await res.json();
      
      const data = json.data || [];
      const meta = json.meta || {};

      return {
        status: 'success',
        paginate: {
          current_page: meta.current_page || page,
          total_page: meta.last_page || 1,
          total_items: meta.total || data.length,
          items_per_page: meta.per_page || 20,
        },
        items: data.map(mapTopXXActor)
      };
    } catch (error) {
      console.error('TopXX Actors API Error:', error);
      return { 
        status: 'error', 
        items: [], 
        paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 20 } 
      };
    }
  },

  getMoviesByActor: async (actorSlug: string, page: number = 1): Promise<MovieListResponse> => {
    try {
      // Assuming endpoint pattern based on others: /actors/{slug}/movies
      const res = await fetch(`${API_BASE}/actors/${actorSlug}/movies?page=${page}&per_page=30`);
      const json = await res.json();
      
      const data = json.data || [];
      const meta = json.meta || {};

      return {
        status: 'success',
        paginate: {
          current_page: meta.current_page || page,
          total_page: meta.last_page || 1,
          total_items: meta.total || data.length,
          items_per_page: meta.per_page || 30,
        },
        items: data.map(mapTopXXMovie)
      };
    } catch (error) {
      console.error('TopXX Actor Movies API Error:', error);
      return { 
        status: 'error', 
        items: [], 
        paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 30 } 
      };
    }
  },
  
  getMovieDetail: async (id: string): Promise<MovieDetailResponse> => {
    const realId = id.replace('tx-', '').replace('av-', ''); // Handle old and new prefixes
    try {
      const res = await fetch(`${API_BASE}/movies/${realId}`);
      const json = await res.json();
      
      if (json.status !== 'success' || !json.data) {
        throw new Error('Movie not found');
      }

      return {
        status: 'success',
        movie: mapTopXXDetail(json.data)
      };
    } catch (error) {
      console.error('TopXX Detail API Error:', error);
      throw error;
    }
  },

  searchMovies: async (keyword: string, page: number = 1): Promise<MovieListResponse> => {
    try {
      // TopXX search endpoint: /movies?q=... or /movies?search=...
      // Many Laravel-based APIs use 'q' for general search
      const res = await fetch(`${API_BASE}/movies?q=${encodeURIComponent(keyword)}&page=${page}&per_page=30`);
      const json = await res.json();
      
      const data = json.data || [];
      const meta = json.meta || {};

      return {
        status: 'success',
        paginate: {
          current_page: meta.current_page || page,
          total_page: meta.last_page || 1,
          total_items: meta.total || data.length,
          items_per_page: meta.per_page || 30,
        },
        items: data.map(mapTopXXMovie)
      };
    } catch (error) {
      console.error('TopXX Search API Error:', error);
      return { 
        status: 'error', 
        items: [], 
        paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 30 } 
      };
    }
  }
};
