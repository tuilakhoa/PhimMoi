import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Movie } from '../types';
import { storage } from '../lib/storage';
import { cn } from '../lib/utils';

interface WatchlistButtonProps {
  movie: Movie;
  className?: string;
  showText?: boolean;
}

export const WatchlistButton: React.FC<WatchlistButtonProps> = ({ movie, className, showText = false }) => {
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    setIsInWatchlist(storage.isInWatchlist(movie.slug));
  }, [movie.slug]);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWatchlist) {
      storage.removeFromWatchlist(movie.slug);
      setIsInWatchlist(false);
    } else {
      storage.addToWatchlist(movie);
      setIsInWatchlist(true);
    }
  };

  return (
    <button
      onClick={toggleWatchlist}
      className={cn(
        "group flex items-center justify-center gap-2 transition-all duration-300",
        showText 
          ? "px-4 py-2.5 rounded-full bg-zinc-900 border border-zinc-700 hover:border-rose-500/50 hover:bg-zinc-800 text-zinc-300"
          : "p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-rose-500/50 hover:bg-black/60",
        isInWatchlist && (showText ? "text-rose-500 border-rose-500/30 bg-rose-500/5" : "border-rose-500/50 bg-rose-500/10"),
        className
      )}
      title={isInWatchlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
    >
      <Heart 
        className={cn(
          "w-5 h-5 transition-all duration-300",
          isInWatchlist ? "fill-rose-500 text-rose-500" : "text-white/70 group-hover:text-rose-400"
        )} 
      />
      {showText && (
        <span className={cn("text-sm font-medium", isInWatchlist ? "text-rose-500" : "group-hover:text-rose-400")}>
          {isInWatchlist ? 'Đã yêu thích' : 'Thêm yêu thích'}
        </span>
      )}
    </button>
  );
};
