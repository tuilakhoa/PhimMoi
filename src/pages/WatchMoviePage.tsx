import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { nguoncApi } from '../services/api';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { MovieDetail, EpisodeItem, Movie } from '../types';
import { Loader2, Play, Calendar, Clock, Globe, Search, ArrowDownAZ, ArrowUpZA, Lightbulb, LightbulbOff, Users, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import { SEO } from '../components/SEO';
import { DeviceCast } from '../components/DeviceCast';
import { auth, signInWithGoogle } from '../lib/firebase';
import { roomService } from '../services/roomService';
import { storage } from '../lib/storage';
import { Comments } from '../components/Comments';

export function WatchMoviePage() {
  const { slug, episodeSlug } = useParams<{ slug: string, episodeSlug?: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeEpisode, setActiveEpisode] = useState<EpisodeItem | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) return;
      setLoading(true);
      try {
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
          storage.addToHistory(res.movie);

          let epToSet = null;
          if (episodeSlug) {
            // Find episode by slug
            if (res.movie.episodes) {
              for (const server of res.movie.episodes) {
                const found = server.items.find((ep) => ep.slug === episodeSlug);
                if (found) {
                  epToSet = found;
                  break;
                }
              }
            }
          }
          
          // If no episode logic holds, select the first
          if (!epToSet && res.movie.episodes && res.movie.episodes.length > 0 && res.movie.episodes[0].items.length > 0) {
            epToSet = res.movie.episodes[0].items[0];
          }

          if (epToSet) {
             setActiveEpisode(epToSet);
             // Optionally update url silently if episodeSlug was missing
             if (!episodeSlug) {
                navigate(`/xem-phim/${slug}/${epToSet.slug}`, { replace: true });
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
  }, [slug, episodeSlug, navigate]);

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

  const generateTitle = (movie: MovieDetail, activeEpisode: EpisodeItem | null) => {
    const isAdult = slug?.startsWith('av-') || slug?.startsWith('tx-') || slug?.startsWith('vs-') || slug?.startsWith('xx-');
    if (isAdult) {
      return activeEpisode 
        ? `Xem phim ${movie.name} - ${activeEpisode.name} Vietsub JAV 18+ | PhimTop1`
        : `Xem phim ${movie.name} - Phim JAV 18+ Vietsub Cực Hay HD | PhimTop1`;
    }
    return activeEpisode 
      ? `Xem phim ${movie.name} (${movie.original_name}) - ${activeEpisode.name} Vietsub Thuyết minh`
      : `Xem phim ${movie.name} (${movie.original_name}) Vietsub Thuyết minh mới nhất`;
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
      "isFamilyFriendly": !isAdult
    };
  };

  const generateKeywords = (movie: MovieDetail) => {
    const isAdult = slug?.startsWith('av-') || slug?.startsWith('tx-') || slug?.startsWith('vs-') || slug?.startsWith('xx-');
    const base = `xem phim, xem phim online, phim hay, phim vietsub, phim thuyết minh, ${movie.name}, ${movie.original_name}`;
    let cats = '';
    if (movie.category && Array.isArray(movie.category)) {
      movie.category.forEach(c => { cats += `, phim ${c.name.toLowerCase()}` });
    }
    return `${base}${cats}${isAdult ? ', phim 18+, jav vietsub' : ''}`;
  };

  return (
    <div className="relative space-y-6 animate-in fade-in duration-500">
      {isFocusMode && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 transition-opacity" 
          onClick={() => setIsFocusMode(false)}
        />
      )}
      <SEO 
          title={generateTitle(movie, activeEpisode)}
          description={movie.description ? movie.description.replace(/<[^>]+>/g, '').trim().substring(0, 160).replace(/\s+/g, ' ') + '...' : `Xem phim ${movie.name} vietsub thuyết minh chất lượng cao. Cập nhật mới nhất tại PhimTop1.`}
          image={movie.poster_url || movie.thumb_url}
          keywords={generateKeywords(movie)}
          type="video.movie"
          schema={getMovieSchema(movie)}
          canonical={`https://phimtop1.asia/xem-phim/${slug}${activeEpisode ? `/${activeEpisode.slug}` : ''}`}
        />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link to={`/film/${slug}`} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Quay lại thông tin phim
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold text-white max-w-xl truncate">
          {movie.name} {activeEpisode ? `- Tập ${activeEpisode.name}` : ''}
        </h1>
      </div>

      {/* Player Section */}
      {activeEpisode && (
        <div className={cn("space-y-4", isFocusMode && "relative z-[70]")}>
          <div className="flex items-center justify-between">
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

      {/* Episodes list */}
      {movie.episodes && movie.episodes.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
              Chọn tập
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
                 title={isReversed ? "Đảo ngược" : "Đảo ngược"}
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
                        <Link
                          key={ep.slug}
                          to={`/xem-phim/${slug}/${ep.slug}`}
                          className={cn(
                            "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                            activeEpisode?.slug === ep.slug
                              ? "bg-rose-500 text-white"
                              : "bg-zinc-900 border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                          )}
                        >
                          {ep.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Comments section */}
      <Comments movieSlug={movie.slug} />
    </div>
  );
}
