import React, { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { cosplayService, CosplayAlbum } from '../services/cosplayService';
import { Loader2, Camera, User, Heart, Sparkles, Search, X, RefreshCw, AlertCircle } from 'lucide-react';
import { SEO } from '../components/SEO';
import { cn } from '../lib/utils';
import { AgeBlock } from '../components/AgeBlock';

function CosplayCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 animate-pulse">
      <div className="aspect-[3/4] bg-zinc-800"></div>
      <div className="p-4">
        <div className="h-5 bg-zinc-800 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
      </div>
    </div>
  );
}

export function CosplayPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const cosplayerQuery = searchParams.get('cosplayer');
  const keywordQuery = searchParams.get('q');
  const categoryParam = searchParams.get('cat');
  const navigate = useNavigate();
  
  const [albums, setAlbums] = useState<CosplayAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAlbumsCount, setTotalAlbumsCount] = useState(0);
  const [searchInput, setSearchInput] = useState(keywordQuery || cosplayerQuery || '');
  const [notification, setNotification] = useState<{message: string, type: 'info' | 'success'} | null>(null);

  const categories = [
    { id: 0, name: 'Tất cả', slug: 'all' },
    { id: 193, name: 'Nude 18+', slug: 'nude' },
    { id: 589, name: 'AI Art', slug: 'ai-art' },
  ];

  const currentCategoryId = categoryParam ? parseInt(categoryParam, 10) : (cosplayerQuery || keywordQuery ? 0 : 193);

  // Auto-hide notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Reset page and albums when query/category changes
  useEffect(() => {
    setPage(1);
    setIsLoading(true);
  }, [cosplayerQuery, keywordQuery, categoryParam]);

  const fetchAlbums = async (targetPage: number, isRefresh: boolean = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const query = keywordQuery || cosplayerQuery || undefined;
      const catId = query ? undefined : currentCategoryId || undefined;
      
      const { albums: newAlbums, totalPages: tp, totalAlbums } = await cosplayService.getAlbums(targetPage, query, catId);
      
      if (isRefresh) {
        setAlbums(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const trulyNew = newAlbums.filter(a => !existingIds.has(a.id));
          
          if (trulyNew.length > 0) {
            setNotification({ 
              message: `Đã tìm thấy ${trulyNew.length} album mới nhất!`, 
              type: 'success' 
            });
            return [...trulyNew, ...prev];
          } else {
            setNotification({ 
              message: 'Danh sách đã là mới nhất.', 
              type: 'info' 
            });
            return prev;
          }
        });
      } else {
        if (targetPage === 1) {
          setAlbums(newAlbums);
        } else {
          setAlbums(prev => {
            const existingIds = new Set(prev.map(a => a.id));
            const uniqueNew = newAlbums.filter(a => !existingIds.has(a.id));
            return [...prev, ...uniqueNew];
          });
        }
      }
      
      setTotalPages(tp);
      setTotalAlbumsCount(totalAlbums);
    } catch (error) {
      console.error('Failed to fetch cosplay albums:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlbums(page);
  }, [page, cosplayerQuery, keywordQuery, currentCategoryId]);

  // Auto-check for updates when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isLoading && !isRefreshing && page === 1) {
        handleRefresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isLoading, isRefreshing, page]);

  const handleRefresh = () => {
    fetchAlbums(1, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategoryChange = (id: number) => {
    if (id === 0) {
      setSearchParams({});
    } else {
      setSearchParams({ cat: id.toString() });
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <AgeBlock>
      <div className="w-full space-y-8 pb-20">
        <SEO 
        title="Cosplay Nude 18+ - Ảnh Cosplay Nghệ Thuật"
        description="Kho ảnh cosplay nude 18+, album ảnh cosplay nghệ thuật nóng bỏng từ các cosplayer nổi tiếng. Cập nhật bộ sưu tập mới nhất mỗi ngày."
        keywords="cosplay nude, anh cosplay 18+, cosplay hot, album cosplay, hinh nen cosplay, cosplayer xinh dep"
      />
      {/* Notification Banner */}
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-500`}>
          <div className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl font-bold text-sm",
            notification.type === 'success' 
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-emerald-500/10" 
              : "bg-blue-500/10 border-blue-500/30 text-blue-500 shadow-blue-500/10"
          )}>
            {notification.type === 'success' ? <Sparkles className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {notification.message}
          </div>
        </div>
      )}

      {/* Header & Search */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-rose-600/10 rounded-2xl flex items-center justify-center border border-rose-500/20 shadow-[0_0_20px_-5px_rgba(244,63,94,0.3)]">
              {cosplayerQuery || keywordQuery ? (
                <Search className="w-7 h-7 text-rose-500" />
              ) : (
                <Camera className="w-7 h-7 text-rose-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  {cosplayerQuery ? `Cosplayer: ${cosplayerQuery}` : keywordQuery ? `Tìm kiếm: ${keywordQuery}` : categories.find(c => c.id === currentCategoryId)?.name || 'Cosplay'}
                </h1>
                <div className="flex items-center gap-2">
                  {!isLoading && (
                    <span className="text-sm font-bold bg-rose-500/20 text-rose-500 px-3 py-1 rounded-full border border-rose-500/30 animate-in fade-in zoom-in duration-300">
                      {totalAlbumsCount} Album
                    </span>
                  )}
                  <button 
                    onClick={handleRefresh}
                    disabled={isRefreshing || isLoading}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-600 transition-all disabled:opacity-50 group shadow-lg"
                    title="Làm mới nội dung"
                  >
                    <RefreshCw className={cn("w-5 h-5", (isRefreshing || isLoading) && "animate-spin text-rose-500")} />
                  </button>
                </div>
              </div>
              <p className="text-zinc-400 mt-1 font-medium italic">
                {(cosplayerQuery || keywordQuery)
                  ? `Đã tìm thấy ${totalAlbumsCount} kết quả cho nội dung bạn yêu cầu`
                  : 'Sân chơi nghệ thuật dành riêng cho các tín đồ Cosplay 18+'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="relative group w-full md:w-96">
            <input 
              type="text" 
              placeholder="Tìm album, tên cosplayer..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-12 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 pl-12 text-white placeholder:text-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/50 transition-all duration-300 shadow-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-rose-500 transition-colors" />
            {searchInput && (
              <button 
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Category Filter Chips */}
        {!cosplayerQuery && !keywordQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`flex-shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 border ${
                  currentCategoryId === cat.id
                    ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/20 translate-y-[-1px]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {albums.map((album) => (
            <Link 
              key={album.id} 
              to={`/nguoi-lon/cosplay/${album.id}`}
              className="group block relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 transition-all duration-300"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img 
                  src={album.images[0] || 'https://via.placeholder.com/300x400?text=No+Image'} 
                  alt={album.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10 shadow-xl">
                  <Camera className="w-3.5 h-3.5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  <span className="text-xs font-bold text-white">{album.images.length}</span>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-base font-bold text-white line-clamp-2 leading-tight mb-3 group-hover:text-rose-400 transition-colors drop-shadow-md">
                  {album.title}
                </h3>
                
                <div className="flex flex-col gap-2">
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/nguoi-lon/cosplay?cosplayer=${encodeURIComponent(album.cosplayer)}`);
                    }} 
                    className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors bg-white/10 w-max px-2 py-1 rounded-lg backdrop-blur-md border border-white/5 cursor-pointer z-10 relative"
                  >
                    <User className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-xs font-semibold line-clamp-1">{album.cosplayer}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Heart className="w-3.5 h-3.5" />
                    <span className="text-xs line-clamp-1">{album.character}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
          
          {isLoading && Array.from({ length: 10 }).map((_, i) => (
            <CosplayCardSkeleton key={i} />
          ))}
        </div>

        {page < totalPages && (
          <div className="mt-16 flex justify-center">
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isLoading}
              className="group relative px-8 py-3.5 bg-zinc-900 border border-zinc-800 rounded-full text-white font-medium hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang tải thêm...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                    Xem thêm
                  </>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </AgeBlock>
  );
}
