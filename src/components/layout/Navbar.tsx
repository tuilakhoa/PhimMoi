import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, MonitorPlay, Heart, History, Sparkles, Film, Tv, PlayCircle, Flame, Lock, User, Camera, LogOut, Clapperboard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAge } from '../../contexts/AgeContext';
import { useAuth } from '../../contexts/AuthContext';

const ALL_LINKS = [
  { name: 'Phim Mới', slug: '/', icon: PlayCircle },
  { name: 'TV Shows', slug: '/danh-sach/tv-shows', icon: MonitorPlay },
  { name: 'Phim Bộ', slug: '/danh-sach/phim-bo', icon: Tv },
  { name: 'Phim Lẻ', slug: '/danh-sach/phim-le', icon: Film },
  { name: '18+', slug: '/nguoi-lon', icon: Flame, isAdult: true },
  { name: 'Cosplay', slug: '/nguoi-lon/cosplay', icon: Camera, isAdult: true },
];

const GENRES = [
  { slug: 'short-drama', name: 'Short Drama' },
  { slug: 'hanh-dong', name: 'Hành Động' },
  { slug: 'tinh-cam', name: 'Tình Cảm' },
  { slug: 'hai-huoc', name: 'Hài Hước' },
  { slug: 'co-trang', name: 'Cổ Trang' },
  { slug: 'tam-ly', name: 'Tâm Lý' },
  { slug: 'hinh-su', name: 'Hình Sự' },
  { slug: 'chien-tranh', name: 'Chiến Tranh' },
  { slug: 'the-thao', name: 'Thể Thao' },
  { slug: 'vo-thuat', name: 'Võ Thuật' },
  { slug: 'vien-tuong', name: 'Viễn Tưởng' },
  { slug: 'phieu-luu', name: 'Phiêu Lưu' },
  { slug: 'khoa-hoc', name: 'Khoa Học' },
  { slug: 'kinh-di', name: 'Kinh Dị' },
  { slug: 'am-nhac', name: 'Âm Nhạc' },
  { slug: 'than-thoai', name: 'Thần Thoại' },
  { slug: 'tai-lieu', name: 'Tài Liệu' },
  { slug: 'gia-dinh', name: 'Gia Đình' },
  { slug: 'chinh-kich', name: 'Chính Kịch' },
  { slug: 'bi-an', name: 'Bí ẩn' },
  { slug: 'hoc-duong', name: 'Học Đường' },
  { slug: 'kinh-dien', name: 'Kinh Điển' },
  { slug: 'phim-18', name: 'Phim 18+' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { ageStatus } = useAge();
  const { user, signIn, signOut } = useAuth();

  const VISIBLE_LINKS = ageStatus === 'under18' ? ALL_LINKS.filter(l => !l.isAdult) : ALL_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAdultPage = location.pathname.startsWith('/nguoi-lon') || location.pathname.startsWith('/dien-vien-18');

  return (
    <div className="fixed top-0 w-full z-50">
      {/* Main Navbar */}
      <nav
        className={cn(
          'transition-all duration-500',
          isScrolled 
            ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50 py-2' 
            : 'bg-gradient-to-b from-black/95 via-black/80 to-transparent py-4'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group transition-all shrink-0">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-lg",
                isAdultPage ? "bg-rose-600 shadow-rose-600/20" : "bg-indigo-600 shadow-indigo-600/20"
              )}>
                <MonitorPlay className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black tracking-tighter text-white">
                PHIM<span className={isAdultPage ? "text-rose-500" : "text-indigo-500"}>TOP1</span>
              </span>
            </Link>
            
            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-2">
              <Link
                to="/"
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-transparent",
                  isActive('/') 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )}
              >
                <PlayCircle className={cn("w-4 h-4", isActive('/') ? "text-white" : "text-indigo-500")} />
                Phim Mới
              </Link>

              {/* Danh sách phim Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900/50">
                  <Film className="w-4 h-4 text-indigo-500" />
                  Danh mục
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left flex flex-col p-2">
                  <Link to="/danh-sach/tv-shows" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                    <MonitorPlay className="w-4 h-4 text-indigo-500" />
                    TV Shows
                  </Link>
                  <Link to="/danh-sach/phim-bo" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                    <Tv className="w-4 h-4 text-indigo-500" />
                    Phim Bộ
                  </Link>
                  <Link to="/danh-sach/phim-le" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                    <Film className="w-4 h-4 text-indigo-500" />
                    Phim Lẻ
                  </Link>
                </div>
              </div>

              {/* Thể loại phim Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-900/50">
                  <Clapperboard className="w-4 h-4 text-indigo-500" />
                  Thể loại
                </button>
                <div className="absolute left-0 mt-2 w-[480px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left grid grid-cols-3 gap-1 p-3">
                  {GENRES.map(genre => {
                    if (genre.slug === 'phim-18' && ageStatus === 'under18') return null;
                    return (
                      <Link 
                        key={genre.slug} 
                        to={`/the-loai/${genre.slug}`} 
                        className="px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors truncate"
                      >
                        {genre.name}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* 18+ Dropdown */}
              {(ageStatus !== 'under18') && (
                <div className="relative group">
                  <button className={cn(
                    "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-transparent",
                    isAdultPage 
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                  )}>
                    <Flame className={cn("w-4 h-4", isAdultPage ? "text-white" : "text-rose-500")} />
                    Nội dung 18+
                  </button>
                  <div className="absolute left-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-left flex flex-col p-2">
                    <Link to="/nguoi-lon" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                      <Flame className="w-4 h-4 text-rose-500" />
                      Phim 18+
                    </Link>
                    <Link to="/nguoi-lon/cosplay" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                      <Camera className="w-4 h-4 text-rose-500" />
                      Cosplay
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Search & Profile Items */}
            <div className="flex items-center gap-2 flex-1 justify-end max-w-xl">
              <form onSubmit={handleSearch} className="hidden sm:flex relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="Tìm phim, diễn viên, cosplay..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "w-full bg-zinc-900/80 backdrop-blur-md border text-white text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-1 transition-all placeholder:text-zinc-500",
                    isAdultPage ? "border-rose-900/30 focus:border-rose-500 ring-rose-500/20" : "border-indigo-900/30 focus:border-indigo-500 ring-indigo-500/20"
                  )}
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </form>

              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/yeu-thich"
                  className={cn(
                    "p-2.5 rounded-full transition-all",
                    isActive('/yeu-thich') 
                      ? (isAdultPage ? "bg-rose-600 text-white" : "bg-indigo-600 text-white") 
                      : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                  title="Yêu thích"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <Link
                  to="/lich-su"
                  className={cn(
                    "p-2.5 rounded-full transition-all",
                    isActive('/lich-su') 
                      ? (isAdultPage ? "bg-rose-600 text-white" : "bg-indigo-600 text-white") 
                      : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                  )}
                  title="Lịch sử"
                >
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                
                {user ? (
                  <div className="relative group">
                    <button className="flex items-center gap-2 focus:outline-none">
                      <div className="w-9 h-9 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xs font-bold text-white overflow-hidden transition-transform group-hover:scale-105">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          user.displayName?.charAt(0) || 'U'
                        )}
                      </div>
                    </button>
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                      <div className="p-3 border-b border-zinc-800">
                        <p className="text-sm font-medium text-white truncate">{user.displayName || 'Người dùng'}</p>
                        <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link to="/ho-so" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                          <User className="w-4 h-4" />
                          Hồ sơ
                        </Link>
                        <Link to="/yeu-thich" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                          <Heart className="w-4 h-4" />
                          Phim yêu thích
                        </Link>
                        <Link to="/lich-su" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                          <History className="w-4 h-4" />
                          Lịch sử xem
                        </Link>
                      </div>
                      <div className="p-2 border-t border-zinc-800">
                        <button
                          onClick={() => signOut()}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => signIn()}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                      isAdultPage ? "bg-rose-600 border-rose-500 text-white" : "bg-indigo-600 border-indigo-500 text-white"
                    )}
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Đăng nhập</span>
                  </button>
                )}

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2.5 rounded-full bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-6 space-y-6 animate-in slide-in-from-top duration-300 shadow-2xl h-[calc(100vh-80px)] overflow-y-auto">
            <form onSubmit={handleSearch} className="relative sm:hidden">
              <input
                type="text"
                placeholder="Tìm phim, diễn viên, cosplay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none transition-colors",
                  isAdultPage ? "focus:border-rose-500" : "focus:border-indigo-500"
                )}
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </form>

            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-3">
                Danh Mục Chính
              </h3>
              {VISIBLE_LINKS.map((link) => {
                const active = isActive(link.slug);
                return (
                  <Link
                    key={link.slug}
                    to={link.slug}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all",
                      active 
                        ? (link.isAdult ? "bg-rose-600/10 text-rose-500" : "bg-indigo-600/10 text-indigo-500") 
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    )}
                  >
                    <link.icon className={cn("w-5 h-5 opacity-70", link.isAdult ? "text-rose-500" : "text-indigo-500")} />
                    {link.name}
                  </Link>
                );
              })}
            </div>
            
            <div className="space-y-3">
              <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold px-3">
                Thể Loại Phim
              </h3>
              <div className="grid grid-cols-2 gap-2">
                 {GENRES.map((genre) => {
                   if (genre.slug === 'phim-18' && ageStatus === 'under18') return null;
                   return (
                     <Link
                       key={genre.slug}
                       to={`/the-loai/${genre.slug}`}
                       onClick={() => setIsMobileMenuOpen(false)}
                       className="px-3 py-2.5 rounded-xl text-sm font-medium bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all border border-zinc-800/50 text-center"
                     >
                       {genre.name}
                     </Link>
                   );
                 })}
              </div>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
