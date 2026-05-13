import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface StarRatingProps {
  movieSlug: string;
}

export function StarRating({ movieSlug }: StarRatingProps) {
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [averageScore, setAverageScore] = useState<number>(0);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Generate a consistent pseudo-random average between 7.5 and 9.5 based on slug
    const hash = movieSlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fakeAverage = 7.5 + (hash % 20) / 10;
    const fakeVotes = 150 + (hash % 1000);

    // Check if user already rated in local storage
    const storedRating = localStorage.getItem(`rating_${movieSlug}`);
    
    if (storedRating) {
      setUserRating(Number(storedRating));
      // Recompute average locally if they rated
      const updatedTotal = fakeVotes + 1;
      const updatedAverage = ((fakeAverage * fakeVotes) + (Number(storedRating) * 2)) / updatedTotal;
      setAverageScore(updatedAverage);
      setTotalVotes(updatedTotal);
    } else {
      setAverageScore(fakeAverage);
      setTotalVotes(fakeVotes);
    }
  }, [movieSlug]);

  const handleRate = (rating: number) => {
    if (userRating) return; // Prevent re-rating to keep it simple
    
    setUserRating(rating);
    localStorage.setItem(`rating_${movieSlug}`, rating.toString());
    setIsAnimating(true);
    
    // Update local stats
    const updatedTotal = totalVotes + 1;
    const updatedAverage = ((averageScore * totalVotes) + (rating * 2)) / updatedTotal; // rating is 1-5, so *2 for 1-10 scale
    
    setAverageScore(updatedAverage);
    setTotalVotes(updatedTotal);
    
    setTimeout(() => setIsAnimating(false), 1500);
  };

  // Convert 1-10 scale to 1-5 stars for display
  const displayStarsStr = averageScore > 0 ? (averageScore / 2).toFixed(1) : '0';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-3">
        <div className="flex items-center gap-1 group">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              disabled={userRating !== null}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              onClick={() => handleRate(star)}
              className="p-1 transition-transform hover:scale-110 disabled:hover:scale-100 disabled:cursor-default"
            >
              <Star
                className={cn(
                  "w-6 h-6 transition-colors duration-200",
                  (hoverRating !== null ? hoverRating >= star : userRating !== null ? userRating >= star : averageScore / 2 >= star - 0.5)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-zinc-600 group-hover:text-zinc-500"
                )}
              />
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl font-bold text-amber-400">{averageScore.toFixed(1)}</span>
          <span className="text-zinc-400 text-sm">/ 10</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-sm">
        <span className="text-zinc-400">({totalVotes.toLocaleString()} lượt đánh giá)</span>
        
        <AnimatePresence>
          {isAnimating && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-emerald-400 font-medium ml-2"
            >
              Cảm ơn bạn đã đánh giá!
            </motion.span>
          )}
          {userRating !== null && !isAnimating && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-zinc-300 font-medium ml-2"
            >
              Bạn đã đánh giá {userRating} sao.
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
