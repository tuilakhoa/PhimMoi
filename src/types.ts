export interface Movie {
  _id?: string;
  name: string;
  slug: string;
  original_name: string;
  thumb_url: string;
  poster_url: string;
  created: string;
  modified: string;
  description: string;
  total_episodes: number;
  current_episode: string;
  time: string;
  quality: string;
  language: string;
  director: string;
  casts: string;
}

export interface Paginate {
  current_page: number;
  total_page: number;
  total_items: number;
  items_per_page: number;
}

export interface MovieListResponse {
  status: string;
  paginate: Paginate;
  items: Movie[];
}

export interface EpisodeItem {
  name: string;
  slug: string;
  embed: string;
  m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  items: EpisodeItem[];
}

export interface CategoryGroup {
  group: { id: string; name: string };
  list: { id: string; name: string }[];
}

export interface Actor {
  gender: string;
  avatar: string;
  birth_date: string | null;
  name: string;
  slug: string;
  movies_count: number;
}

export interface ActorListResponse {
  status: string;
  paginate: Paginate;
  items: Actor[];
}

export interface MovieDetail extends Movie {
  category?: { id: string; name: string; slug: string }[];
  episodes: EpisodeServer[];
  actors?: Actor[];
  images?: { path: string }[];
}

export interface MovieDetailResponse {
  status: string;
  movie: MovieDetail;
}
