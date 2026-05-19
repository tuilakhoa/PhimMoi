import React, { useState, useEffect, useMemo } from 'react';
import { User, Send, Star, MessageSquare, ThumbsUp, ThumbsDown, LogIn, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  increment
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

interface Comment {
  id: string;
  movieSlug: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  rating: number;
  timestamp: number;
  likes: number;
  dislikes: number;
  voters?: Record<string, 'like' | 'dislike'>;
}

interface CommentsProps {
  movieSlug: string;
}

export const Comments: React.FC<CommentsProps> = ({ movieSlug }) => {
  const { user, signIn } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'helpful'>('newest');

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('movieSlug', '==', movieSlug)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];
      setComments(docs);
    });

    return unsubscribe;
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

  const handleVote = async (comment: Comment, type: 'like' | 'dislike') => {
    if (!user) {
      signIn();
      return;
    }

    const commentRef = doc(db, 'comments', comment.id);
    const voters = comment.voters || {};
    const currentVote = voters[user.uid];

    try {
      if (currentVote === type) {
        // Remove vote
        const newVoters = { ...voters };
        delete newVoters[user.uid];
        await updateDoc(commentRef, {
          voters: newVoters,
          [type === 'like' ? 'likes' : 'dislikes']: increment(-1)
        });
      } else {
        // Add or change vote
        const newVoters = { ...voters, [user.uid]: type };
        const updates: any = { voters: newVoters };
        
        if (currentVote) {
          // Changing vote from like to dislike or vice-versa
          updates[currentVote === 'like' ? 'likes' : 'dislikes'] = increment(-1);
        }
        updates[type === 'like' ? 'likes' : 'dislikes'] = increment(1);
        
        await updateDoc(commentRef, { ...updates });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `comments/${comment.id}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'comments'), {
        movieSlug,
        userId: user.uid,
        userName: user.displayName || 'Người dùng',
        userAvatar: user.photoURL || undefined,
        content: newComment,
        rating,
        timestamp: Date.now(),
        likes: 0,
        dislikes: 0,
        voters: {}
      });
      setNewComment('');
      setRating(5);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bình luận này?')) {
      try {
        await deleteDoc(doc(db, 'comments', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `comments/${id}`);
      }
    }
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

      {!user ? (
        <div className="bg-zinc-900/50 p-8 rounded-xl border border-zinc-800 text-center space-y-4">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <LogIn className="w-8 h-8 text-rose-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Đăng nhập để bình luận</h3>
            <p className="text-zinc-400 text-sm max-w-xs mx-auto">
              Hãy đăng nhập để chia sẻ cảm nhận của bạn về bộ phim này với cộng đồng và giúp người khác tìm được phim hay.
            </p>
          </div>
          <button
            onClick={() => signIn()}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-bold transition-all mx-auto active:scale-95 shadow-lg shadow-rose-500/20"
          >
            Đăng nhập với Google
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 mb-4">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'U')}&background=E11D48&color=fff`} 
              alt={user.displayName || ''} 
              className="w-10 h-10 rounded-full border border-zinc-700"
            />
            <div>
              <p className="text-white font-bold text-sm tracking-tight">{user.displayName}</p>
              <p className="text-zinc-500 text-xs">PhimTop1 Member</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Đánh giá của bạn</label>
            <div className="flex items-center gap-2">
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

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Nội dung</label>
            <textarea
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Bạn nghĩ gì về bộ phim này? Chia sẻ cảm nhận của bạn..."
              rows={3}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-rose-500/50 transition-colors resize-none placeholder:text-zinc-700"
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
      )}

      <div className="space-y-6">
        {sortedComments.length === 0 ? (
          <div className="text-center py-16 bg-zinc-950/30 rounded-xl border border-dashed border-zinc-800">
            <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-50" />
            <p className="text-zinc-500 font-medium">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 p-5 bg-zinc-950/20 rounded-xl border border-zinc-800/50 hover:border-rose-500/10 transition-colors group relative animate-in fade-in duration-500">
              <div className="shrink-0 w-11 h-11 rounded-full overflow-hidden border border-zinc-800 ring-2 ring-zinc-900">
                <img 
                  src={comment.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.userName)}&background=27272a&color=fff`} 
                  alt={comment.userName} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-zinc-100 tracking-tight">{comment.userName}</h4>
                    {user?.uid === comment.userId && (
                      <span className="text-[10px] bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded border border-rose-500/20 font-bold uppercase tracking-tighter shadow-sm shadow-rose-500/5">Bạn</span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">{new Date(comment.timestamp).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="flex gap-0.5 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={cn("w-3 h-3", s <= comment.rating ? "fill-yellow-500 text-yellow-500" : "text-zinc-800")} />
                  ))}
                </div>
                <p className="text-zinc-300 text-sm leading-relaxed mb-4 whitespace-pre-wrap">{comment.content}</p>
                <div className="flex items-center gap-5 mt-2">
                  <button 
                    onClick={() => handleVote(comment, 'like')}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-all active:scale-90", 
                      user && comment.voters?.[user.uid] === 'like' ? "text-rose-500 font-bold" : "text-zinc-500 hover:text-zinc-100"
                    )}
                  >
                    <ThumbsUp className={cn("w-4 h-4", user && comment.voters?.[user.uid] === 'like' && "fill-rose-500")} /> 
                    <span>{comment.likes || 0}</span>
                  </button>
                  <button 
                    onClick={() => handleVote(comment, 'dislike')}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-all active:scale-90", 
                      user && comment.voters?.[user.uid] === 'dislike' ? "text-zinc-300 font-bold" : "text-zinc-500 hover:text-zinc-100"
                    )}
                  >
                    <ThumbsDown className={cn("w-4 h-4", user && comment.voters?.[user.uid] === 'dislike' && "fill-zinc-300")} /> 
                    <span>{comment.dislikes || 0}</span>
                  </button>
                  
                  {user?.uid === comment.userId && (
                    <button 
                      onClick={() => handleDelete(comment.id)}
                      className="flex items-center gap-1.5 text-[10px] text-zinc-700 hover:text-rose-500 transition-all ml-auto opacity-0 group-hover:opacity-100 font-bold uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" /> Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
