import React, { useEffect, useState } from 'react';
import { topxxApi } from '../services/topxxService';
import { Actor } from '../types';
import { Loader2, Users, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Link } from 'react-router-dom';
import { AgeBlock } from '../components/AgeBlock';

export function ActorsPage() {
  const [data, setData] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchActors = async () => {
      setLoading(true);
      try {
        const res = await topxxApi.getActors(page, searchTerm);
        setData(res.items);
        if (res.paginate) {
           setTotalPages(res.paginate.total_page);
        }
      } catch (error) {
        console.error('Failed to fetch actors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchActors();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(search);
    setPage(1);
  };

  return (
    <AgeBlock>
      <div className="space-y-8 animate-in fade-in duration-500">
        <SEO title="Diễn viên Phim 18+ - PhimTop1" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-rose-500 fill-rose-500" />
          Diễn viên Phim 18+
        </h1>

        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Tìm diễn viên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 text-white pl-4 pr-10 py-2 rounded-full border border-zinc-800 focus:outline-none focus:border-rose-500 text-sm transition-all shadow-lg"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-rose-500">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-rose-600 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {data.map((actor) => (
              <Link
                key={actor.slug}
                to={`/tim-kiem?q=${encodeURIComponent(actor.name)}`}
                className="group flex flex-col items-center bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 hover:border-rose-500/50 hover:bg-zinc-900 transition-all duration-300"
              >
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 border-2 border-zinc-800 group-hover:border-rose-500 transition-colors bg-zinc-800 shadow-xl">
                  <img
                    src={actor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(actor.name)}&background=27272a&color=f43f5e&size=128&bold=true`}
                    alt={actor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  {actor.movies_count > 0 && (
                    <div className="absolute bottom-0 right-0 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-black/20">
                      {actor.movies_count}
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-rose-400 transition-colors text-center line-clamp-1">
                  {actor.name}
                </h3>
                {actor.gender && (
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                    {actor.gender === 'female' ? 'Nữ diễn viên' : 'Nam diễn viên'}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = page <= 3 ? i + 1 : page + i - 2;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                          : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg bg-zinc-900 text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {!loading && data.length === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[300px] text-zinc-500 space-y-4 bg-zinc-900/30 rounded-3xl border border-dashed border-zinc-800">
          <Users className="w-12 h-12 opacity-20" />
          <p>Không tìm thấy diễn viên nào</p>
        </div>
      )}
      </div>
    </AgeBlock>
  );
}
