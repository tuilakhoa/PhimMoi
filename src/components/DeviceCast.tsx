import React, { useState, useEffect, useRef } from 'react';
import { Cast, Airplay } from 'lucide-react';
import { EpisodeItem, MovieDetail } from '../types';

export const DeviceCast: React.FC<{ currentEpisode: EpisodeItem, movie: MovieDetail }> = ({ currentEpisode, movie }) => {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [isAirplayAvailable, setIsAirplayAvailable] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check Chromecast
    const checkCast = setInterval(() => {
      const win = window as any;
      if (win.cast && win.chrome && win.chrome.cast && win.chrome.cast.isAvailable) {
        setIsCastAvailable(true);
        try {
            const context = win.cast.framework.CastContext.getInstance();
            context.setOptions({
              receiverApplicationId: win.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
              autoJoinPolicy: win.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
            });
            
            // Listen to cast state changes
            context.addEventListener(win.cast.framework.CastContextEventType.CAST_STATE_CHANGED, (event: any) => {
              if (event.castState === win.cast.framework.CastState.CONNECTED) {
                setIsCasting(true);
              } else {
                setIsCasting(false);
              }
            });

            // Initial state
            if (context.getCastState() === win.cast.framework.CastState.CONNECTED) {
              setIsCasting(true);
            }
        } catch (e) {
            // Context might already be initialized
        }
        clearInterval(checkCast);
      }
    }, 500);

    // Initial check for AirPlay
    const win = window as any;
    if (win.WebKitPlaybackTargetAvailabilityEvent) {
      if (videoRef.current) {
        videoRef.current.addEventListener('webkitplaybacktargetavailabilitychanged', (event: any) => {
          if (event.availability === 'available') {
            setIsAirplayAvailable(true);
          }
        });
      }
    } else {
        // Fallback for Safari/Apple devices
        if (/(Mac|iPhone|iPod|iPad)/i.test(navigator.platform)) {
            setIsAirplayAvailable(true);
        }
    }

    // Cleanup interval
    setTimeout(() => {
      clearInterval(checkCast);
    }, 10000); // Give up checking after 10s

    return () => clearInterval(checkCast);
  }, []);

  const handleChromecast = () => {
    const win = window as any;
    if (!isCastAvailable || !win.cast) {
      alert('Thiết bị hoặc trình duyệt của bạn không hỗ trợ Google Cast. Vui lòng sử dụng Chrome trên PC/Android.');
      return;
    }

    const context = win.cast.framework.CastContext.getInstance();
    
    // Check if session exists
    const currentSession = context.getCurrentSession();
    if (currentSession) {
       loadMedia(currentSession);
    } else {
        context.requestSession().then(
            () => {
                const session = context.getCurrentSession();
                if (session) {
                    loadMedia(session);
                }
            },
            (err: any) => {
                console.error("Cast request failed", err);
            }
        );
    }
  };

  const loadMedia = (session: any) => {
    const win = window as any;
    const mediaInfo = new win.chrome.cast.media.MediaInfo(currentEpisode.m3u8, 'application/x-mpegurl');
    
    const metadata = new win.chrome.cast.media.GenericMediaMetadata();
    metadata.title = `${movie.name} - ${currentEpisode.name}`;
    metadata.subtitle = movie.original_name;
    if (movie.thumb_url) {
        metadata.images = [new win.chrome.cast.Image(movie.thumb_url)];
    }
    mediaInfo.metadata = metadata;

    const request = new win.chrome.cast.media.LoadRequest(mediaInfo);
    session.loadMedia(request).then(
      () => {
        setIsCasting(true);
      },
      (errorCode: any) => {
        console.error('Error loading media: ' + errorCode);
        setIsCasting(false);
      }
    );
  };

  const handleAirplay = () => {
    if (videoRef.current) {
        const video = videoRef.current as any;
        if (video.webkitShowPlaybackTargetPicker) {
            video.webkitShowPlaybackTargetPicker();
        } else {
             alert('Trình duyệt của bạn không hỗ trợ AirPlay. Vui lòng sử dụng Safari trên các thiết bị Apple.');
        }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
      <span className="text-zinc-400 text-sm font-medium mr-2">Chiếu lên thiết bị khác:</span>
      
      {/* Hidden video wrapper for AirPlay */}
      <video 
          ref={videoRef} 
          src={currentEpisode.m3u8 || undefined} 
          style={{ display: 'none' }} 
          controls 
          playsInline
          // @ts-ignore
          x-webkit-airplay="allow"
      />

      <button
        onClick={handleChromecast}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-rose-600 hover:border-rose-600 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all shadow-sm"
        title="Chiếu lên TV (Chromecast & Android TV)"
      >
        <Cast className={`w-4 h-4 ${isCasting ? 'text-blue-400' : ''}`} />
        <span className="text-sm font-medium">{isCasting ? 'Đang chiếu lên TV' : 'Chromecast'}</span>
      </button>

      {(isAirplayAvailable || /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent)) && (
          <button
            onClick={handleAirplay}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-rose-600 hover:border-rose-600 border border-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-all shadow-sm"
            title="Chiếu qua AirPlay (Apple TV & thiết bị hỗ trợ AirPlay)"
          >
            <Airplay className="w-4 h-4" />
            <span className="text-sm font-medium">AirPlay</span>
          </button>
      )}
    </div>
  );
}
