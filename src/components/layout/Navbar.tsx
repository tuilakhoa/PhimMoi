import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, MonitorPlay, Heart, History, Sparkles, Film, Tv, PlayCircle, Flame, Lock, User, Camera } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAge } from '../../contexts/AgeContext';

const ALL_LINKS = [
  { name: 'Phim Mới', slug: '/', icon: PlayCircle },
  { name: 'TV Shows', slug: '/danh-sach/tv-shows', icon: MonitorPlay },
  { name: 'Phim Bộ', slug: '/danh-sach/phim-bo', icon: Tv },
  { name: 'Phim Lẻ', slug: '/danh-sach/phim-le', icon: Film },
  { name: '18+', slug: '/nguoi-lon', icon: Flame, isAdult: true },
  { name: 'Cosplay', slug: '/nguoi-lon/cosplay', icon: Camera, isAdult: true },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { ageStatus } = useAge();

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
            <div className="hidden lg:flex items-center gap-1">
              {VISIBLE_LINKS.map((link) => {
                const active = isActive(link.slug);
                return (
                  <Link
                    key={link.slug}
                    to={link.slug}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border border-transparent",
                      active
                        ? (link.isAdult ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20" : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20")
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    )}
                  >
                    <link.icon className={cn("w-4 h-4", active ? "text-white" : (link.isAdult ? "text-rose-500" : "text-indigo-500"))} />
                    {link.name}
                  </Link>
                );
              })}
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
          <div className="lg:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-6 space-y-6 animate-in slide-in-from-top duration-300 shadow-2xl">
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
          </div>
        )}
      </nav>
    </div>
  );
}
