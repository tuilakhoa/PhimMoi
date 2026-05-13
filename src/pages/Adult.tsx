import React, { useState, useEffect } from 'react';
import { avdbApi } from '../services/avdbService';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2, Zap, AlertTriangle } from 'lucide-react';
import { SEO } from '../components/SEO';

export function AdultPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasConfirmed, setHasConfirmed] = useState(false);

  useEffect(() => {
    if (!hasConfirmed) return;

    const fetchMovies = async () => {
      setLoading(true);
      try {
        const res = await avdbApi.getNewMovies(page);
        setMovies(res.items);
        setTotalPages(res.paginate.total_page);
      } catch (error) {
        console.error('Failed to fetch AV movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [page, hasConfirmed]);

  if (!hasConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border-2 border-rose-500/20">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h1 className="text-2xl font-bold text-white">Cảnh báo Nội dung Người lớn</h1>
          <p className="text-zinc-400">
            Bạn đang truy cập vào khu vực chứa nội dung chỉ dành cho người lớn (18+). 
            Vui lòng xác nhận bạn đủ tuổi trước khi tiếp tục.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => window.history.back()}
            className="px-8 py-3 rounded-full bg-zinc-900 text-zinc-300 font-bold hover:bg-zinc-800 transition-colors"
          >
            Quay lại
          </button>
          <button
            onClick={() => setHasConfirmed(true)}
            className="px-8 py-3 rounded-full bg-rose-600 text-white font-bold hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20"
          >
            Tôi đã trên 18 tuổi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SEO 
        title="Phim Người Lớn 18+ - PhimHay" 
        description="Khám phá kho phim người lớn chất lượng cao, cập nhật mới nhất mỗi ngày."
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Zap className="w-8 h-8 text-rose-500 fill-rose-500" />
          Phim Người Lớn 18+
        </h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4 pt-8">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage(p => p - 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-50 hover:bg-zinc-800"
            >
              Trang trước
            </button>
            <span className="text-zinc-400">Trang {page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => {
                setPage(p => p + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-4 py-2 bg-zinc-900 text-white rounded-md disabled:opacity-50 hover:bg-zinc-800"
            >
              Trang sau
            </button>
          </div>
        </>
      )}
    </div>
  );
}
