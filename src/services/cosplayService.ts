export interface CosplayAlbum {
  id: number;
  title: string;
  excerpt: string;
  images: string[]; // first image can be used as cover
  url: string;
  cosplayer: string;
  character: string;
  date: string;
}

const API_BASE = '/api/cosplay'; // We proxy this to https://cosplaytele.com/wp-json/wp/v2/

export const cosplayService = {
  getAlbums: async (page: number = 1, query?: string, categoryId?: number): Promise<{ albums: CosplayAlbum[], totalPages: number, totalAlbums: number }> => {
    try {
      let url = `${API_BASE}/posts?page=${page}&per_page=20&_embed=true`;
      
      if (query) {
        url += `&search=${encodeURIComponent(query)}`;
      } else if (categoryId) {
        url += `&categories=${categoryId}`;
      } else {
        // If no query and no specific category, we could show all or default to nude
        // To be "synced" with Cosplaytele, maybe show all recent posts?
        // Let's allow passing undefined category to show all
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cosplay albums');
      
      const totalPages = parseInt(res.headers.get('x-wp-totalpages') || '1', 10);
      const totalAlbums = parseInt(res.headers.get('x-wp-total') || '0', 10);
      const data = await res.json();
      
      const albums = data.map(mapWPPostToAlbum);
      return { albums, totalPages, totalAlbums };
    } catch (error) {
      console.error('Error fetching cosplay albums:', error);
      return { albums: [], totalPages: 0, totalAlbums: 0 };
    }
  },

  getAlbumsCountByCosplayer: async (cosplayer: string): Promise<number> => {
    try {
      const res = await fetch(`${API_BASE}/posts?search=${encodeURIComponent(cosplayer)}&per_page=1`);
      if (!res.ok) return 0;
      return parseInt(res.headers.get('x-wp-total') || '0', 10);
    } catch {
      return 0;
    }
  },

  getAlbumDetail: async (id: string): Promise<CosplayAlbum | null> => {
    try {
      const res = await fetch(`${API_BASE}/posts/${id}?_embed=true`);
      if (!res.ok) throw new Error('Failed to fetch cosplay album detail');
      
      const data = await res.json();
      return mapWPPostToAlbum(data);
    } catch (error) {
      console.error('Error fetching cosplay album detail:', error);
      return null;
    }
  }
};

function mapWPPostToAlbum(post: any): CosplayAlbum {
  const renderedTitle = decodeHtmlEntities(post.title?.rendered || '');
  const content = post.content?.rendered || '';
  const excerpt = post.excerpt?.rendered || '';
  
  // Extract images from content
  const images = extractImagesFromHtml(content);
  
  // If featured media is available, prepend it
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featuredMedia && !images.includes(featuredMedia)) {
    images.unshift(featuredMedia);
  }

  // Fallback to extraction from excerpt or content for names
  let cosplayer = 'Unknown';
  let character = 'Unknown';

  const cosplayerMatch = content.match(/Cosplayer:\s*<a[^>]*>(.*?)<\/a>/i) || content.match(/Cosplayer:\s*<(?:strong|b)>(.*?)<\/(?:strong|b)>/i);
  if (cosplayerMatch && cosplayerMatch[1]) cosplayer = decodeHtmlEntities(cosplayerMatch[1].replace(/<[^>]+>/g, '')).trim();

  const characterMatch = content.match(/Character:\s*<a[^>]*>(.*?)<\/a>/i) || content.match(/Character:\s*<(?:strong|b)>(.*?)<\/(?:strong|b)>/i);
  if (characterMatch && characterMatch[1]) character = decodeHtmlEntities(characterMatch[1].replace(/<[^>]+>/g, '')).trim();

  // If we couldn't parse from that specific block, maybe we can guess from title: "Cosplayer cosplay Character"
  if (cosplayer === 'Unknown') {
    const titleParts = renderedTitle.split(/ cosplay /i);
    if (titleParts.length === 2) {
      cosplayer = titleParts[0].trim();
      const charPart = titleParts[1].split(/[–\-("]/)[0].trim();
      character = charPart;
    }
  }

  return {
    id: post.id,
    title: renderedTitle,
    excerpt: decodeHtmlEntities(excerpt.replace(/<[^>]+>/g, '')).trim(),
    images,
    url: post.link,
    cosplayer,
    character,
    date: post.date
  };
}

function extractImagesFromHtml(html: string): string[] {
  const imgRegex = /<img[^>]+src=(["'])(.*?)\1/gi;
  const images: string[] = [];
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    images.push(match[2]);
  }
  return images;
}

function decodeHtmlEntities(text: string) {
  const entities: { [key: string]: string } = {
    '&#8211;': '-',
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8216;': "'",
    '&#8217;': "'",
    '&#038;': '&',
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>'
  };
  return text.replace(/&#\d+;|&[a-z]+;/gi, match => entities[match] || match);
}
