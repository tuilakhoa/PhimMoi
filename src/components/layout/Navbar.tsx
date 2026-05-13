import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, MonitorPlay, Heart, History } from 'lucide-react';
import { cn } from '../../lib/utils';

const CATEGORIES = [
  { name: 'Phim Mới', slug: '/' },
  { name: 'Khám Phá', slug: '/kham-pha' },
  { name: 'Phim Bộ', slug: '/danh-sach/phim-bo' },
  { name: 'Phim Lẻ', slug: '/danh-sach/phim-le' },
  { name: 'TV Shows', slug: '/danh-sach/tv-shows' },
  { name: 'Hoạt Hình', slug: '/danh-sach/hoat-hinh' },
  { name: 'Yêu Thích', slug: '/yeu-thich' },
  { name: 'Lịch Sử', slug: '/lich-su' },
  { name: 'Phim 18+', slug: '/nguoi-lon' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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

  return (
    <nav
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300',
        isScrolled ? 'bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-rose-500 hover:text-rose-400 transition-colors">
              <MonitorPlay className="w-8 h-8" />
              <span className="text-xl font-bold tracking-tight">PhimHay</span>
            </Link>
            
            <div className="hidden md:flex gap-1">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  to={cat.slug}
                  className="px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 bg-zinc-900 border border-zinc-700 text-white text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-rose-500 transition-colors"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </form>

            <button
              className="md:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-4 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm phim..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-rose-500 transition-colors"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          </form>
          <div className="flex flex-col space-y-1">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={cat.slug}
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-3 rounded-md text-base font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
