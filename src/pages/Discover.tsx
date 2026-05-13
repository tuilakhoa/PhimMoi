import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, RefreshCcw, Film, Tv, Globe, Heart, Swords, Ghost, Laugh, Search, Frown } from 'lucide-react';
import { MovieCard } from '../components/MovieCard';
import { Movie } from '../types';
import { SEO } from '../components/SEO';

const QUESTIONS = [
  {
    id: 'category',
    question: 'Hôm nay bạn muốn trải nghiệm cảm giác nào?',
    subtitle: 'Chọn một thể loại phản ánh đúng tâm trạng của bạn',
    options: [
      { id: 'hanh-dong', label: 'Kịch tính, mạo hiểm', icon: Swords },
      { id: 'tinh-cam', label: 'Lãng mạn, ngọt ngào', icon: Heart },
      { id: 'hai-huoc', label: 'Vui vẻ, xả stress', icon: Laugh },
      { id: 'kinh-di', label: 'Đáng sợ, giật gân', icon: Ghost },
      { id: 'tam-ly', label: 'Sâu sắc, lắng đọng', icon: Frown },
    ],
  },
  {
    id: 'country',
    question: 'Bạn muốn xem phim của khu vực/quốc gia nào?',
    subtitle: 'Mỗi nền điện ảnh đều có một màu sắc riêng',
    options: [
      { id: 'au-my', label: 'Âu Mỹ (Hollywood)', icon: Globe },
      { id: 'han-quoc', label: 'Hàn Quốc', icon: Globe },
      { id: 'trung-quoc', label: 'Trung Quốc', icon: Globe },
      { id: 'nhat-ban', label: 'Nhật Bản', icon: Globe },
      { id: 'viet-nam', label: 'Việt Nam', icon: Globe },
    ],
  },
  {
    id: 'type',
    question: 'Thời gian bạn dành cho phim là bao lâu?',
    subtitle: 'Chọn định dạng phim phù hợp',
    options: [
      { id: 'single', label: 'Phim lẻ (Xem nhanh)', icon: Film },
      { id: 'series', label: 'Phim bộ (Cày cuốc dài ngày)', icon: Tv },
      { id: 'hoathinh', label: 'Hoạt hình (Anime / Cartoon)', icon: Tv },
    ],
  }
];

