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
          embed: ep.link_embed || ep.embed,
          m3u8: ep.link_m3u8 || ep.m3u8
        })) || []
      })) || []
    }
  };
};

const mapNguoncListResponse = (res: any): MovieListResponse => {
  const items = res.items || res.data?.items || [];
  return {
    status: res.status === 'success' || res.status ? 'success' : 'error',
    paginate: { // NguonC paginate is directly object or in paginate
      current_page: res.paginate?.current_page || 1,
      total_items: res.paginate?.total_items || 0,
      total_page: res.paginate?.total_page || 1,
      items_per_page: res.paginate?.items_per_page || 24,
    },
    items: items.map((item: any) => ({
      name: item.name || '',
      slug: item.slug || '',
      original_name: item.original_name || item.origin_name || '',
      thumb_url: item.thumb_url || '',
      poster_url: item.poster_url || item.thumb_url || '',
      created: item.created || item.year?.toString() || '',
      modified: item.modified || '',
      description: item.description || item.content || '',
      total_episodes: item.total_episodes ? parseInt(item.total_episodes) || 0 : 0,
      current_episode: item.current_episode || '',
      time: item.time || '',
      quality: item.quality || '',
      language: item.language || item.lang || '',
      director: item.director || '',
      casts: item.casts || item.actor || ''
    }))
  };
};

const mergeLists = (ophimData: MovieListResponse | null, nguoncData: MovieListResponse | null): MovieListResponse => {
  if (!ophimData && !nguoncData) return { status: 'error', paginate: { current_page: 1, total_items: 0, total_page: 1, items_per_page: 24 }, items: [] };
  if (!ophimData) return nguoncData!;
  if (!nguoncData) return ophimData;

  const itemsMap = new Map<string, Movie>();
  const mergedItems: Movie[] = [];
  
  const maxLength = Math.max(ophimData.items.length, nguoncData.items.length);
  for (let i = 0; i < maxLength; i++) {
    if (nguoncData.items[i] && !itemsMap.has(nguoncData.items[i].slug)) {
      itemsMap.set(nguoncData.items[i].slug, nguoncData.items[i]);
      mergedItems.push(nguoncData.items[i]);
    }
    if (ophimData.items[i] && !itemsMap.has(ophimData.items[i].slug)) {
      itemsMap.set(ophimData.items[i].slug, ophimData.items[i]);
      mergedItems.push(ophimData.items[i]);
    }
  }

  return {
    status: 'success',
    paginate: ophimData.paginate, // Fallback to ophim's pagination
    items: mergedItems
  };
};

