import { Movie } from '../types';

const WATCHLIST_KEY = 'phimhay_watchlist';
const HISTORY_KEY = 'phimhay_history';
const COMMENTS_KEY = 'phimhay_comments';

export interface Comment {
  id: string;
  movieSlug: string;
  userName: string;
  content: string;
  timestamp: number;
  rating: number;
}

export const storage = {
  // Watchlist
  getWatchlist: (): Movie[] => {
    const data = localStorage.getItem(WATCHLIST_KEY);
    return data ? JSON.parse(data) : [];
  },
  addToWatchlist: (movie: Movie) => {
    const list = storage.getWatchlist();
    if (!list.find((m) => m.slug === movie.slug)) {
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify([movie, ...list]));
    }
  },
  removeFromWatchlist: (slug: string) => {
    const list = storage.getWatchlist();
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list.filter((m) => m.slug !== slug)));
  },
  isInWatchlist: (slug: string): boolean => {
    return storage.getWatchlist().some((m) => m.slug === slug);
  },

  // History
  getHistory: (): Movie[] => {
    const data = localStorage.getItem(HISTORY_KEY);
    return data ? JSON.parse(data) : [];
  },
  addToHistory: (movie: Movie) => {
    const list = storage.getHistory().filter((m) => m.slug !== movie.slug);
    localStorage.setItem(HISTORY_KEY, JSON.stringify([movie, ...list].slice(0, 50)));
  },
  removeFromHistory: (slug: string) => {
     const list = storage.getHistory();
     localStorage.setItem(HISTORY_KEY, JSON.stringify(list.filter((m) => m.slug !== slug)));
  },
  clearHistory: () => {
    localStorage.removeItem(HISTORY_KEY);
  },

  // Comments
  getComments: (movieSlug: string): Comment[] => {
    const allComments = localStorage.getItem(COMMENTS_KEY);
    if (!allComments) return [];
    const parsed = JSON.parse(allComments) as Comment[];
    return parsed.filter((c) => c.movieSlug === movieSlug).sort((a, b) => b.timestamp - a.timestamp);
  },
  addComment: (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    const allComments = localStorage.getItem(COMMENTS_KEY);
    const list = allComments ? (JSON.parse(allComments) as Comment[]) : [];
    const newComment: Comment = {
      ...comment,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    localStorage.setItem(COMMENTS_KEY, JSON.stringify([newComment, ...list]));
    return newComment;
  }
};
