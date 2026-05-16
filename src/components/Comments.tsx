import React, { useState, useEffect, useMemo } from 'react';
import { storage, Comment } from '../lib/storage';
import { User, Send, Star, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface CommentsProps {
  movieSlug: string;
}

export const Comments: React.FC<CommentsProps> = ({ movieSlug }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [userName, setUserName] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest');

  useEffect(() => {
    setComments(storage.getComments(movieSlug));
  }, [movieSlug]);

  const sortedComments = useMemo(() => {
    return [...comments].sort((a, b) => {
      if (sortBy === 'newest') {
        return b.timestamp - a.timestamp;
      } else {
        const netA = (a.likes || 0) - (a.dislikes || 0);
        const netB = (b.likes || 0) - (b.dislikes || 0);
        return netB - netA;
      }
    });
  }, [comments, sortBy]);

  const handleVote = (id: string, type: 'like' | 'dislike', increment: boolean) => {
    storage.updateCommentVotes(id, type, increment);
    setComments(storage.getComments(movieSlug));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const added = storage.addComment({
        movieSlug,
        userName,
        content: newComment,
        rating
      });
      setComments([added, ...comments]);
      setNewComment('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="space-y-8 pt-8 border-t border-zinc-800">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-rose-500 rounded-full inline-block"></span>
          Bình luận & Đánh giá ({comments.length})
        </h2>
        
        {comments.length > 0 && (
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            <button
              onClick={() => setSortBy('newest')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", sortBy === 'newest' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
            >
              Mới nhất
            </button>
            <button
              onClick={() => setSortBy('helpful')}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-md transition-colors", sortBy === 'helpful' ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white")}
            >
              Hữu ích
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tên của bạn</label>
            <input
              type="text"
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Nhập tên..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500/50 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Đánh giá</label>
            <div className="flex items-center gap-2 h-[42px]">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={cn("w-6 h-6", s <= rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-700")} />
                </button>
              ))}
              <span className="ml-2 text-sm text-zinc-400 font-medium">{rating}/5 sao</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Nội dung</label>
          <textarea
            required
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Bạn nghĩ gì về bộ phim này? Chi sẻ cảm nhận của bạn..."
            rows={3}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isSubmitting ? 'Đang gửi...' : (
            <>
              Gửi bình luận <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="space-y-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12 bg-zinc-950/30 rounded-xl border border-dashed border-zinc-800">
            <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-4 bg-zinc-950/20 rounded-xl border border-zinc-800/50 hover:border-rose-500/10 transition-colors group">
              <div className="shrink-0 w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <User className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-zinc-200">{comment.userName}</h4>
                  <span className="text-[10px] text-zinc-600 font-medium">{new Date(comment.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex gap-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-3 h-3", s <= comment.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-800")} />
                  ))}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed mb-3">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2">
                  <button 
                    onClick={() => handleVote(comment.id, 'like', true)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-rose-500 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Thích ({comment.likes || 0})
                  </button>
                  <button 
                    onClick={() => handleVote(comment.id, 'dislike', true)}
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Không thích ({comment.dislikes || 0})
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
