import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useAge } from '../contexts/AgeContext';

export function AgeGate() {
  const { ageStatus, setAgeStatus } = useAge();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (ageStatus === null) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [ageStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-2xl max-w-md w-full text-center space-y-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8 text-rose-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Cảnh báo độ tuổi</h2>
          <p className="text-zinc-400 leading-relaxed">
            Trang web có chứa một số nội dung dành cho người lớn. Vui lòng xác nhận độ tuổi của bạn để chúng tôi tối ưu hiển thị.
          </p>
        </div>
        <div className="grid gap-3">
          <button
            onClick={() => setAgeStatus('adult')}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-rose-600/20"
          >
            Tôi đã đủ 18 tuổi
          </button>
          <button
            onClick={() => setAgeStatus('under18')}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
          >
            Tôi chưa đủ 18 tuổi
          </button>
        </div>
        <p className="text-xs text-zinc-600">
          * Việc chọn chưa đủ 18 tuổi sẽ ẩn các nội dung nhạy cảm. Bạn có thể thay đổi thiết lập này sau ở thanh điều hướng.
        </p>
      </div>
    </div>
  );
}
