import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAge } from '../contexts/AgeContext';

export function AgeBlock({ children, message }: { children: React.ReactNode, message?: string }) {
  const { ageStatus } = useAge();

  if (ageStatus === 'under18') {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-4 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-12 h-12 text-rose-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Nội dung giới hạn độ tuổi</h2>
          <p className="text-zinc-500 max-w-md mx-auto">
            {message || 'Nội dung này được xem xét dành cho người trên 18 tuổi. Hãy quay lại trang chủ hoặc đổi thiết lập nếu bạn đã đủ tuổi.'}
          </p>
        </div>
        <Link 
          to="/" 
          className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
