import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { nguoncApi } from '../services/api';
import { avdbApi } from '../services/avdbService';
import { MovieListResponse } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';

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

  const [data, setData] = useState<MovieListResponse | null>(null);
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
    const fetchMovies = async () => {
      if (!keyword) return;
      setLoading(true);
      try {
        const [res, avRes] = await Promise.all([
          nguoncApi.searchMovies(keyword, page),
          avdbApi.searchMovies(keyword, page)
        ]);
        
        // Merge items and deduplicate by slug
        const allItems = [...res.items, ...avRes.items];
        const uniqueItems = allItems.filter((item, index, self) => 
          index === self.findIndex((t) => t.slug === item.slug)
        );

        setData({
          ...res,
          items: uniqueItems
        });
      } catch (error) {
        console.error('Failed to search movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [keyword, page]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SEO title={`Tìm kiếm: ${keyword}`} description={`Kết quả tìm kiếm cho phim "${keyword}"`} />
      <h1 className="text-2xl font-bold text-white flex items-center gap-2">
        <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
        Tìm kiếm: "{keyword}"
      </h1>

      {tmdbLoading ? (
         <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Đang tìm kiếm thêm thông tin diễn viên...
         </div>
      ) : tmdbData ? (
         <div className="bg-zinc-900/50 p-4 md:p-6 rounded-xl border border-zinc-800">
            <div className="flex flex-col md:flex-row gap-6">
                <div>
                  {tmdbData.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w300${tmdbData.profile_path}`} alt={tmdbData.name} className="w-32 h-32 md:w-48 md:h-48 rounded-lg object-cover border border-zinc-700 shadow-xl" />
                  ) : (
                      <div className="w-32 h-32 md:w-48 md:h-48 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700 text-3xl font-bold text-zinc-600">{tmdbData.name.charAt(0)}</div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl md:text-3xl font-bold text-white mb-1">{tmdbData.name}</h2>
                    <p className="text-zinc-400 text-sm">{tmdbData.known_for_department === 'Acting' ? 'Diễn viên' : tmdbData.known_for_department === 'Directing' ? 'Đạo diễn' : tmdbData.known_for_department}</p>
                  </div>
                  
                  {(tmdbData.birthday || tmdbData.place_of_birth) && (
                    <div className="text-sm text-zinc-300 space-y-1">
                      {tmdbData.birthday && <p><span className="text-zinc-500 mr-2">Ngày sinh:</span> {new Date(tmdbData.birthday).toLocaleDateString('vi-VN')}</p>}
                      {tmdbData.place_of_birth && <p><span className="text-zinc-500 mr-2">Nơi sinh:</span> {tmdbData.place_of_birth}</p>}
                    </div>
                  )}

                  {tmdbData.biography && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-zinc-400 mb-2">Tiểu sử</h3>
                      <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl line-clamp-4">{tmdbData.biography}</p>
                    </div>
                  )}
                </div>
            </div>
         </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data.items.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>

          {data.paginate && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                onClick={() => setSearchParams({ q: keyword, page: Math.max(1, page - 1).toString() })}
                disabled={page === 1}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                Trang trước
              </button>
              <span className="text-zinc-400">
                {page} / {data.paginate.total_page}
              </span>
              <button
                onClick={() => setSearchParams({ q: keyword, page: (page + 1).toString() })}
                disabled={page >= data.paginate.total_page}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-zinc-400 py-12">
          Không tìm thấy phim nào phù hợp với từ khóa "{keyword}".
        </div>
      )}
    </div>
  );
}