export function Discover() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Movie[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      findMovies();
    }
  };

  const findMovies = async () => {
    setLoading(true);
    setHasSearched(true);
    
    try {
      const categorySlug = answers['category'];
      const countrySlug = answers['country'];
      const typeSlug = answers['type'];

      // Fetch first 3 pages of the category to have a good pool for filtering
      const pages = [1, 2, 3];
      const fetchPromises = pages.map(p => 
        fetch(`https://ophim1.com/v1/api/the-loai/${categorySlug}?page=${p}`).then(res => res.json())
      );
      
      const responses = await Promise.all(fetchPromises);
      
      let allItems: any[] = [];
      let domainImage = '';
      
      responses.forEach(json => {
        if (json?.data?.items) {
           allItems = [...allItems, ...json.data.items];
           domainImage = json.data.APP_DOMAIN_CDN_IMAGE;
        }
      });

      // Local Filtering
      const filtered = allItems.filter(item => {
         const matchCountry = item.country?.some((c: any) => c.slug === countrySlug);
         const matchType = item.type === typeSlug;
         return matchCountry && matchType;
      });

      // Deduplicate by slug
      const uniqueMovies = Array.from(new Map(filtered.map(item => [item.slug, item])).values());

      // Shuffle
      uniqueMovies.sort(() => 0.5 - Math.random());

      const mapped = uniqueMovies.slice(0, 10).map((m: any) => ({
        _id: m._id,
        name: m.name,
        slug: m.slug,
        original_name: m.origin_name || '',
        thumb_url: domainImage + '/uploads/movies/' + m.thumb_url,
        poster_url: domainImage + '/uploads/movies/' + m.poster_url,
        created: m.modified?.time || new Date().toISOString(),
        modified: m.modified?.time || new Date().toISOString(),
        description: '',
        total_episodes: 1,
        current_episode: m.episode_current || '',
        time: m.time || '',
        quality: m.quality || '',
        language: m.lang || '',
        director: '',
        casts: ''
      })) as Movie[];

      setResults(mapped);

    } catch (error) {
      console.error("Discover search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResults([]);
    setHasSearched(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 min-h-[70vh] flex flex-col justify-center">
      <SEO 
        title="Khám phá phim - Gợi ý phim theo sở thích"
        description="Tìm kiếm phim hoàn hảo cho bạn dựa trên tâm trạng, thể loại, quốc gia và định dạng bạn yêu thích."
      />
      
      {!hasSearched ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 md:p-12 shadow-2xl relative overflow-hidden">
           {/* Background glow */}
           <div className="absolute top-0 right-0 -m-32 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
           
           <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl">
                 <Sparkles className="w-6 h-6" />
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-white">Khám phá phim</h1>
                 <p className="text-sm text-zinc-400">Trợ lý tìm phim dành riêng cho bạn</p>
              </div>
           </div>

           <div className="mb-8">
              <div className="flex gap-2 mb-6">
                {QUESTIONS.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${idx <= step ? 'bg-rose-500' : 'bg-zinc-800'}`}
                  />
                ))}
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{QUESTIONS[step].question}</h2>
              <p className="text-zinc-400 mb-8">{QUESTIONS[step].subtitle}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {QUESTIONS[step].options.map(option => {
                   const isSelected = answers[QUESTIONS[step].id] === option.id;
                   const Icon = option.icon;
                   return (
                     <button
                       key={option.id}
                       onClick={() => handleSelect(QUESTIONS[step].id, option.id)}
                       className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                         isSelected 
                           ? 'bg-rose-500/10 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                           : 'bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500'
                       }`}
                     >
                       <div className={`p-2 rounded-lg ${isSelected ? 'bg-rose-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <span className="font-medium text-lg">{option.label}</span>
                     </button>
                   );
                 })}
              </div>
           </div>

           <div className="flex justify-between items-center pt-6 border-t border-zinc-800">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="px-6 py-2 rounded-full font-medium text-zinc-400 hover:text-white disabled:opacity-0 transition-opacity"
              >
                Quay lại
              </button>
              
              <button
                onClick={handleNext}
                disabled={!answers[QUESTIONS[step].id]}
                className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-medium flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === QUESTIONS.length - 1 ? 'Khám phá ngay' : 'Tiếp theo'}
                {step === QUESTIONS.length - 1 ? <Search className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
           </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col justify-center items-center h-64 space-y-4">
           <div className="relative">
             <div className="w-16 h-16 border-4 border-zinc-800 border-t-rose-500 rounded-full animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <Film className="w-6 h-6 text-rose-500 animate-pulse" />
             </div>
           </div>
           <p className="text-zinc-400 animate-pulse">Đang tìm kiếm phim phù hợp với bạn...</p>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-700">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                 <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-rose-500" />
                    Kết quả tuyệt vời dành cho bạn
                 </h2>
                 <p className="text-zinc-400 text-sm">
                    {results.length > 0 
                      ? 'Chúng tôi đã tìm thấy những lựa chọn cực kỳ tương ứng với sở thích vừa chọn.'
                      : 'Rất tiếc! Thể loại và quốc gia bạn chọn khá là hiếm kết hợp, vì vậy chưa ra được kết quả ngay. Vui lòng thử lại.'
                    }
                 </p>
              </div>
              <button
                 onClick={handleReset}
                 className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm font-medium w-fit"
              >
                 <RefreshCcw className="w-4 h-4" />
                 Thử lại
              </button>
           </div>
           
           {results.length > 0 && (
             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {results.map((m) => (
                  <MovieCard key={m._id} movie={m} />
                ))}
             </div>
           )}
        </div>
      )}
    </div>
  );
}
