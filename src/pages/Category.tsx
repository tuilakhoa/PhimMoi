import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { nguoncApi } from '../services/api';
import { MovieListResponse } from '../types';
import { MovieCard } from '../components/MovieCard';
import { Loader2, ArrowUpDown, Calendar } from 'lucide-react';
import { SEO } from '../components/SEO';

const YEARS = Array.from({ length: 2026 - 1990 + 1 }, (_, i) => 2026 - i);

export function Category() {
  const { slug, year } = useParams<{ slug: string; year: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const page = parseInt(searchParams.get('page') || '1');

  const [data, setData] = useState<MovieListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('default');

  const sortedItems = useMemo(() => {
    if (!data?.items) return [];
    return [...data.items].sort((a, b) => {
      if (sortBy === 'year-desc') {
        return parseInt(b.created || '0') - parseInt(a.created || '0');
      }
      if (sortBy === 'year-asc') {
        return parseInt(a.created || '0') - parseInt(b.created || '0');
      }
      if (sortBy === 'az') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [data?.items, sortBy]);

  useEffect(() => {
    const fetchMovies = async () => {
      const currentSlug = slug || year;
      if (!currentSlug) return;
      
      setLoading(true);
      try {
        let res;
        if (location.pathname.startsWith('/the-loai')) {
          res = await nguoncApi.getMoviesByGenre(currentSlug, page);
        } else if (location.pathname.startsWith('/quoc-gia')) {
          res = await nguoncApi.getMoviesByCountry(currentSlug, page);
        } else if (location.pathname.startsWith('/nam-phat-hanh')) {
          res = await nguoncApi.getMoviesByYear(currentSlug, page);
        } else {
          res = await nguoncApi.getMoviesByCategory(currentSlug, page);
        }
        setData(res);
      } catch (error) {
        console.error('Failed to fetch category movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [slug, year, page, location.pathname]);

  const categoryNameMap: Record<string, string> = {
    'phim-bo': 'Phim Bộ',
    'phim-le': 'Phim Lẻ',
    'tv-shows': 'TV Shows',
    'hoat-hinh': 'Hoạt Hình',
    'phim-dang-chieu': 'Phim Đang Chiếu',
    // Thể loại
    'short-drama': 'Phim Short Drama',
    'hanh-dong': 'Phim Hành Động',
    'tinh-cam': 'Phim Tình Cảm',
    'hai-huoc': 'Phim Hài Hước',
    'co-trang': 'Phim Cổ Trang',
    'tam-ly': 'Phim Tâm Lý',
    'hinh-su': 'Phim Hình Sự',
    'chien-tranh': 'Phim Chiến Tranh',
    'the-thao': 'Phim Thể Thao',
    'vo-thuat': 'Phim Võ Thuật',
    'vien-tuong': 'Phim Viễn Tưởng',
    'phieu-luu': 'Phim Phiêu Lưu',
    'khoa-hoc': 'Phim Khoa Học',
    'kinh-di': 'Phim Kinh Dị',
    'am-nhac': 'Phim Âm Nhạc',
    'than-thoai': 'Phim Thần Thoại',
    'tai-lieu': 'Phim Tài Liệu',
    'gia-dinh': 'Phim Gia Đình',
    'chinh-kich': 'Phim Chính Kịch',
    'bi-an': 'Phim Bí ẩn',
    'hoc-duong': 'Phim Học Đường',
    'kinh-dien': 'Phim Kinh Điển',
    'phim-18': 'Phim 18+',
    
    // Legacy maps
    'hai': 'Phim Hài',
    'gia-tuong': 'Phim Giả Tưởng',
    'lich-su': 'Phim Lịch Sử',
    'lang-man': 'Phim Lãng Mạn',
    'khoa-hoc-vien-tuong': 'Phim Khoa Học Viễn Tưởng',

    // Quốc gia
    'au-my': 'Phim Âu Mỹ',
    'anh': 'Phim Anh',
    'trung-quoc': 'Phim Trung Quốc',
    'han-quoc': 'Phim Hàn Quốc',
    'nhat-ban': 'Phim Nhật Bản',
    'thai-lan': 'Phim Thái Lan',
    'dai-loan': 'Phim Đài Loan',
    'viet-nam': 'Phim Việt Nam',
  };

  const currentSlug = slug || year;
  const title = currentSlug ? categoryNameMap[currentSlug] || (year ? `Phim năm ${year}` : 'Danh Sách Phim') : 'Danh Sách Phim';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SEO title={title} description={`Xem ${title.toLowerCase()} mới nhất, cập nhật liên tục.`} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
          {title}
        </h1>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          {/* Year Filter */}
          <form 
            className="flex items-center gap-2 flex-1 sm:flex-none relative"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const y = formData.get('year') as string;
              if (y && y.length === 4) {
                navigate(`/nam-phat-hanh/${y}`);
              }
            }}
          >
            <div className="relative flex-1 sm:w-36 flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                name="year"
                list="year-options"
                defaultValue={year || ''}
                placeholder="Nhập năm..."
                className="w-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-rose-500/50 focus:bg-zinc-900 transition-all shadow-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                  }
                }}
                onChange={(e) => {
                  const y = e.target.value;
                  if (y.length === 4) {
                    navigate(`/nam-phat-hanh/${y}`);
                  }
                }}
              />
            </div>
            <datalist id="year-options">
              {YEARS.map(y => (
                <option key={y} value={y.toString()} />
              ))}
            </datalist>
          </form>

          {/* Sort Dropdown */}
          {data && data.items.length > 0 && (
            <div className="relative flex-1 sm:flex-none flex items-center">
              <ArrowUpDown className="absolute left-3 w-4 h-4 text-zinc-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto bg-zinc-900/80 appearance-none border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 rounded-lg pl-9 pr-8 py-2.5 outline-none focus:border-rose-500/50 focus:bg-zinc-900 transition-all shadow-sm cursor-pointer"
              >
                <option value="default">Mặc định</option>
                <option value="year-desc">Gần nhất</option>
                <option value="year-asc">Cũ nhất</option>
                <option value="az">A - Z</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-zinc-500 text-xs">▼</div>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {sortedItems.map((movie) => (
              <MovieCard key={movie.slug} movie={movie} />
            ))}
          </div>

          {data && data.paginate && (
            <div className="flex justify-center items-center gap-4 pt-8">
              <button
                onClick={() => setSearchParams({ page: Math.max(1, page - 1).toString() })}
                disabled={page === 1}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                Trang trước
              </button>
              <span className="text-zinc-400">
                {page} / {data.paginate.total_page}
              </span>
              <button
                onClick={() => setSearchParams({ page: (page + 1).toString() })}
                disabled={page >= data.paginate.total_page}
                className="px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md disabled:opacity-50 hover:bg-zinc-800 transition-colors"
              >
                Trang sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
