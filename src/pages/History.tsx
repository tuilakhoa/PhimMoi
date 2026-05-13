import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export function History() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    setMovies(storage.getHistory());
  }, []);

  const clearHistory = () => {
    if (confirm('Bạn có muốn xóa tất cả lịch sử xem?')) {
      storage.clearHistory();
      setMovies([]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Lịch sử xem - PhimHay" 
        description="Xem lại các bộ phim bạn đã xem gần đây tại PhimHay."
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <HistoryIcon className="w-8 h-8 text-rose-500" />
          Lịch Sử Xem
        </h1>
        {movies.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Xóa lịch sử
          </button>
        )}
      </div>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-800/50">
          <HistoryIcon className="w-16 h-16 text-zinc-800 mb-4" />
          <p className="text-xl font-medium text-zinc-500">Chưa có lịch sử xem</p>
          <p className="text-zinc-600 mt-2">Bắt đầu xem phim ngay để lưu lại lịch sử.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.slug} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}
