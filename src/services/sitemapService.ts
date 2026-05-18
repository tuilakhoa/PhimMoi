const SITE_URL = 'https://phimtop1.com';

const CATEGORY_MAP: Record<string, string> = {
  'phim-bo': 'Phim Bộ',
  'phim-le': 'Phim Lẻ',
  'tv-shows': 'TV Shows',
  'hoat-hinh': 'Hoạt Hình',
  'phim-dang-chieu': 'Phim Đang Chiếu',
  'short-drama': 'Phim Short Drama',
  'hanh-dong': 'Hành Động',
  'tinh-cam': 'Tình Cảm',
  'hai-huoc': 'Hài Hước',
  'co-trang': 'Cổ Trang',
  'tam-ly': 'Tâm Lý',
  'hinh-su': 'Hình Sự',
  'chien-tranh': 'Chiến Tranh',
  'the-thao': 'Thể Thao',
  'vo-thuat': 'Võ Thuật',
  'vien-tuong': 'Viễn Tưởng',
  'phieu-luu': 'Phiêu Lưu',
  'khoa-hoc': 'Khoa Học',
  'kinh-di': 'Kinh Dị',
  'am-nhac': 'Âm Nhạc',
  'than-thoai': 'Thần Thoại',
  'tai-lieu': 'Tài Liệu',
  'gia-dinh': 'Gia Đình',
  'chinh-kich': 'Chính Kịch',
  'bi-an': 'Bí ẩn',
  'hoc-duong': 'Học Đường',
  'kinh-dien': 'Kinh Điển',
  'phim-18': 'Phim 18+',
  'hai': 'Hài',
  'gia-tuong': 'Giả Tưởng',
  'lich-su': 'Lịch Sử',
  'lang-man': 'Lãng Mạn'
};

const COUNTRY_MAP: Record<string, string> = {
  'trung-quoc': 'Trung Quốc',
  'han-quoc': 'Hàn Quốc',
  'nhat-ban': 'Nhật Bản',
  'thai-lan': 'Thái Lan',
  'au-my': 'Âu Mỹ',
  'viet-nam': 'Việt Nam',
  'hong-kong': 'Hồng Kông',
  'an-do': 'Ấn Độ',
  'phap': 'Pháp',
  'anh': 'Anh',
  'duc': 'Đức',
  'canada': 'Canada',
  'quoc-gia-khac': 'Quốc gia khác'
};

export async function getMovieSlugsTotalPages(itemsPerSitemap: number) {
  try {
    const res = await fetch('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1', {
      // Small timeout for Vercel just in case
      signal: AbortSignal.timeout(5000)
    });
    const data: any = await res.json();
    const totalItems = data.data?.params?.pagination?.totalItems || 0;
    return Math.max(1, Math.ceil(totalItems / itemsPerSitemap));
  } catch (error) {
    console.error('Error fetching total pages:', error);
    return 1;
  }
}

export async function getMovieSlugsForSitemap(pageStr: string | string[], itemsPerSitemap: number) {
  try {
    const page = parseInt(pageStr as string) || 1;
    // OPhim has 24 items per page.
    const ophimPagesPerSitemap = Math.ceil(itemsPerSitemap / 24);
    const startOphimPage = (page - 1) * ophimPagesPerSitemap + 1;
    
    // We fetch `ophimPagesPerSitemap` pages for this specific sitemap file.
    const pagesToFetch = Array.from({ length: ophimPagesPerSitemap }, (_, i) => startOphimPage + i);
    
    const slugs: string[] = [];
    
    // Fetch in chunks of 20 to avoid overwhelming the external API and timing out
    const chunkSize = 20;
    for (let i = 0; i < pagesToFetch.length; i += chunkSize) {
      const chunk = pagesToFetch.slice(i, i + chunkSize);
      const results = await Promise.allSettled(
        chunk.map(p => 
          fetch(`https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=${p}`, {
             signal: AbortSignal.timeout(5000)
          })
            .then(r => r.json())
            .then((d: any) => d.data?.items?.map((item: any) => item.slug) || [])
        )
      );

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          slugs.push(...result.value);
        }
      });
    }

    return Array.from(new Set(slugs)).filter(Boolean);
  } catch (error) {
    console.error('Error fetching movie slugs for sitemap:', error);
    return [];
  }
}

export async function getCosplaySlugs() {
  try {
    const res = await fetch('https://cosplaytele.com/wp-json/wp/v2/posts?per_page=100');
    const data: any = await res.json();
    return data.map((post: any) => post.slug);
  } catch (error) {
    return [];
  }
}

export function generateSitemapXml(urls: { loc: string, lastmod?: string, changefreq?: string, priority?: string }[]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('\n')}
</urlset>`;
  return xml;
}

export function generateSitemapIndexXml(sitemaps: string[]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map(url => `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  return xml;
}

export function getStaticRoutes() {
  const now = new Date().toISOString();
  const routes = [
    { loc: `${SITE_URL}/`, lastmod: now, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_URL}/nguoi-lon`, lastmod: now, changefreq: 'daily', priority: '0.8' },
    { loc: `${SITE_URL}/nguoi-lon/cosplay`, lastmod: now, changefreq: 'daily', priority: '0.8' },
    { loc: `${SITE_URL}/kham-pha`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
    { loc: `${SITE_URL}/dien-vien-18`, lastmod: now, changefreq: 'weekly', priority: '0.7' },
  ];

  // Categories
  Object.keys(CATEGORY_MAP).forEach(slug => {
    routes.push({ loc: `${SITE_URL}/the-loai/${slug}`, lastmod: now, changefreq: 'daily', priority: '0.7' });
  });

  // Countries
  Object.keys(COUNTRY_MAP).forEach(slug => {
    routes.push({ loc: `${SITE_URL}/quoc-gia/${slug}`, lastmod: now, changefreq: 'daily', priority: '0.7' });
  });

  // Years
  for (let year = new Date().getFullYear(); year >= 2010; year--) {
    routes.push({ loc: `${SITE_URL}/nam-phat-hanh/${year}`, lastmod: now, changefreq: 'monthly', priority: '0.6' });
  }

  return routes;
}
