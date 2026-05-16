import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ActorAvatarProps {
  name: string;
  avatar?: string;
}

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Simple cache to prevent duplicate requests
const imageCache: Record<string, string | null> = {};

export const ActorAvatar: React.FC<ActorAvatarProps> = ({ name, avatar }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(avatar || imageCache[name] || null);

  useEffect(() => {
    if (avatar) {
      setImageUrl(avatar);
      return;
    }
    
    if (!name || imageCache[name] !== undefined || !TMDB_API_KEY) return;

    const fetchImage = async () => {
      try {
        const response = await fetch(`https://api.themoviedb.org/3/search/person?query=${encodeURIComponent(name)}&api_key=${TMDB_API_KEY}&language=vi-VN`);
        const data = await response.json();
        
        let foundImage = null;
        if (data.results && data.results.length > 0) {
          const actor = data.results[0];
          if (actor.profile_path) {
            foundImage = `https://image.tmdb.org/t/p/w200${actor.profile_path}`;
          }
        }
        
        imageCache[name] = foundImage;
        setImageUrl(foundImage);
      } catch (error) {
        console.error('Failed to fetch actor image from TMDB:', error);
        imageCache[name] = null;
      }
    };

    fetchImage();
  }, [name]);

  const fallbackImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=27272a&color=f43f5e&size=128&bold=true`;

  return (
    <Link 
      to={`/tim-kiem?q=${encodeURIComponent(name)}`} 
      className="flex flex-col items-center gap-2 group cursor-pointer"
    >
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-zinc-800 group-hover:border-rose-500 transition-colors bg-zinc-900 shadow-lg">
        <img 
          src={imageUrl || fallbackImage} 
          alt={name} 
          className="w-full h-full object-cover" 
          loading="lazy"
          onError={(e) => {
            // Fallback if TMDB image fails to load
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
      </div>
      <span className="text-xs text-zinc-300 group-hover:text-rose-400 text-center w-16 line-clamp-2 leading-tight">
        {name}
      </span>
    </Link>
  );
};
