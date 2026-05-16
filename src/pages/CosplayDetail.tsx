import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cosplayService, CosplayAlbum } from '../services/cosplayService';
import { Loader2, ArrowLeft, Camera, User, Heart, Calendar, Image } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AgeBlock } from '../components/AgeBlock';

export function CosplayDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [album, setAlbum] = useState<CosplayAlbum | null>(null);
  const [totalAlbums, setTotalAlbums] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const getAlbumSchema = (album: CosplayAlbum) => {
    return {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": album.title,
      "description": `Bộ sưu tập ảnh cosplay ${album.character} do ${album.cosplayer} thực hiện. Tổng cộng ${album.images.length} ảnh chất lượng cao.`,
      "image": album.images[0],
      "author": {
        "@type": "Person",
        "name": album.cosplayer
      },
      "datePublished": album.date,
      "genre": "Cosplay",
      "keywords": `${album.cosplayer}, ${album.character}, cosplay nude, ảnh cosplay đẹp, album cosplay 18+`
    };
  };

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await cosplayService.getAlbumDetail(id);
        setAlbum(data);
        if (data && data.cosplayer) {
          const count = await cosplayService.getAlbumsCountByCosplayer(data.cosplayer);
          setTotalAlbums(count);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-white">Không tìm thấy bộ sưu tập</h2>
        <Link to="/nguoi-lon/cosplay" className="text-rose-500 hover:text-rose-400">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <AgeBlock>
      <div className="w-full">
        <SEO 
        title={`${album.title} - Album Cosplay ${album.cosplayer} P18+`}
        description={`Xem full bộ ảnh cosplay ${album.character} do cosplayer ${album.cosplayer} trình bày. Bộ sưu tập gồm ${album.images.length} ảnh nóng bỏng, chất lượng cực nét.`}
        image={album.images[0]}
        keywords={`${album.cosplayer}, ${album.character}, cosplay nude, ${album.cosplayer} nude, cosplay 18+, bộ ảnh cosplay đẹp, kho ảnh cosplay`}
        schema={getAlbumSchema(album)}
      />

      <div>
        <Link 
          to="/nguoi-lon/cosplay" 
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Quay lại
        </Link>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm mb-12">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-6 leading-tight">
            {album.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium">
            <button 
              onClick={() => navigate(`/nguoi-lon/cosplay?cosplayer=${encodeURIComponent(album.cosplayer)}`)}
              className="flex items-center gap-2 text-zinc-200 bg-rose-500/20 px-4 py-2 rounded-full border border-rose-500/30 hover:bg-rose-500/30 hover:text-white transition-all cursor-pointer shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20"
            >
              <User className="w-4 h-4 text-rose-400" />
              <span>{album.cosplayer}</span>
            </button>

            {totalAlbums > 0 && (
              <button 
                onClick={() => navigate(`/nguoi-lon/cosplay?cosplayer=${encodeURIComponent(album.cosplayer)}`)}
                className="flex items-center gap-2 text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700/50 hover:bg-zinc-800 hover:text-white transition-all cursor-pointer"
              >
                <Image className="w-4 h-4 text-rose-400" />
                <span>Xem {totalAlbums} album khác</span>
              </button>
            )}

            <div className="flex items-center gap-2 text-zinc-300 bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700/50 cursor-pointer hover:bg-zinc-800 hover:text-white transition-all"
                 onClick={() => navigate(`/nguoi-lon/cosplay?cosplayer=${encodeURIComponent(album.character)}`)}
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>{album.character}</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Camera className="w-4 h-4" />
              <span>{album.images.length} ảnh</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(album.date).toLocaleDateString('vi-VN')}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {album.images.map((img, idx) => (
            <div key={idx} className="group overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 relative">
              <img 
                src={img} 
                alt={`${album.title} - Ảnh ${idx + 1}`} 
                className="w-full h-auto object-cover md:aspect-[3/4]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm cursor-pointer"
                   onClick={() => window.open(img, '_blank')}>
                   <Camera className="w-8 h-8 text-white/50" />
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </AgeBlock>
  );
}
