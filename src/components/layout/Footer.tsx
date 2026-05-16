import { Link, useLocation } from 'react-router-dom';
import { useAge } from '../../contexts/AgeContext';
import { MonitorPlay } from 'lucide-react';
import { cn } from '../../lib/utils';

const GENRES = [
  { name: 'Hành Động', slug: 'hanh-dong' },
  { name: 'Phiêu Lưu', slug: 'phieu-luu' },
  { name: 'Hoạt Hình', slug: 'hoat-hinh' },
  { name: 'Hài', slug: 'hai' },
  { name: 'Hình Sự', slug: 'hinh-su' },
  { name: 'Tài Liệu', slug: 'tai-lieu' },
  { name: 'Chính Kịch', slug: 'chinh-kich' },
  { name: 'Gia Đình', slug: 'gia-dinh' },
  { name: 'Giả Tưởng', slug: 'gia-tuong' },
  { name: 'Lịch Sử', slug: 'lich-su' },
  { name: 'Kinh Dị', slug: 'kinh-di' },
  { name: 'Bí Ẩn', slug: 'bi-an' },
  { name: 'Lãng Mạn', slug: 'lang-man' },
  { name: 'Khoa Học Viễn Tưởng', slug: 'khoa-hoc-vien-tuong' },
];

const COUNTRIES = [
  { name: 'Âu Mỹ', slug: 'au-my' },
  { name: 'Anh', slug: 'anh' },
  { name: 'Trung Quốc', slug: 'trung-quoc' },
  { name: 'Hàn Quốc', slug: 'han-quoc' },
  { name: 'Nhật Bản', slug: 'nhat-ban' },
  { name: 'Thái Lan', slug: 'thai-lan' },
  { name: 'Đài Loan', slug: 'dai-loan' },
  { name: 'Việt Nam', slug: 'viet-nam' },
];

const YEARS = Array.from({ length: 2026 - 2018 + 1 }, (_, i) => 2026 - i);

export function Footer() {
  const { ageStatus, setAgeStatus } = useAge();
  const location = useLocation();
  const isAdultPage = location.pathname.startsWith('/nguoi-lon') || location.pathname.startsWith('/dien-vien-18');

  return (
    <footer className="bg-zinc-950 border-t border-zinc-800 pt-16 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
          <div className="space-y-4">
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
            <p className="text-zinc-400 leading-relaxed">
              Tất cả nội dung của trang web này được thu thập từ các trang web video chính thống trên Internet và không cung cấp phát trực tuyến chính hãng.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Thể Loại</h3>
            <ul className="grid grid-cols-2 gap-2 text-zinc-400">
              {GENRES.map((g) => (
                <li key={g.slug}>
                  <Link to={`/the-loai/${g.slug}`} className="hover:text-rose-400 transition-colors">
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Quốc Gia</h3>
            <ul className="grid grid-cols-2 gap-2 text-zinc-400">
              {COUNTRIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/quoc-gia/${c.slug}`} className="hover:text-rose-400 transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">Năm Phát Hành</h3>
            <ul className="grid grid-cols-3 gap-2 text-zinc-400">
              {YEARS.map((y) => (
                <li key={y}>
                  <Link to={`/nam-phat-hanh/${y}`} className="hover:text-rose-400 transition-colors">
                    {y}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-900 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-zinc-500 text-xs">
          <p>Copyright © 2026 PhimTop1. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="#" className="hover:text-white transition-colors">Giới thiệu</Link>
            <Link to="#" className="hover:text-white transition-colors">Khiếu nại bản quyền</Link>
            <Link to="/api-docs" className="hover:text-white transition-colors text-rose-400 font-medium italic underline underline-offset-4">API Documentation</Link>
            <button onClick={() => setAgeStatus(ageStatus === 'adult' ? 'under18' : 'adult')} className="hover:text-white transition-colors relative group">
              Thiết lập: {ageStatus === 'adult' ? 'Trên 18+' : 'Dưới 18'}
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Nhấn để thay đổi</span>
            </button>
            <Link to="#" className="hover:text-white transition-colors">Yêu Cầu Phim</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
