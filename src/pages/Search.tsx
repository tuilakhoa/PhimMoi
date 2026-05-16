import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { nguoncApi } from '../services/api';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { cosplayService, CosplayAlbum } from '../services/cosplayService';
import { MovieListResponse, Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2, Camera, User, Film, Sparkles, ChevronRight, Search as SearchIcon } from 'lucide-react';
import { SEO } from '../components/SEO';
import { useAge } from '../contexts/AgeContext';

interface TMDBPerson {
  name: string;
  profile_path: string | null;
  biography: string;
  birthday: string | null;
  place_of_birth: string | null;
  known_for_department: string;
}

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const { ageStatus } = useAge();

  const [movieData, setMovieData] = useState<MovieListResponse | null>(null);
  const [cosplayData, setCosplayData] = useState<{ albums: CosplayAlbum[], totalAlbums: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const [tmdbData, setTmdbData] = useState<TMDBPerson | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);

  useEffect(() => {
    const fetchAIActor = async () => {
      const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
      if (!keyword || !TMDB_API_KEY || page > 1) {
        setTmdbData(null);
        return;
      }
      setTmdbLoading(true);
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(keyword)}&api_key=${TMDB_API_KEY}&language=vi-VN`);
        const personData = await res.json();
        
        let foundPerson = null;
        for (const person of (personData.results || [])) {
           if (person.known_for_department === "Acting" || person.known_for_department === "Directing" || person.popularity > 2) {
             foundPerson = person;
             break;
           }
        }

        if (foundPerson) {
          const detailRes = await fetch(`https://api.themoviedb.org/3/person/${foundPerson.id}?api_key=${TMDB_API_KEY}&language=vi-VN`);
          const detailData = await detailRes.json();
          
          setTmdbData({
             name: detailData.name,
             profile_path: detailData.profile_path,
             biography: detailData.biography,
             birthday: detailData.birthday,
             place_of_birth: detailData.place_of_birth,
             known_for_department: detailData.known_for_department,
          });
        } else {
          setTmdbData(null);
        }
      } catch (e) {
        console.error('Failed to fetch TMDB person info', e);
        setTmdbData(null);
      } finally {
        setTmdbLoading(false);
      }
    };
    fetchAIActor();
  }, [keyword, page]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!keyword) return;
      setLoading(true);
      try {
        const [res, txRes, vsRes, xxRes, cosplayRes] = await Promise.all([
          nguoncApi.searchMovies(keyword, page),
          ageStatus !== 'under18' ? topxxApi.searchMovies(keyword, page) : Promise.resolve({ items: [], paginate: { total_page: 0 } } as any),
          ageStatus !== 'under18' ? vsphimApi.searchMovies(keyword, page) : Promise.resolve({ items: [], paginate: { total_page: 0 } } as any),
          ageStatus !== 'under18' ? xxvnApi.searchMovies(keyword, page) : Promise.resolve({ items: [], paginate: { total_page: 0 } } as any),
          ageStatus !== 'under18' ? cosplayService.getAlbums(page, keyword) : Promise.resolve({ albums: [], totalAlbums: 0 })
        ]);
        
        // Merge items and deduplicate by slug for movies
        const allMovies = [...res.items, ...txRes.items, ...vsRes.items, ...xxRes.items];
        const uniqueMovies = allMovies.filter((item, index, self) => 
          index === self.findIndex((t) => t.slug === item.slug)
        );

        const maxTotalPage = Math.max(
          res.paginate?.total_page || 0,
          txRes.paginate?.total_page || 0,
          vsRes.paginate?.total_page || 0,
          xxRes.paginate?.total_page || 0,
          1
        );

        setMovieData({
          status: 'success',
          items: uniqueMovies,
          paginate: {
            current_page: page,
            total_page: maxTotalPage,
            total_items: (res.paginate?.total_items || 0) + (txRes.paginate?.total_items || 0) + (vsRes.paginate?.total_items || 0) + (xxRes.paginate?.total_items || 0),
            items_per_page: 24
          }
        });

        setCosplayData({
          albums: cosplayRes.albums,
          totalAlbums: cosplayRes.totalAlbums
        });
      } catch (error) {
        console.error('Failed to search:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [keyword, page, ageStatus]);

  const hasResults = (movieData?.items && movieData.items.length > 0) || (cosplayData?.albums && cosplayData.albums.length > 0);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <SEO title={`Tìm kiếm: ${keyword}`} description={`Kết quả tìm kiếm cho "${keyword}"`} />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <div className="w-1.5 h-8 bg-rose-500 rounded-full" />
          Tìm kiếm: "{keyword}"
        </h1>
        <p className="text-zinc-500 font-medium ml-4">
          Khám phá nội dung phù hợp trên toàn hệ thống
        </p>
      </div>

      {tmdbLoading ? (
         <div className="flex items-center gap-2 text-zinc-500 text-sm ml-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tìm kiếm thêm thông tin diễn viên...
         </div>
      ) : tmdbData ? (
         <div className="bg-zinc-900/50 p-4 md:p-6 rounded-2xl border border-zinc-800 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="shrink-0">
                  {tmdbData.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w300${tmdbData.profile_path}`} alt={tmdbData.name} className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border border-zinc-700 shadow-2xl" />
                  ) : (
                      <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-zinc-800 flex items-center justify-center border border-zinc-700 text-3xl font-bold text-zinc-600 shadow-inner group">
                        <User className="w-12 h-12 text-zinc-700 group-hover:scale-110 transition-transform" />
                      </div>
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-1">{tmdbData.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-wider border border-rose-500/20">
                        {tmdbData.known_for_department === 'Acting' ? 'Diễn viên' : tmdbData.known_for_department === 'Directing' ? 'Đạo diễn' : tmdbData.known_for_department}
                      </span>
                    </div>
                  </div>
                  
                  {(tmdbData.birthday || tmdbData.place_of_birth) && (
                    <div className="text-sm text-zinc-400 space-y-2 bg-black/20 p-3 rounded-xl inline-block border border-white/5">
                      {tmdbData.birthday && (
                        <p className="flex items-center gap-2">
                          <span className="text-zinc-600 font-bold w-20">Ngày sinh:</span> 
                          <span className="text-zinc-300">{new Date(tmdbData.birthday).toLocaleDateString('vi-VN')}</span>
                        </p>
                      )}
                      {tmdbData.place_of_birth && (
                        <p className="flex items-center gap-2">
                          <span className="text-zinc-600 font-bold w-20">Nơi sinh:</span> 
                          <span className="text-zinc-300">{tmdbData.place_of_birth}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {tmdbData.biography && (
                    <div className="mt-4">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-rose-500" /> Tiểu sử
                      </h3>
                      <p className="text-sm text-zinc-400 leading-relaxed max-w-4xl line-clamp-4 italic">{tmdbData.biography}</p>
                    </div>
                  )}
                </div>
            </div>
         </div>
      ) : null}

      {loading ? (
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
            <SearchIcon className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-zinc-500 font-medium animate-pulse">Đang quét toàn bộ hệ thống...</p>
        </div>
      ) : hasResults ? (
        <div className="space-y-16">
          {/* Cosplay Albums Section */}
          {cosplayData?.albums && cosplayData.albums.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Camera className="w-6 h-6 text-rose-500" />
                  Bộ sưu tập Cosplay ({cosplayData.totalAlbums})
                </h2>
                {page === 1 && cosplayData.totalAlbums > 10 && (
                  <Link to={`/nguoi-lon/cosplay?q=${keyword}`} className="text-sm font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 group">
                    Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {cosplayData.albums.map((album) => (
                  <Link 
                    key={album.id} 
                    to={`/nguoi-lon/cosplay/${album.id}`}
                    className="group block relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 transition-all duration-300"
                  >
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img 
                        src={album.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'} 
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded-full flex items-center gap-1 border border-white/10 text-[10px] font-black text-white">
                        <Camera className="w-3 h-3 text-rose-500" /> {album.images.length}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 group-hover:translate-y-0 transition-transform">
                      <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight group-hover:text-rose-400">{album.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Movies Section */}
          {movieData?.items && movieData.items.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Film className="w-6 h-6 text-indigo-500" />
                  Phim & TV Shows
                </h2>
                {!loading && (
                   <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                     {movieData.items.length} kết quả
                   </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {movieData.items.map((movie) => (
                  <MovieCard key={movie.slug} movie={movie} />
                ))}
              </div>

              {movieData.paginate && movieData.paginate.total_page > 1 && (
                <div className="flex justify-center items-center gap-4 pt-12">
                  <button
                    onClick={() => {
                      setSearchParams({ q: keyword, page: Math.max(1, page - 1).toString() });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page === 1}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all font-bold text-sm"
                  >
                    Trang trước
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-rose-600 text-white text-sm font-black shadow-lg shadow-rose-600/20">
                      {page}
                    </span>
                    <span className="text-zinc-600 font-bold">/</span>
                    <span className="text-zinc-400 text-sm font-bold">{movieData.paginate.total_page}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSearchParams({ q: keyword, page: (page + 1).toString() });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={page >= movieData.paginate.total_page}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all font-bold text-sm"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center border border-zinc-800 shadow-inner">
            <SearchIcon className="w-10 h-10 text-zinc-700" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Ối, không tìm thấy gì cả!</h3>
            <p className="text-zinc-500 max-w-sm mx-auto">
              Không tìm thấy nội dung nào phù hợp với từ khóa <span className="text-rose-500 underline font-bold">"{keyword}"</span>. Hãy thử một từ khóa khác hoặc kiểm tra lại chính tả nhé.
            </p>
          </div>
          <Link to="/" className="px-6 py-2.5 bg-rose-600 text-white rounded-xl font-bold text-sm hover:translate-y-[-2px] transition-all shadow-lg shadow-rose-600/20">
            Quay về trang chủ
          </Link>
        </div>
      )}
    </div>
  );
}
