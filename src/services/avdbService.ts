import { MovieListResponse, MovieDetailResponse, Movie, MovieDetail } from '../types';

const API_BASE = '/api/avdb';

const mapAVDBMovie = (item: any): Movie => {
  const id = item.id || item.vod_id || item.movie_code || Math.random().toString(36).substring(7);
  
  const getArrayValue = (val: any) => {
    if (Array.isArray(val)) return val.join(', ');
    return val || '';
  };

  return {
    name: item.name || item.vod_name || '',
    slug: `av-${id}`,
    original_name: item.origin_name || item.vod_sub || item.vod_name || '',
    thumb_url: item.thumb_url || item.vod_pic || item.vod_pic_thumb || '',
    poster_url: item.poster_url || item.vod_pic || item.vod_pic_screenshot || '',
    created: item.created_at || item.vod_pubdate || item.vod_add?.toString() || '',
    modified: item.vod_time || '',
    description: item.description || item.vod_content || '',
    total_episodes: 1, 
    current_episode: item.quality || item.vod_remarks || 'Full',
    time: item.time || item.vod_duration || '',
    quality: item.quality || item.vod_remarks || 'HD',
    language: getArrayValue(item.country) || 'Tiếng Nhật',
    director: getArrayValue(item.director || item.vod_director),
    casts: getArrayValue(item.actor || item.vod_actor)
  };
};

const parseEpisodes = (episodes: any, legacyUrl?: string) => {
  if (legacyUrl) {
    // Handle old format if present
    const servers = legacyUrl.split('$$$');
    const result: any[] = [];
    servers.forEach((serverStr, idx) => {
      const parts = serverStr.split('#');
      const items = parts.map(p => {
        const field = p.split('$');
        return {
          name: field.length > 1 ? field[0] : `Tập ${idx + 1}`,
          slug: `ep-${idx + 1}`,
          embed: field.length > 1 ? field[1] : field[0],
          m3u8: field.length > 1 ? field[1] : field[0]
        };
      });
      result.push({
        server_name: `Server ${idx + 1}`,
        items
      });
    });
    return result;
  }

  if (!episodes) return [];

  // Handle new complex episodes object
  const result: any[] = [];
  
  const processServer = (server: any) => {
    const serverName = server.server_name || 'VIP';
    const serverData = server.server_data || {};
    const items = Object.entries(serverData).map(([key, data]: [string, any]) => ({
      name: key,
      slug: data.slug || key.toLowerCase(),
      embed: data.link_embed || data.link_m3u8 || '',
      m3u8: data.link_m3u8 || data.link_embed || ''
    }));
    
    if (items.length > 0) {
      result.push({
        server_name: serverName,
        items
      });
    }
  };

  if (Array.isArray(episodes)) {
    episodes.forEach(processServer);
  } else if (typeof episodes === 'object') {
    processServer(episodes);
  }

  return result;
};

export const avdbApi = {
  getNewMovies: async (page: number = 1): Promise<MovieListResponse> => {
    try {
      const res = await fetch(`${API_BASE}?ac=list&pg=${page}`);
      const json = await res.json();
      return {
        status: 'success',
        paginate: {
          current_page: parseInt(json.page) || 1,
          total_page: parseInt(json.pagecount) || 1,
          total_items: parseInt(json.total) || 0,
          items_per_page: json.list?.length || 20,
        },
        items: json.list?.map(mapAVDBMovie) || []
      };
    } catch (error) {
      console.error('AVDB API Error:', error);
      return { status: 'error', items: [], paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 20 } };
    }
  },
  getMovieDetail: async (id: string): Promise<MovieDetailResponse> => {
    const realId = id.replace('av-', '');
    try {
      // Try by ids first (standard)
      let res = await fetch(`${API_BASE}?ac=detail&ids=${realId}`);
      let json = await res.json();
      
      let item = json.list?.[0] || json.data?.[0] || (json.vod_id || json.id ? json : null);
      
      // Fallback: search by wd (sometimes IDs are strings and ac=detail&wd= works better)
      if (!item) {
        res = await fetch(`${API_BASE}?ac=detail&wd=${encodeURIComponent(realId)}`);
        json = await res.json();
        item = json.list?.[0] || json.data?.[0] || (json.vod_id || json.id ? json : null);
      }
      
      if (!item) {
        console.error('AVDB Detail Error: Item missing in response', { realId, json });
        throw new Error('Movie not found');
      }

      return {
        status: 'success',
        movie: {
          ...mapAVDBMovie(item),
          episodes: parseEpisodes(item.episodes, item.vod_play_url || item.vod_url)
        } as MovieDetail
      };
    } catch (error) {
      console.error('AVDB Detail API Error:', error);
      throw error;
    }
  },
  searchMovies: async (keyword: string, page: number = 1): Promise<MovieListResponse> => {
    try {
      // User requested ac=detail&wd= for search
      const res = await fetch(`${API_BASE}?ac=detail&wd=${encodeURIComponent(keyword)}&pg=${page}`);
      const json = await res.json();
      return {
        status: 'success',
        paginate: {
          current_page: parseInt(json.page) || 1,
          total_page: parseInt(json.pagecount) || 1,
          total_items: parseInt(json.total) || 0,
          items_per_page: json.list?.length || 20,
        },
        items: json.list?.map(mapAVDBMovie) || []
      };
    } catch (error) {
      console.error('AVDB Search API Error:', error);
      return { status: 'error', items: [], paginate: { current_page: 1, total_page: 1, total_items: 0, items_per_page: 20 } };
    }
  }
};
