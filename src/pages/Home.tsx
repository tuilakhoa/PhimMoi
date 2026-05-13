import { useEffect, useState } from 'react';
import { nguoncApi } from '../services/api';
import { MovieListResponse } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Home() {
  const [data, setData] = useState<MovieListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await nguoncApi.getNewMovies(page);
        setData(res);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SEO title="Trang chủ" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
          Phim Mới Cập Nhật
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data?.items.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>

          {data && data.paginate && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                Trang trước
              </button>
              <span className="text-zinc-400">
                {page} / {data.paginate.total_page}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= data.paginate.total_page}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
