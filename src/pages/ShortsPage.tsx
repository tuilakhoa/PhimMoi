import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { Heart, MessageCircle, Share2, Upload, X, Play, Pause, Loader2 } from 'lucide-react';
import Hls from 'hls.js';

interface Short {
  id: string;
  type: 'clip' | 'upload';
  title: string;
  videoUrl?: string; // used for upload
  movieSlug?: string; // used for clip
  movieName?: string;
  startTime?: number; // seconds
  endTime?: number;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  likesCount: number;
  createdAt: number;
}

export function ShortsPage() {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeShortIndex, setActiveShortIndex] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'shorts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Short));
      setShorts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Intersection Observer for autoplay
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute('data-index'));
          setActiveShortIndex(index);
        }
      });
    }, options);

    const elements = document.querySelectorAll('.short-container');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [shorts]);

  if (loading) {
    return <div className="flex justify-center items-center h-[calc(100vh-120px)]"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="flex justify-center relative h-[calc(100vh-120px)] overflow-hidden">
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={() => {
            if (!auth.currentUser) return alert("Vui lòng đăng nhập để tải lên!");
            setIsUploadModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Tải lên</span>
        </button>
      </div>

      <div className="w-full max-w-md h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {shorts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 snap-start">
            <p>Chưa có video ngắn nào.</p>
            <p className="text-sm mt-2">Hãy là người đầu tiên tải lên!</p>
          </div>
        ) : (
          shorts.map((short, index) => (
            <div key={short.id} data-index={index} className="short-container w-full h-full snap-start relative bg-black flex items-center justify-center">
              <ShortPlayer short={short} isActive={index === activeShortIndex} />
            </div>
          ))
        )}
      </div>

      {isUploadModalOpen && (
        <UploadModal onClose={() => setIsUploadModalOpen(false)} />
      )}
    </div>
  );
}

function ShortPlayer({ short, isActive }: { short: Short, isActive: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [movieStreamUrl, setMovieStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (short.type === 'clip' && short.movieSlug) {
      // Fetch movie details to get m3u8
      const fetchMovie = async () => {
        try {
          const res = await fetch(`https://ophim1.com/v1/api/phim/${short.movieSlug}`);
          const data = await res.json();
          if (active && data.status && data.episodes?.[0]?.server_data?.[0]?.link_m3u8) {
            setMovieStreamUrl(data.episodes[0].server_data[0].link_m3u8);
          }
        } catch (e) {}
      };
      fetchMovie();
    }
    return () => { active = false; };
  }, [short]);

  useEffect(() => {
    if (!videoRef.current) return;
    
    // Setup HLS for clips if needed, else normal video src
    const video = videoRef.current;
    let hls: Hls | null = null;
    
    if (short.type === 'clip' && movieStreamUrl) {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(movieStreamUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = movieStreamUrl;
      }
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [movieStreamUrl, short]);

  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        if (short.type === 'clip' && short.startTime !== undefined) {
           videoRef.current.currentTime = short.startTime;
        }
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, short]);

  const handleTimeUpdate = () => {
    if (short.type === 'clip' && short.endTime && videoRef.current) {
      if (videoRef.current.currentTime >= short.endTime) {
         videoRef.current.currentTime = short.startTime || 0;
         videoRef.current.play();
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleLike = async () => {
    if (!auth.currentUser) return alert("Vui lòng đăng nhập!");
    await updateDoc(doc(db, 'shorts', short.id), {
      likesCount: short.likesCount + 1
    });
  };

  return (
    <div className="relative w-full h-full cursor-pointer" onClick={togglePlay}>
      {short.type === 'upload' && short.videoUrl && (
        <video 
          ref={videoRef}
          src={short.videoUrl}
          className="w-full h-full object-cover"
          loop
          playsInline
        />
      )}
      {short.type === 'clip' && (
        <video 
          ref={videoRef}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          playsInline
        />
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Play className="w-16 h-16 text-white/50" />
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center gap-2 mb-2">
            <img src={short.authorPhoto || `https://ui-avatars.com/api/?name=${short.authorName}`} className="w-8 h-8 rounded-full border border-white/20" alt="" />
            <span className="font-bold text-sm">@{short.authorName}</span>
          </div>
          <p className="text-sm line-clamp-2">{short.title}</p>
          {short.movieName && (
            <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
               <Play className="w-3 h-3" /> Trích từ: {short.movieName}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-4 items-center">
          <button onClick={(e) => { e.stopPropagation(); handleLike(); }} className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <Heart className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">{short.likesCount}</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">0</span>
          </button>
          <button className="flex flex-col items-center gap-1 group">
            <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">0</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleUpload = async () => {
    if (!file || !title.trim() || !auth.currentUser) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('video', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      await addDoc(collection(db, 'shorts'), {
        type: 'upload',
        title,
        videoUrl: data.url,
        authorId: auth.currentUser.uid,
        authorName: auth.currentUser.displayName || 'User',
        authorPhoto: auth.currentUser.photoURL || '',
        likesCount: 0,
        createdAt: Date.now()
      });

      onClose();
    } catch (e: any) {
      alert("Lỗi tải lên: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-bold text-lg">Tải Video Ngắn</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Mô tả / Tiêu đề</label>
            <input 
              type="text" 
              maxLength={200}
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Viết mô tả ngắn cho video..."
            />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Chọn Video (mp4, webm)</label>
            <input 
              type="file" 
              accept="video/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm text-zinc-300 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 transition-colors cursor-pointer"
            />
          </div>
          <button 
            disabled={!file || !title.trim() || isSubmitting}
            onClick={handleUpload}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-6"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {isSubmitting ? "Đang tải lên..." : "Đăng Video"}
          </button>
        </div>
      </div>
    </div>
  );
}
