import { useEffect, useState } from 'react';
import { topxxApi } from '../services/topxxService';
import { vsphimApi, xxvnApi } from '../services/adultService';
import { Movie } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2, Zap, ChevronLeft, ChevronRight, Server } from 'lucide-react';
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
      setLoading(true);
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
        
        setData(res.items);
        if (res.paginate) {
           setTotalPages(res.paginate.total_page);
        }
      } catch (error) {
        console.error('Failed to fetch adult movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, selectedCountry, selectedCategory, provider]);

  const handleCountryChange = (countryCode: string | undefined) => {
    setSelectedCountry(countryCode);
    setSelectedCategory(undefined);
    setPage(1);
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    setSelectedCategory(categoryId);
    setSelectedCountry(undefined);
    setPage(1);
  };

  const handleProviderChange = (newProvider: string) => {
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-rose-500 fill-rose-500" />
            Phim Người Lớn 18+
          </h1>
          
          <div className="flex items-center gap-2 bg-zinc-900 overflow-x-auto custom-scrollbar rounded-xl p-1">
            <Server className="w-4 h-4 text-zinc-500 ml-2" />
            {PROVIDERS.map((prov) => (
              <button
                key={prov.id}
                onClick={() => handleProviderChange(prov.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
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

        <div className="space-y-6">
          {/* Categories list */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
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
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCountry === ct.code
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {data.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 pt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-30 hover:bg-zinc-800 transition-colors text-white"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-zinc-400 font-medium">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="p-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-30 hover:bg-zinc-800 transition-colors text-white"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
      </div>
    </AgeBlock>
  );
}
