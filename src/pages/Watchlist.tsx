import React, { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Heart, Trash2 } from 'lucide-react';
import { SEO } from '../components/SEO';

export function Watchlist() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    setMovies(storage.getWatchlist());
  }, []);

  const clearWatchlist = () => {
    if (confirm('Bạn có muốn xóa tất cả phim trong danh sách yêu thích?')) {
      localStorage.removeItem('phimhay_watchlist');
      setMovies([]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SEO 
        title="Danh sách yêu thích - PhimTop1" 
        description="Quản lý danh sách các bộ phim bạn yêu thích tại PhimTop1."
      />

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          Phim Yêu Thích
        </h1>
        {movies.length > 0 && (
          <button
            onClick={clearWatchlist}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-3xl border-2 border-dashed border-zinc-800/50">
          <Heart className="w-16 h-16 text-zinc-800 mb-4" />
          <p className="text-xl font-medium text-zinc-500">Chưa có phim nào trong danh sách yêu thích</p>
          <p className="text-zinc-600 mt-2">Duyệt phim và nhấn vào biểu tượng trái tim để lưu lại.</p>
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
