import { useEffect, useState } from 'react';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2, Zap, Server, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';

import { AgeBlock } from '../components/AgeBlock';

const PROVIDERS = [
  { id: 'vsphim', name: 'Nguồn VSPhim' },
  { id: 'topxx', name: 'Nguồn TopXX' },
  { id: 'xxvn', name: 'Nguồn XXVN' }
];

const CATEGORIES = [
  { id: undefined, name: 'Tất cả' },
  { id: 'jav', name: 'JAV' },
  { id: 'hentai', name: 'Hentai' },
  { id: 'sex-my', name: 'Sex Mỹ' },
  { id: 'sex-vn', name: 'Sex VN' },
  { id: 'hot', name: 'Siêu Hot' },
];

const COUNTRIES = [
  { code: undefined, name: 'Tất cả quốc gia' },
  { code: 'vn', name: 'Việt Nam' },
  { code: 'cn', name: 'Trung Quốc' },
  { code: 'us', name: 'Mỹ' },
  { code: 'ru', name: 'Nga' },
  { code: 'jp', name: 'Nhật Bản' },
  { code: 'es', name: 'Tây Ban Nha' },
];

export function AdultPage() {
  const [data, setData] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [provider, setProvider] = useState('vsphim');

  const getSEOData = () => {
    let title = "Phim Người Lớn 18+ Mới Nhất - Phim JAV Vietsub Không Che";
    let description = "Tổng hợp phim người lớn 18+, phim JAV Nhật Bản, phim sex Âu Mỹ, phim người đóng chất lượng cao 4K. Cập nhật tập mới liên tục mỗi ngày.";
    let keywords = "phim 18+, phim nguoi lon, jav vietsub, phim sex, phim jav khong che, jav hd, phim cap 3, phim tinh duc";

    if (selectedCategory) {
       const catName = CATEGORIES.find(c => c.id === selectedCategory)?.name;
       if (catName) {
         title = `Phim 18+ ${catName} Mới Nhất`;
         description += ` Khám phá danh mục ${catName}.`;
         keywords += `, ${catName}`;
       }
    }

    if (selectedCountry) {
      const countryName = COUNTRIES.find(c => c.code === selectedCountry)?.name;
      if (countryName) {
        title = `Phim 18+ ${countryName} - Phim Người Lớn ${countryName} Hay Nhất`;
        description = `Kho phim 18+ ${countryName}, phim sex ${countryName} vietsub chất lượng HD. Xem phim người lớn ${countryName} tốc độ cao, không giật lag.`;
        keywords += `, phim 18+ ${countryName}, phim nguoi lon ${countryName}, jav ${countryName}`;
      }
    }

    if (page > 1) {
      title += ` - Trang ${page}`;
    }

    return { title, description, keywords };
  };

  const seoData = getSEOData();

  useEffect(() => {
    const fetchMovies = async () => {
      if (page === 1) setLoading(true);
      else setLoadingMore(true);
      try {
        let res;
        if (provider === 'topxx') {
          if (selectedCountry) {
            res = await topxxApi.getMoviesByCountry(selectedCountry, page);
          } else {
            res = await topxxApi.getNewMovies(page, selectedCategory);
          }
        } else if (provider === 'xxvn') {
          // XXVN currently might only support new movies without filters easily, or we just pass it if the api supports
          // We'll stick to new movies for XXVN since its docs only showed phim-moi-cap-nhat
          res = await xxvnApi.getNewMovies(page);
        } else {
          // VSPHIM
          res = await vsphimApi.getNewMovies(page, selectedCategory, selectedCountry);
        }
        
        setData(prev => page === 1 ? res.items : [...prev, ...res.items]);
        if (res.paginate) {
           setTotalPages(res.paginate.total_page || 100);
        }
      } catch (error) {
        console.error('Failed to fetch adult movies:', error);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchMovies();
  }, [page, selectedCountry, selectedCategory, provider]);

  const handleCountryChange = (countryCode: string | undefined) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedCountry(countryCode);
    setSelectedCategory(undefined);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedCategory(categoryId);
    setSelectedCountry(undefined);
    setPage(1);
  };

  const handleProviderChange = (newProvider: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setProvider(newProvider);
    setPage(1);
    setSelectedCategory(undefined);
    setSelectedCountry(undefined);
  };

  return (
    <AgeBlock>
      <div className="space-y-8 animate-in fade-in duration-500">
        <SEO {...seoData} />
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-rose-500 fill-rose-500" />
            Phim Người Lớn 18+
          </h1>
          
          <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 overflow-x-auto custom-scrollbar rounded-xl p-1 shadow-lg">
            <Server className="w-4 h-4 text-zinc-500 ml-2" />
            {PROVIDERS.map((prov) => (
              <button
                key={prov.id}
                onClick={() => handleProviderChange(prov.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                  provider === prov.id
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {prov.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Categories list */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20 translate-y-[-1px]'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
                disabled={provider === 'xxvn' && cat.id !== undefined}
                title={provider === 'xxvn' ? 'XXVN chưa hỗ trợ bộ lọc trực tiếp' : ''}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Countries list */}
          <div className="flex flex-wrap gap-2">
            {COUNTRIES.map((ct) => (
              <button
                key={ct.name}
                onClick={() => handleCountryChange(ct.code)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  selectedCountry === ct.code
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 translate-y-[-1px]'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-white hover:border-zinc-700'
                }`}
                disabled={provider === 'xxvn' && ct.code !== undefined}
                title={provider === 'xxvn' ? 'XXVN chưa hỗ trợ bộ lọc trực tiếp' : ''}
              >
                {ct.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data.map((movie, idx) => (
              <MovieCard key={`${movie.slug}-${idx}`} movie={movie} showInteractiveBadge={true} />
            ))}
          </div>

          {page < totalPages && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={loadingMore}
                className="group relative px-8 py-3.5 bg-zinc-900 border border-zinc-800 rounded-full text-white font-medium hover:bg-zinc-800 hover:border-zinc-700 hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="relative flex items-center gap-2">
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-rose-500" />
                      Đang tải thêm...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-rose-500 group-hover:scale-110 transition-transform" />
                      Tải thêm phim
                    </>
                  )}
                </div>
              </button>
            </div>
          )}
        </>
      )}
      </div>
    </AgeBlock>
  );
}
