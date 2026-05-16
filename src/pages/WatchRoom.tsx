import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomService, RoomState, ChatMessage } from '../services/roomService';
import { auth, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { nguoncApi } from '../services/api';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { MovieDetail, EpisodeItem } from '../types';
import { 
  Users, 
  MessageSquare, 
  Send, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Settings, 
  LogOut,
  Loader2,
  Tv
} from 'lucide-react';
import { cn } from '../lib/utils';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export function WatchRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(true);
  const [isHost, setIsHost] = useState(false);
  
  const playerRef = useRef<any>(null);
  const videoElementRef = useRef<HTMLDivElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Auth check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u && roomId) {
        roomService.joinRoom(roomId).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  // Room & Chat sync
  useEffect(() => {
    if (!roomId) return;

    const unsubscribeRoom = roomService.subscribeToRoom(roomId, (roomData) => {
      setRoom(roomData);
      setIsHost(auth.currentUser?.uid === roomData.hostId);
      
      // Update local player if not host and time diff is significant
      if (playerRef.current && auth.currentUser?.uid !== roomData.hostId) {
        const timeDiff = Math.abs(playerRef.current.currentTime() - roomData.currentTime);
        if (timeDiff > 2) {
          playerRef.current.currentTime(roomData.currentTime);
        }
        
        if (roomData.playbackState === 'playing' && playerRef.current.paused()) {
          playerRef.current.play().catch(() => {});
        } else if (roomData.playbackState === 'paused' && !playerRef.current.paused()) {
          playerRef.current.pause();
        }
      }
    });

    const unsubscribeChat = roomService.subscribeToChat(roomId, setMessages);

    return () => {
      unsubscribeRoom();
      unsubscribeChat();
    };
  }, [roomId]);

  // Fetch movie details
  useEffect(() => {
    if (room?.movieSlug) {
      const fetchMovie = async () => {
        try {
          const slug = room.movieSlug;
          let res;
          if (slug.startsWith('xx-')) res = await xxvnApi.getMovieDetail(slug);
          else if (slug.startsWith('vs-')) res = await vsphimApi.getMovieDetail(slug);
          else if (slug.startsWith('tx-') || slug.startsWith('av-')) res = await topxxApi.getMovieDetail(slug);
          else res = await nguoncApi.getMovieDetail(slug);
          
          setMovie(res.movie);
          setLoading(false);
        } catch (e) {
          console.error("Failed to fetch room movie", e);
          setLoading(false);
        }
      };
      fetchMovie();
    }
  }, [room?.movieSlug]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize Video.js
  useEffect(() => {
    if (!movie || !room || !videoElementRef.current) return;

    const activeEp = movie.episodes.flatMap(s => s.items).find(i => i.slug === room.activeEpisodeSlug);
    if (!activeEp || !activeEp.m3u8) return;

    if (playerRef.current) {
        playerRef.current.dispose();
    }

    const videoElement = document.createElement('video-js');
    videoElement.classList.add('vjs-big-play-centered', 'vjs-theme-city');
    videoElementRef.current.appendChild(videoElement);

    const player = playerRef.current = videojs(videoElement, {
      autoplay: room.playbackState === 'playing',
      controls: isHost, // Only host has full player controls
      fluid: true,
      responsive: true,
      sources: [{
        src: activeEp.m3u8,
        type: 'application/x-mpegURL'
      }]
    });

    if (isHost) {
      player.on('play', () => {
        roomService.updatePlayback(room.id, 'playing', player.currentTime());
      });
      player.on('pause', () => {
        roomService.updatePlayback(room.id, 'paused', player.currentTime());
      });
      player.on('seeked', () => {
        roomService.updatePlayback(room.id, room.playbackState, player.currentTime());
      });
      
      // Periodic sync for host
      const interval = setInterval(() => {
        if (!player.paused()) {
           roomService.updatePlayback(room.id, 'playing', player.currentTime());
        }
      }, 5000);
      return () => clearInterval(interval);
    }
    
    return () => {
      if (player) {
        player.dispose();
        playerRef.current = null;
      }
    }
  }, [movie, room?.activeEpisodeSlug, isHost]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !roomId) return;
    roomService.sendMessage(roomId, chatInput);
    setChatInput('');
  };

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Tv className="w-16 h-16 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Đăng nhập để xem chung</h1>
        <p className="text-zinc-400 mb-8 text-center max-w-md">
          Bạn cần đăng nhập bằng tài khoản Google để tham gia phòng xem chung.
        </p>
        <button 
          onClick={signInWithGoogle}
          className="bg-white text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-zinc-200 transition-colors"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          Tiếp tục với Google
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!room || !movie) {
    return <div className="text-center text-zinc-400 py-12">Phòng không tồn tại hoặc đã bị giải tán!</div>;
  }

  const activeEp = movie.episodes.flatMap(s => s.items).find(i => i.slug === room.activeEpisodeSlug);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] -mt-4 bg-zinc-950 overflow-hidden">
      {/* Player Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-white max-w-[200px] truncate">{room.name}</h1>
            <div className="h-4 w-px bg-zinc-700"></div>
            <div className="text-sm">
              <span className="text-zinc-500">Đang xem:</span>
              <span className="text-rose-500 font-medium ml-2">{movie.name} - {room.activeEpisodeName}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex -space-x-2 mr-2">
                {Object.values(room.users).slice(0, 3).map((u: any, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-white font-bold" title={u.nickname}>
                    {u.nickname.substring(0, 1).toUpperCase()}
                  </div>
                ))}
                {Object.keys(room.users).length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-zinc-950 flex items-center justify-center text-[10px] text-zinc-400">
                    +{Object.keys(room.users).length - 3}
                  </div>
                )}
             </div>
             <button 
                onClick={() => navigate(`/film/${movie.slug}`)}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
                title="Rời phòng"
             >
                <LogOut className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 bg-black flex items-center justify-center relative group">
          {activeEp?.m3u8 ? (
            <div ref={videoElementRef} className="w-full h-full" />
          ) : (
            <div className="w-full h-full">
              <iframe
                src={activeEp?.embed}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                referrerPolicy="no-referrer"
              ></iframe>
              {!isHost && (
                <div className="absolute inset-0 bg-transparent z-10" /> // Guest can't interact with iframe content easily
              )}
            </div>
          )}
          {!isHost && activeEp?.m3u8 && (
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-black/80 px-4 py-2 rounded-full text-xs text-rose-500 font-bold border border-rose-500/30">
                Host đang điều khiển - Playback đang được đồng bộ
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Section */}
      <div className={cn(
        "w-full lg:w-80 border-l border-zinc-800 bg-zinc-900/30 flex flex-col transition-all duration-300",
        !showChat && "w-0 lg:w-0 overflow-hidden"
      )}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold">
            <MessageSquare className="w-4 h-4 text-rose-500" />
            Trò chuyện
          </div>
          <button onClick={() => setShowChat(false)} className="lg:hidden text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex flex-col gap-1", msg.userId === user?.uid && "items-end")}>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-500">{msg.userName}</span>
              </div>
              <div className={cn(
                "px-3 py-2 rounded-2xl text-sm max-w-[90%]",
                msg.userId === user?.uid 
                  ? "bg-rose-600 text-white rounded-tr-none" 
                  : "bg-zinc-800 text-zinc-300 rounded-tl-none"
              )}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-zinc-800">
          <div className="relative">
            <input
              type="text"
              placeholder="Nhắn gì đó..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-full pl-4 pr-10 py-2.5 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-full transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {!showChat && (
        <button 
          onClick={() => setShowChat(true)}
          className="fixed bottom-20 right-6 z-[60] bg-rose-600 text-white p-4 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all lg:static lg:h-full lg:rounded-none lg:bg-zinc-900 lg:p-2 lg:border-l lg:border-zinc-800"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

const X = ({ className, ...props }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className} 
    {...props}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
)
