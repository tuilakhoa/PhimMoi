import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { nguoncApi } from '../services/api';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { cosplayService, CosplayAlbum } from '../services/cosplayService';
import { MovieListResponse, Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2, Zap, ChevronRight, Camera, MonitorPlay, Sparkles, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';
import { storage } from '../lib/storage';
import { useAge } from '../contexts/AgeContext';

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

export function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [cosplayAlbums, setCosplayAlbums] = useState<CosplayAlbum[]>([]);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { ageStatus } = useAge();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const history = storage.getHistory();
        let recPromise = Promise.resolve({ items: [] } as any);
        if (page === 1 && history.length > 0) {
           const lastWatched = history[0];
           const words = lastWatched.name.split(' ');
           const query = words.slice(0, 2).join(' ') || 'Tình';
           recPromise = nguoncApi.searchMovies(query);
        }

        const [res, adultRes, vsRes, xxRes, cosplayRes, recRes] = await Promise.all([
          nguoncApi.getNewMovies(page),
          ageStatus !== 'under18' ? topxxApi.getNewMovies(page) : Promise.resolve({ items: [], paginate: { total_page: 0 } } as any),
          ageStatus !== 'under18' ? vsphimApi.getNewMovies(page) : Promise.resolve({ items: [], paginate: { total_page: 0 } } as any),
          ageStatus !== 'under18' ? xxvnApi.getNewMovies(page) : Promise.resolve({ items: [], paginate: { total_page: 0 } } as any),
          (page === 1 && ageStatus !== 'under18') ? cosplayService.getAlbums(1) : Promise.resolve({ albums: [] }),
          recPromise
        ]);
        
        // Merge normal and adult movies
        // Interleave them to show all sources evenly
        const combined: Movie[] = [];
        const maxLength = Math.max(res.items.length, adultRes.items.length, vsRes.items.length, xxRes.items.length);
        for (let i = 0; i < maxLength; i++) {
          if (res.items[i]) combined.push(res.items[i]);
          if (adultRes.items[i]) combined.push(adultRes.items[i]);
          if (vsRes.items[i]) combined.push(vsRes.items[i]);
          if (xxRes.items[i]) combined.push(xxRes.items[i]);
        }

        setMovies(combined);
        setTotalPages(Math.max(res.paginate.total_page, adultRes.paginate.total_page, vsRes.paginate.total_page, xxRes.paginate.total_page));

        if (page === 1) {
          setCosplayAlbums(cosplayRes.albums.slice(0, 10));
          if (recRes && recRes.items) {
             const historySlugs = history.map(h => h.slug);
             // Filter out movies they already watched
             const filteredRecs = recRes.items.filter((m: Movie) => !historySlugs.includes(m.slug));
             // Fallback: If filtered is empty, just use the first few not matching exact last movie
             setRecommendations((filteredRecs.length > 0 ? filteredRecs : recRes.items.filter((m: Movie) => m.slug !== history[0].slug)).slice(0, 5));
          }
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [page, ageStatus]);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <SEO 
        absoluteTitle="PhimTop1 - Xem phim online, Phim 18+ & Cosplay Nude" 
        description="Xem phim online, phim người lớn 18+, JAV Vietsub và ảnh Cosplay Nude nghệ thuật chất lượng cao. PhimTop1 - Nền tảng giải trí đa kênh, mượt mà, chất lượng 4K."
        keywords="phim moi, phim hay, phim 18+, jav vietsub, cosplay nude, xem phim online, phim cap 3, phimtop1"
      />
      
      {/* Personalized Recommendations */}
      {!loading && page === 1 && recommendations.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              Gợi ý cho bạn
            </h2>
            <span className="text-xs text-zinc-400 font-medium bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full">Dựa trên lịch sử xem</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {recommendations.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Cosplay Nude Section (Keeping as it's a different content type) */}
      {!loading && page === 1 && cosplayAlbums.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white flex items-center gap-3">
              <Camera className="w-8 h-8 text-rose-500" />
              Cosplay Nude & Album Mới
            </h2>
            <Link 
              to="/nguoi-lon/cosplay" 
              className="flex items-center gap-2 text-sm font-bold text-rose-500 hover:text-rose-400 transition-all bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 shadow-lg shadow-rose-500/10"
            >
              Phê pha ngay
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {cosplayAlbums.map((album) => (
              <Link 
                key={album.id} 
                to={`/nguoi-lon/cosplay/${album.id}`}
                className="group block relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 transition-all duration-500"
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

      {/* Unified Movies Section */}
      <section className="space-y-6 pt-4 border-t border-zinc-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <MonitorPlay className="w-8 h-8 text-indigo-500" />
            Khám phá Phim Mới
          </h2>
          {!loading && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <form 
                className="flex items-center gap-2 flex-1 relative"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const y = formData.get('year') as string;
                  if (y && y.length === 4) {
                    navigate(`/nam-phat-hanh/${y}`);
                  }
                }}
              >
                <div className="relative flex-1 sm:w-36 flex items-center">
                  <Calendar className="absolute left-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    name="year"
                    list="year-options"
                    placeholder="Nhập năm..."
                    className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500/50 focus:bg-zinc-900 transition-all shadow-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                      }
                    }}
                    onChange={(e) => {
                      const y = e.target.value;
                      if (y.length === 4) {
                        navigate(`/nam-phat-hanh/${y}`);
                      }
                    }}
                  />
                </div>
                <datalist id="year-options">
                  {YEARS.map(y => (
                    <option key={y} value={y.toString()} />
                  ))}
                </datalist>
              </form>

              <div className="hidden sm:flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800">
                 <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 hover:animate-pulse" />
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mt-0.5">Cập nhật mỗi phút</span>
              </div>
            </div>
          )}
        </div>

        {loading && page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-zinc-900 animate-pulse rounded-2xl border border-zinc-800" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.slug} movie={movie} />
              ))}
            </div>

            {movies.length > 0 && (
              <div className="flex justify-center items-center gap-6 pt-12">
                <button
                  onClick={() => {
                    setPage(p => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all font-bold text-sm shadow-xl"
                >
                  Trang trước
                </button>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-600/20 ring-4 ring-indigo-600/10">
                    {page}
                  </span>
                  <span className="text-zinc-600 font-bold">/</span>
                  <span className="text-zinc-400 text-sm font-bold">{totalPages}</span>
                </div>
                <button
                  onClick={() => {
                    setPage(p => p + 1);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page >= totalPages}
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl disabled:opacity-30 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all font-bold text-sm shadow-xl"
                >
                  Trang sau
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
