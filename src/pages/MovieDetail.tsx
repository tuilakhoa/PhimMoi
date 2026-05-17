import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { nguoncApi } from '../services/api';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { MovieDetail, EpisodeItem, Movie } from '../types';
import { Loader2, Play, Calendar, Clock, Globe, Search, ArrowDownAZ, ArrowUpZA, Lightbulb, LightbulbOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { SEO } from '../components/SEO';
import { DeviceCast } from '../components/DeviceCast';
import { ActorAvatar } from '../components/ActorAvatar';
import { StarRating } from '../components/StarRating';
import { MovieCard } from '../components/MovieCard';
import { WatchlistButton } from '../components/WatchlistButton';
import { Comments } from '../components/Comments';
import { storage } from '../lib/storage';
import { roomService } from '../services/roomService';
import { auth, signInWithGoogle } from '../lib/firebase';
import { Users } from 'lucide-react';

export function MovieDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeItem | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);

  const handleCreateWatchParty = async () => {
    if (!movie || !activeEpisode) return;

    if (!auth.currentUser) {
      if (confirm("Bạn cần đăng nhập để tạo phòng xem chung. Đăng nhập ngay?")) {
        await signInWithGoogle().catch(console.error);
      }
      return;
    }

    setCreatingRoom(true);
    try {
      const roomName = `${auth.currentUser.displayName || "Bạn"}'s Party - ${movie.name}`;
      const roomId = await roomService.createRoom(
        roomName, 
        movie.slug, 
        movie.name, 
        activeEpisode.slug, 
        activeEpisode.name
      );
      navigate(`/watch/${roomId}`);
    } catch (e) {
      console.error("Failed to create room", e);
      alert("Không thể tạo phòng xem chung. Vui lòng thử lại!");
    } finally {
      setCreatingRoom(false);
    }
  };

  const [episodeSearch, setEpisodeSearch] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [tmdbScore, setTmdbScore] = useState<number | null>(null);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [relatedMovies, setRelatedMovies] = useState<Movie[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      setTmdbScore(null);
      try {
        const isAdult = slug.startsWith('av-') || slug.startsWith('tx-') || slug.startsWith('vs-') || slug.startsWith('xx-');
        
        let res;
        if (slug.startsWith('xx-')) {
          res = await xxvnApi.getMovieDetail(slug);
        } else if (slug.startsWith('vs-')) {
          res = await vsphimApi.getMovieDetail(slug);
        } else if (slug.startsWith('tx-') || slug.startsWith('av-')) {
          res = await topxxApi.getMovieDetail(slug);
        } else {
          res = await nguoncApi.getMovieDetail(slug);
        }

        if (res.movie) {
          setMovie(res.movie);
          // Save to history
          storage.addToHistory(res.movie);
          // Set first episode as default if available
          if (res.movie.episodes && res.movie.episodes.length > 0 && res.movie.episodes[0].items.length > 0) {
             setActiveEpisode(res.movie.episodes[0].items[0]);
          }

          // Fetch TMDB score (only for non-adult)
          if (!isAdult) {
            const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
            if (TMDB_API_KEY) {
               setTmdbLoading(true);
               try {
                  const query = encodeURIComponent(res.movie.original_name || res.movie.name);
                  const tmdbRes = await fetch(`https://api.themoviedb.org/3/search/multi?query=${query}&api_key=${TMDB_API_KEY}&language=vi-VN`);
                  const tmdbJson = await tmdbRes.json();
                  if (tmdbJson.results && tmdbJson.results.length > 0) {
                     const bestMatch = tmdbJson.results.sort((a: any, b: any) => b.popularity - a.popularity)[0];
                     setTmdbScore(bestMatch.vote_average);
                  }
               } catch(e) {
                  console.error("Failed to fetch TMDB score", e);
               } finally {
                  setTmdbLoading(false);
               }
            }
          }

          // Fetch related
          if (res.movie.category && res.movie.category.length > 0 && !isAdult) {
            setRelatedLoading(true);
            try {
              const relatedRes = await nguoncApi.getMoviesByGenre(res.movie.category[0].slug);
              setRelatedMovies(
                relatedRes.items.filter((m: any) => m.slug !== slug).slice(0, 12)
              );
            } catch (e) {
              console.error("Failed to fetch related movies", e);
            } finally {
              setRelatedLoading(false);
            }
          } else if (isAdult) {
             // For adult, fetch new adult movies from same provider
             setRelatedLoading(true);
             try {
                let relatedRes;
                if (slug.startsWith('xx-')) relatedRes = await xxvnApi.getNewMovies(1);
                else if (slug.startsWith('vs-')) relatedRes = await vsphimApi.getNewMovies(1);
                else relatedRes = await topxxApi.getNewMovies(1);
                
                setRelatedMovies(
                  relatedRes.items.filter((m: any) => m.slug !== slug).slice(0, 12)
                );
             } catch (e) {
                console.error("Failed to fetch related AV", e);
             } finally {
                setRelatedLoading(false);
             }
          }
        }
      } catch (error) {
        console.error('Failed to fetch movie details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!movie) {
    return <div className="text-center text-zinc-400 py-12">Không tìm thấy thông tin phim!</div>;
  }

  const generateKeywords = (movie: MovieDetail) => {
    const isAdult = slug?.startsWith('av-') || slug?.startsWith('tx-') || slug?.startsWith('vs-') || slug?.startsWith('xx-');
    const base = `xem phim, xem phim online, phim hay, phim vietsub, phim thuyết minh, ${movie.name}, ${movie.original_name}`;
    const casts = movie.casts ? `, ${movie.casts}` : '';
    const director = movie.director ? `, ${movie.director}` : '';
    const year = movie.created ? `, phim ${new Date(movie.created).getFullYear()}` : '';
    
    let adultKeywords = '';
    if (isAdult) {
      adultKeywords = ', phim 18+, jav vietsub, phim nguoi lon, phim sex, jav hd, phim jav khong che, jav uncen';
      if (movie.actors) {
        movie.actors.forEach(a => { adultKeywords += `, diễn viên ${a.name}, jav ${a.name}, ${a.name} porn` });
      }
    }

    let cats = '';
    if (movie.category && Array.isArray(movie.category)) {
      movie.category.forEach(c => { cats += `, phim ${c.name.toLowerCase()}` });
    }
    
    return `${base}${casts}${director}${year}${cats}${adultKeywords}`;
  };

  const getMovieSchema = (movie: MovieDetail) => {
    const isAdult = slug?.startsWith('av-') || slug?.startsWith('tx-') || slug?.startsWith('vs-') || slug?.startsWith('xx-');
    return {
      "@context": "https://schema.org",
      "@type": "Movie",
      "name": movie.name,
      "alternateName": movie.original_name,
      "description": movie.description?.replace(/<[^>]+>/g, '').trim(),
      "image": movie.poster_url || movie.thumb_url,
      "dateCreated": movie.created,
      "director": movie.director ? {
        "@type": "Person",
        "name": movie.director
      } : undefined,
      "actor": movie.actors ? movie.actors.map(a => ({
        "@type": "Person",
        "name": a.name
      })) : (movie.casts ? movie.casts.split(',').map(name => ({
        "@type": "Person",
        "name": name.trim()
      })) : []),
      "genre": movie.category?.map(c => c.name),
      "duration": movie.time,
      "isFamilyFriendly": !isAdult
    };
  };

  const generateTitle = (movie: MovieDetail, activeEpisode: EpisodeItem | null) => {
    const isAdult = slug?.startsWith('av-') || slug?.startsWith('tx-') || slug?.startsWith('vs-') || slug?.startsWith('xx-');
    if (isAdult) {
      if (activeEpisode) {
        return `Xem phim ${movie.name} - ${activeEpisode.name} Vietsub JAV 18+`;
      }
      return `Xem phim ${movie.name} - Phim JAV 18+ Vietsub Cực Hay HD`;
    }
    
    if (activeEpisode) {
      return `Xem phim ${movie.name} (${movie.original_name}) - ${activeEpisode.name} Vietsub Thuyết minh`;
    }
    return `Xem phim ${movie.name} (${movie.original_name}) Vietsub Thuyết minh mới nhất`;
  };

  return (
    <div className="relative space-y-8 animate-in fade-in duration-500">
      {isFocusMode && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 transition-opacity" 
          onClick={() => setIsFocusMode(false)}
        />
      )}
      <SEO 
          title={generateTitle(movie, activeEpisode)}
          description={movie.description ? movie.description.replace(/<[^>]+>/g, '').trim().substring(0, 160).replace(/\s+/g, ' ') + '...' : `Xem phim ${movie.name} (${movie.original_name}) vietsub thuyết minh chất lượng cao. Cập nhật mới nhất tại PhimTop1.`}
          image={movie.poster_url || movie.thumb_url}
          keywords={generateKeywords(movie)}
          type="video.movie"
          schema={getMovieSchema(movie)}
          canonical={`https://phimtop1.com/film/${slug}`}
        />
        {/* Player Section */}
        {activeEpisode && (
          <div className={cn("space-y-4", isFocusMode && "relative z-[70]")}>
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-white flex items-center gap-2">
                 <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
                 Tập {activeEpisode.name}
               </h2>
               <div className="flex items-center gap-2">
                 <button 
                    onClick={handleCreateWatchParty}
                    disabled={creatingRoom}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-rose-600 text-white hover:bg-rose-500 transition-all shadow-lg shadow-rose-600/20 disabled:opacity-50"
                 >
                    {creatingRoom ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                    <span>Xem chung</span>
                 </button>
                 <button 
                    onClick={() => setIsFocusMode(!isFocusMode)}
                    className={cn(
                      "group flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                      isFocusMode 
                        ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30" 
                        : "bg-zinc-900/80 text-zinc-400 hover:bg-zinc-800 hover:text-rose-400 border border-zinc-800 hover:border-zinc-700 shadow-sm"
                    )}
                 >
                    {isFocusMode ? (
                      <>
                        <Lightbulb className="w-4 h-4 text-rose-400 fill-rose-400/20" />
                        <span>Tắt chế độ tập trung</span>
                      </>
                    ) : (
                      <>
                        <LightbulbOff className="w-4 h-4 group-hover:text-rose-400 transition-colors" />
                        <span>Chế độ tập trung</span>
                      </>
                    )}
                 </button>
               </div>
            </div>
            
            <div className={cn("w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800 transition-all duration-300", isFocusMode ? "aspect-video max-h-[85vh]" : "aspect-video")}>
              <iframe
                src={activeEpisode.embed || undefined}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="no-referrer"
                title="Movie Player"
              ></iframe>
            </div>
            <DeviceCast currentEpisode={activeEpisode} movie={movie} />
          </div>
        )}

        {/* Info Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <div className="aspect-[2/3] rounded-xl overflow-hidden border border-zinc-800 shadow-2xl relative">
            <img 
              src={movie.thumb_url || undefined} 
              alt={movie.name} 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=300&h=450';
              }}
            />
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {movie.quality && (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                  {movie.quality}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
              <h1 className="text-3xl font-bold text-white">{movie.name}</h1>
              <WatchlistButton movie={movie} showText className="sm:self-start" />
            </div>
            <p className="text-zinc-400 text-lg">{movie.original_name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            {movie.time && (
              <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-rose-500" /> {movie.time}</div>
            )}
            {movie.total_episodes > 0 && (
              <div className="flex items-center gap-1.5"><Play className="w-4 h-4 text-rose-500" /> {movie.current_episode}</div>
            )}
            {movie.language && (
              <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-rose-500" /> {movie.language}</div>
            )}
            {movie.created && (
              <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-rose-500" /> {new Date(movie.created).getFullYear()}</div>
            )}
            {tmdbLoading ? (
              <div className="flex items-center gap-1.5"><Loader2 className="w-4 h-4 text-rose-500 animate-spin" /> TMDB</div>
            ) : tmdbScore !== null ? (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/20 font-bold" title="TMDB Rating">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                {tmdbScore.toFixed(1)} / 10
              </div>
            ) : null}
          </div>

          <div className="pt-2">
            <StarRating movieSlug={movie.slug} />
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <p className="text-zinc-400 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: movie.description }} />
          </div>

          <div className="space-y-2 pt-4">
            {(movie.actors && movie.actors.length > 0) ? (
              <div className="pt-2">
                <span className="text-zinc-500 font-medium text-sm block mb-3">Diễn viên 18+:</span>
                <div className="flex flex-wrap gap-4">
                  {movie.actors.map((actor, idx) => (
                    <ActorAvatar 
                      key={`${idx}-${actor.slug}`} 
                      name={actor.name} 
                      avatar={actor.avatar} 
                    />
                  ))}
                </div>
              </div>
            ) : movie.casts && (
              <div className="pt-2">
                <span className="text-zinc-500 font-medium text-sm block mb-3">Diễn viên:</span>
                <div className="flex flex-wrap gap-4">
                  {movie.casts.split(',').map((actor, idx) => {
                    const trimmedName = actor.trim();
                    if (!trimmedName) return null;
                    return <ActorAvatar key={`${idx}-${trimmedName}`} name={trimmedName} />;
                  })}
                </div>
              </div>
            )}
            {movie.director && (
              <div className="text-sm flex flex-wrap gap-2 items-center">
                <span className="text-zinc-500 font-medium mr-2">Đạo diễn:</span>
                {movie.director.split(',').map((dir, idx) => {
                  const trimmedDir = dir.trim();
                  if (!trimmedDir) return null;
                  return (
                    <Link 
                      key={idx} 
                      to={`/tim-kiem?q=${encodeURIComponent(trimmedDir)}`}
                      className="text-zinc-300 hover:text-rose-400 transition-colors bg-zinc-900/50 px-2 py-1 rounded-sm cursor-pointer"
                    >
                      {trimmedDir}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episodes */}
      {movie.episodes && movie.episodes.length > 0 && (
        <div className="space-y-4 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
              Danh sách tập
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tập..."
                  value={episodeSearch}
                  onChange={(e) => setEpisodeSearch(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 text-sm text-white rounded-md pl-9 pr-3 py-1.5 focus:outline-none focus:border-rose-500 w-full sm:w-48 placeholder:text-zinc-600 transition-colors"
                />
              </div>
              <button
                onClick={() => setIsReversed(!isReversed)}
                className="bg-zinc-900 border border-zinc-700 text-zinc-400 p-1.5 rounded-md hover:text-white hover:border-zinc-500 transition-colors"
                title={isReversed ? "Đảo ngược (Mới nhất - Cũ nhất)" : "Đảo ngược (Cũ nhất - Mới nhất)"}
              >
                {isReversed ? <ArrowUpZA className="w-4 h-4" /> : <ArrowDownAZ className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            {movie.episodes.map((server, idx) => {
              let filteredItems = server.items;
              
              if (episodeSearch.trim() !== '') {
                filteredItems = filteredItems.filter(ep => ep.name.toLowerCase().includes(episodeSearch.toLowerCase()));
              }
              
              if (isReversed) {
                filteredItems = [...filteredItems].reverse();
              }
              
              if (filteredItems.length === 0) return null;

              return (
                <div key={idx} className="space-y-3">
                  <h3 className="text-sm font-medium text-zinc-400">Server: {server.server_name}</h3>
                  <div className="max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex flex-wrap gap-2">
                      {filteredItems.map((ep) => (
                        <button
                          key={ep.slug}
                          onClick={() => {
                            setActiveEpisode(ep);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            activeEpisode?.slug === ep.slug
                              ? "bg-rose-500 text-white"
                              : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          )}
                        >
                          {ep.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Images Gallery */}
      {movie.images && movie.images.length > 0 && (
        <div className="pt-8 border-t border-zinc-800 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
            Ảnh phim
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movie.images.map((img, idx) => (
              <div key={idx} className="aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group cursor-pointer">
                <img 
                  src={img.path} 
                  alt={`Screenshot ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                  onClick={() => window.open(img.path, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Movies */}
      {relatedMovies.length > 0 && (
        <div className="pt-8 border-t border-zinc-800 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
            Phim Liên Quan
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {relatedMovies.map((item) => (
              <MovieCard key={`related-${item.slug}`} movie={item} />
            ))}
          </div>
        </div>
      )}

      {/* Comments section */}
      <Comments movieSlug={movie.slug} />
    </div>
  );
}