export const nguoncApi = {
  getNewMovies: async (page: number = 1): Promise<MovieListResponse> => {
    const [opRes, ncRes] = await Promise.allSettled([
      fetch(`${API_BASE}/danh-sach/phim-moi-cap-nhat?page=${page}`).then(r => r.json()),
      fetch(`/api/nguonc-movies/films/phim-moi-cap-nhat?page=${page}`).then(r => r.json())
    ]);
    const opData = opRes.status === 'fulfilled' ? mapOphimListResponse(opRes.value) : null;
    const ncData = ncRes.status === 'fulfilled' ? mapNguoncListResponse(ncRes.value) : null;
    return mergeLists(opData, ncData);
  },
  getMoviesByCategory: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    const [opRes, ncRes] = await Promise.allSettled([
      fetch(`${API_BASE}/danh-sach/${slug}?page=${page}`).then(r => r.json()),
      fetch(`/api/nguonc-movies/films/danh-sach/${slug}?page=${page}`).then(r => r.json())
    ]);
    const opData = opRes.status === 'fulfilled' ? mapOphimListResponse(opRes.value) : null;
    const ncData = ncRes.status === 'fulfilled' ? mapNguoncListResponse(ncRes.value) : null;
    return mergeLists(opData, ncData);
  },
  getMoviesByGenre: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    const [opRes, ncRes] = await Promise.allSettled([
      fetch(`${API_BASE}/the-loai/${slug}?page=${page}`).then(r => r.json()),
      fetch(`/api/nguonc-movies/films/the-loai/${slug}?page=${page}`).then(r => r.json())
    ]);
    const opData = opRes.status === 'fulfilled' ? mapOphimListResponse(opRes.value) : null;
    const ncData = ncRes.status === 'fulfilled' ? mapNguoncListResponse(ncRes.value) : null;
    return mergeLists(opData, ncData);
  },
  getMoviesByCountry: async (slug: string, page: number = 1): Promise<MovieListResponse> => {
    const [opRes, ncRes] = await Promise.allSettled([
      fetch(`${API_BASE}/quoc-gia/${slug}?page=${page}`).then(r => r.json()),
      fetch(`/api/nguonc-movies/films/quoc-gia/${slug}?page=${page}`).then(r => r.json())
    ]);
    const opData = opRes.status === 'fulfilled' ? mapOphimListResponse(opRes.value) : null;
    const ncData = ncRes.status === 'fulfilled' ? mapNguoncListResponse(ncRes.value) : null;
    return mergeLists(opData, ncData);
  },
  getMoviesByYear: async (year: string, page: number = 1): Promise<MovieListResponse> => {
    const [opRes, ncRes] = await Promise.allSettled([
      fetch(`${API_BASE}/nam-phat-hanh/${year}?page=${page}`).then(r => r.json()),
      fetch(`/api/nguonc-movies/films/nam-phat-hanh/${year}?page=${page}`).then(r => r.json())
    ]);
    const opData = opRes.status === 'fulfilled' ? mapOphimListResponse(opRes.value) : null;
    const ncData = ncRes.status === 'fulfilled' ? mapNguoncListResponse(ncRes.value) : null;
    return mergeLists(opData, ncData);
  },
  searchMovies: async (keyword: string, page: number = 1): Promise<MovieListResponse> => {
    const [opRes, ncRes] = await Promise.allSettled([
      fetch(`${API_BASE}/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}`).then(r => r.json()),
      fetch(`/api/nguonc-movies/films/search?keyword=${encodeURIComponent(keyword)}&page=${page}`).then(r => r.json())
    ]);
    const opData = opRes.status === 'fulfilled' ? mapOphimListResponse(opRes.value) : null;
    const ncData = ncRes.status === 'fulfilled' ? mapNguoncListResponse(ncRes.value) : null;
    return mergeLists(opData, ncData);
  },
  getMovieDetail: async (slug: string): Promise<MovieDetailResponse> => {
    try {
      // Fetch both in parallel
      const [ophimRes, nguoncRes] = await Promise.allSettled([
        fetch(`${API_BASE}/phim/${slug}`).then(r => {
          if (!r.ok) throw new Error("Ophim err: " + r.status);
          return r.json();
        }),
        fetch(`/api/nguonc-movies/film/${slug}`).then(r => {
          if (!r.ok) throw new Error("Nguonc err: " + r.status);
          return r.json();
        })
      ]);

      let mainData: any = null;
      let ophimEpisodes: any[] = [];
      let nguoncEpisodes: any[] = [];

      // Process Ophim data
      if (ophimRes.status === 'fulfilled' && ophimRes.value?.data?.item) {
        mainData = ophimRes.value; 
        ophimEpisodes = ophimRes.value.data.item.episodes || [];
      }

      // Process NguonC data
      if (nguoncRes.status === 'fulfilled' && nguoncRes.value) {
        const ncData = nguoncRes.value.movie || nguoncRes.value.item || nguoncRes.value;
        if (ncData && ncData.slug) {
          if (!mainData) {
            // Use Nguonc as main data if Ophim fails
            // Wrap it to match mapOphimDetailResponse expectation:
            mainData = {
              status: true,
              data: {
                item: {
                  ...ncData,
                  actor: ncData.casts ? ncData.casts.split(',').map((s:string) => s.trim()) : [],
                  content: ncData.description || '',
                  poster_url: ncData.poster_url || ncData.thumb_url
                }
              }
            };
          }
          nguoncEpisodes = ncData.episodes || [];
        }
      }

      if (!mainData) {
        throw new Error("Movie not found in both sources");
      }

      // Merge episodes
      // We will map over both datasets
      const mergedEpisodes = new Map<string, any>();
      
      const processEpisodes = (sourceEpisodes: any[], sourceLabel: string) => {
        sourceEpisodes.forEach((epGroup: any) => {
          if (!epGroup.server_data && !epGroup.items) return;
          const srvName = epGroup.server_name || '';
          const newSrvName = `${srvName} (${sourceLabel})`;
          mergedEpisodes.set(newSrvName, {
            server_name: newSrvName,
            server_data: epGroup.server_data || epGroup.items || []
          });
        });
      };

      processEpisodes(ophimEpisodes, 'Ophim');
      processEpisodes(nguoncEpisodes, 'NguonC');

      // Add merged back to mainData
      if (mainData.data && mainData.data.item) {
        mainData.data.item.episodes = Array.from(mergedEpisodes.values());
      }

      return mapOphimDetailResponse(mainData);
    } catch (err: any) {
      console.error("Merged API Detail Error:", err);
      return {
        status: 'error',
        movie: {} as any
      };
    }
  }
};
