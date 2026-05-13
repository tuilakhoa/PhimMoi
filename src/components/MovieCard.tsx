import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Movie } from '../types';
import { WatchlistButton } from './WatchlistButton';

export const MovieCard: React.FC<{ movie: Movie }> = ({ movie }) => {
  return (
    <Link to={`/film/${movie.slug}`} className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={movie.thumb_url || undefined}
          alt={movie.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=450';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-rose-500/90 text-white flex items-center justify-center pl-1 shadow-lg shadow-rose-500/20 backdrop-blur-sm">
            <Play className="w-5 h-5" />
          </div>
        </div>

        {/* Watchlist toggle */}
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <WatchlistButton movie={movie} />
        </div>

        {/* Labels */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          {movie.quality && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider shadow-sm">
              {movie.quality}
            </span>
          )}
          {movie.language && (
            <span className="bg-white/10 backdrop-blur-md text-white border border-white/20 text-[10px] font-medium px-2 py-1 rounded-sm shadow-sm">
              {movie.language}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 absolute bottom-0 w-full bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pt-12">
        <h3 className="text-white font-bold text-sm line-clamp-1 group-hover:text-rose-400 transition-colors">
          {movie.name}
        </h3>
        <div className="flex items-center justify-between mt-1 text-xs text-zinc-400">
          <p className="line-clamp-1">{movie.original_name}</p>
          <span className="shrink-0">{movie.time || movie.current_episode}</span>
        </div>
      </div>
    </Link>
  );
}
