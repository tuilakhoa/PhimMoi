import { Movie, UserSettings } from '../types';

const AGE_STATUS_KEY = 'phimtop1_age_status';
const WATCHLIST_KEY = 'phimhay_watchlist';
const HISTORY_KEY = 'phimhay_history';
const COMMENTS_KEY = 'phimhay_comments';
const SETTINGS_KEY = 'phimhay_settings';

const DEFAULT_SETTINGS: UserSettings = {
  theme: 'dark',
  language: 'vi',
  autoPlay: true,
  pauseHistory: false,
  dataSaver: false,
  notifications: true
};

export interface Comment {
  id: string;
  movieSlug: string;
  userName: string;
  content: string;
  timestamp: number;
  rating: number;
  likes?: number;
  dislikes?: number;
}

export const storage = {
  // Age Status
  getAgeStatus: (): 'adult' | 'under18' | null => {
    return localStorage.getItem(AGE_STATUS_KEY) as 'adult' | 'under18' | null;
  },
  setAgeStatus: (status: 'adult' | 'under18') => {
    localStorage.setItem(AGE_STATUS_KEY, status);
  },

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
    if (storage.getSettings().pauseHistory) return;
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
  addComment: (comment: Omit<Comment, 'id' | 'timestamp' | 'likes' | 'dislikes'>) => {
    const allComments = localStorage.getItem(COMMENTS_KEY);
    const list = allComments ? (JSON.parse(allComments) as Comment[]) : [];
    const newComment: Comment = {
      ...comment,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      likes: 0,
      dislikes: 0
    };
    localStorage.setItem(COMMENTS_KEY, JSON.stringify([newComment, ...list]));
    return newComment;
  },
  updateCommentVotes: (id: string, type: 'like' | 'dislike', increment: boolean) => {
    const allComments = localStorage.getItem(COMMENTS_KEY);
    if (!allComments) return;
    const list = JSON.parse(allComments) as Comment[];
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      if (type === 'like') {
        list[index].likes = (list[index].likes || 0) + (increment ? 1 : -1);
      } else {
        list[index].dislikes = (list[index].dislikes || 0) + (increment ? 1 : -1);
      }
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(list));
    }
  },

  // Settings
  getSettings: (): UserSettings => {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  },
  updateSettings: (newSettings: Partial<UserSettings>) => {
    const current = storage.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    
    // Apply theme immediately
    if (newSettings.theme) {
      if (updated.theme === 'dark' || (updated.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    return updated;
  }
};
