import { ChevronRight, Code2, Copy, Globe, Lock, Terminal, Play, Loader2, X } from 'lucide-react';
import { useState } from 'react';
import { SEO } from '../components/SEO';
import { motion, AnimatePresence } from 'motion/react';

const DOMAIN = 'https://phimtop1.asia';

const API_ENDPOINTS = [
  {
    title: 'Phim mới cập nhật',
    method: 'GET',
    path: '/api/v1/movies',
    params: { page: '1' },
    query: [{ name: 'page', description: 'Số trang (mặc định: 1)', type: 'number', placeholder: '1' }],
    description: 'Lấy danh sách các bộ phim mới được cập nhật trên hệ thống từ nguồn Ophim.',
    response: `{
  "status": "success",
  "items": [
    {
      "name": "Tên phim",
      "slug": "duong-dan-phim",
      "origin_name": "Tên gốc",
      "thumb_url": "https://...",
      ...
    }
  ],
  "paginate": { ... }
}`
  },
  {
    title: 'Chi tiết phim',
    method: 'GET',
    path: '/api/v1/movies/:slug',
    params: { slug: 'mon-phai-me-trai' },
    query: [{ name: 'slug', description: 'Đường dẫn định danh của phim', type: 'string', placeholder: 'mon-phai-me-trai' }],
    description: 'Lấy thông tin chi tiết của một bộ phim bao gồm danh sách tập phim và link stream m3u8.',
    response: `{
  "status": "success",
  "movie": {
    "name": "Tên phim",
    "content": "Mô tả phim",
    "episodes": [
      {
        "server_name": "Vietsub #1",
        "server_data": [
          { "name": "1", "slug": "tap-1", "link_m3u8": "..." }
        ]
      }
    ]
  }
}`
  },
  {
    title: 'Tìm kiếm phim',
    method: 'GET',
    path: '/api/v1/search',
    params: { keyword: 'hanh dong' },
    query: [
      { name: 'keyword', description: 'Từ khóa tìm kiếm (không dấu hoặc có dấu)', type: 'string', placeholder: 'hanh dong' },
      { name: 'limit', description: 'Số lượng kết quả tối đa', type: 'number', placeholder: '10' }
    ],
    description: 'Tìm kiếm phim theo từ khóa trong kho phim Ophim.',
    response: `{
  "status": "success",
  "items": [ ... ],
  "paginate": { ... }
}`
  },
  {
    title: 'Phim người lớn mới nhất',
    method: 'GET',
    path: '/api/v1/adult/movies',
    params: { page: '1' },
    query: [{ name: 'page', description: 'Số trang (mặc định: 1)', type: 'number', placeholder: '1' }],
    description: 'Lấy danh sách phim người lớn mới nhất từ các nguồn TopXX, XXVN.',
    response: `{
  "status": "success",
  "data": [ ... ],
  "meta": { ... }
}`
  },
  {
    title: 'Chi tiết phim người lớn',
    method: 'GET',
    path: '/api/v1/adult/movies/:id',
    params: { id: '40798' },
    query: [{ name: 'id', description: 'ID của phim (từ danh sách)', type: 'string', placeholder: '40798' }],
    description: 'Lấy thông tin chi tiết, link stream và các thông tin liên quan của phim người lớn.',
    response: `{
  "status": "success",
  "data": {
    "id": 40798,
    "title": "Title",
    "streams": [ { "url": "...", "quality": "1080p" } ],
    ...
  }
}`
  },
  {
    title: 'Danh sách Album Cosplay',
    method: 'GET',
    path: '/api/v1/cosplay/albums',
    params: { page: '1' },
    query: [{ name: 'page', description: 'Số trang (mặc định: 1)', type: 'number', placeholder: '1' }],
    description: 'Lấy danh sách các album ảnh cosplay mới nhất từ CosplayTele.',
    response: `{
  "status": "success",
  "total": "500",
  "pages": "25",
  "items": [
    {
      "id": 1234,
      "title": "Cosplay Title",
      "slug": "cosplay-slug",
      "thumbnail": "https://..."
    }
  ]
}`
  },
  {
    title: 'Chi tiết Album Cosplay',
    method: 'GET',
    path: '/api/v1/cosplay/albums/:id',
    params: { id: '7023' },
    query: [{ name: 'id', description: 'ID của bài viết (post id)', type: 'number', placeholder: '7023' }],
    description: 'Lấy nội dung chi tiết của một album cosplay (bao gồm mã HTML chứa các thẻ <img>).',
    response: `{
  "status": "success",
  "id": 7023,
  "title": "Cosplay Title",
  "content": "<p>...</p><img src='...' />...",
  "thumbnail": "https://..."
}`
  }
];

export default function APIDocs() {
  const [copied, setCopied] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [testInputs, setTestInputs] = useState<Record<string, Record<string, string>>>(
    API_ENDPOINTS.reduce((acc, ep) => ({ ...acc, [ep.path]: ep.params }), {})
  );

  const copyToClipboard = (text: string) => {
    const fullUrl = DOMAIN + text;
    navigator.clipboard.writeText(fullUrl);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleInputChange = (path: string, name: string, value: string) => {
    setTestInputs(prev => ({
      ...prev,
      [path]: {
        ...prev[path],
        [name]: value
      }
    }));
  };

  const runTest = async (endpoint: typeof API_ENDPOINTS[0]) => {
    const path = endpoint.path;
    const inputs = testInputs[path];
    
    setLoading(prev => ({ ...prev, [path]: true }));
    
    try {
      let finalUrl = path;
      const queryParams = new URLSearchParams();

      endpoint.query.forEach(q => {
        const val = inputs[q.name] || q.placeholder;
        if (path.includes(`:${q.name}`)) {
          finalUrl = finalUrl.replace(`:${q.name}`, val);
        } else {
          queryParams.append(q.name, val);
        }
      });

      const queryString = queryParams.toString();
      const requestUrl = `${finalUrl}${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(requestUrl);
      const data = await res.json();
      
      setTestResults(prev => ({ ...prev, [path]: data }));
    } catch (err: any) {
      setTestResults(prev => ({ ...prev, [path]: { error: err.message } }));
    } finally {
      setLoading(prev => ({ ...prev, [path]: false }));
    }
  };

  return (
    <>
      <SEO 
        title="Tài liệu API cho Crawler | PhimTop1.Asia" 
        description="Tài liệu hướng dẫn sử dụng API mở của PhimTop1.Asia để crawl dữ liệu phim, ảnh, album cosplay."
      />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 text-rose-500 mb-4">
            <div className="p-3 bg-rose-500/10 rounded-2xl">
              <Code2 size={32} />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Open API Documentation</h1>
          </div>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Chào mừng bạn đến với hệ thống API mở của <span className="text-rose-500 font-bold">PhimTop1.Asia</span>. 
            Dưới đây là các tài liệu kỹ thuật dành cho nhà phát triển muốn tích hợp hoặc crawl dữ liệu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Globe size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Base URL</h3>
            <code className="text-rose-400 text-sm break-all font-bold">{DOMAIN}</code>
          </div>
          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center mb-4">
              <Lock size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Authentication</h3>
            <p className="text-zinc-400 text-sm">Công khai dành cho v1. Không yêu cầu Header Authorization.</p>
          </div>
          <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center mb-4">
              <Terminal size={20} />
            </div>
            <h3 className="text-white font-semibold mb-2">Response Format</h3>
            <p className="text-zinc-400 text-sm">Hệ thống trả về dữ liệu chuẩn JSON (application/json).</p>
          </div>
        </div>

        {/* Integration Guide Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 space-y-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-rose-500 rounded-full" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Hướng dẫn tích hợp chi tiết</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                  <Play size={18} className="text-rose-500" />
                  Quy trình Crawl dữ liệu
                </h4>
                <ol className="space-y-4 text-zinc-400 text-sm list-decimal list-inside">
                  <li><span className="text-zinc-200">Lấy danh sách (Pagination):</span> Gọi API list với tham số <code className="text-rose-400">?page=N</code> để lấy danh sách slug hoặc ID.</li>
                  <li><span className="text-zinc-200">Lấy chi tiết (Detail):</span> Sử dụng slug hoặc ID thu được để gọi API detail.</li>
                  <li><span className="text-zinc-200">Lưu trữ (Caching):</span> Khuyến khích lưu dữ liệu vào Database của bạn để giảm tải và tăng tốc độ web của bạn.</li>
                  <li><span className="text-zinc-200">Media:</span> Link ảnh và video thường là link trực tiếp, bạn có thể nhúng trực tiếp vào layer web của mình.</li>
                </ol>
              </div>

              <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2 text-lg">
                  <Terminal size={18} className="text-rose-500" />
                  Lưu ý kỹ thuật
                </h4>
                <ul className="space-y-4 text-zinc-400 text-sm list-disc list-inside">
                  <li>Nên sử dụng <code className="text-rose-400">User-Agent</code> cố định khi crawl để hệ thống nhận diện.</li>
                  <li>Nếu nhận lỗi <span className="text-amber-500">429</span>, vui lòng giảm tốc độ crawl xuống 1 request/giây.</li>
                  <li>Đối với Cosplay, content trả về là mã HTML chứa link ảnh, bạn nên parse để lấy danh sách URL ảnh.</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-white font-bold text-lg">Ví dụ code (Node.js)</h4>
                <div className="flex gap-2">
                  <button className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 hover:text-white transition-colors">JavaScript</button>
                  <button className="text-xs bg-zinc-800 px-3 py-1 rounded-full text-zinc-400 hover:text-white transition-colors">Python</button>
                </div>
              </div>
              <div className="relative group">
                <pre className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800 text-sm font-mono text-zinc-300 overflow-x-auto h-full">
{`// Ví dụ fetch phim bằng Node.js
const fetchMovies = async (page = 1) => {
  const url = \`${DOMAIN}/api/v1/movies?page=\${page}\`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // Xử lý dữ liệu
    console.log(data.items);
    
    return data;
  } catch (error) {
    console.error("Crawl failed:", error);
  }
};

fetchMovies(1);`}
                </pre>
                <button className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex items-center gap-3 mb-10">
          <div className="w-2 h-8 bg-rose-500 rounded-full" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Chi tiết các Endpoints</h2>
        </div>

        <div className="space-y-16">
          {API_ENDPOINTS.map((endpoint, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden"
              id={endpoint.path.replace(/\//g, '-').substring(1)}
            >
              <div className="p-8 border-b border-zinc-800">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 font-bold rounded text-xs">
                    {endpoint.method}
                  </span>
                  <div className="group flex items-center gap-2 bg-black/40 px-3 py-2 rounded-lg border border-zinc-800">
                    <code className="text-zinc-300 text-sm">{endpoint.path}</code>
                    <button 
                      onClick={() => copyToClipboard(endpoint.path)}
                      className="text-zinc-500 hover:text-white transition-colors"
                      title="Copy URL"
                    >
                      {copied === endpoint.path ? <div className="text-[10px] text-green-500 font-bold uppercase">Copied</div> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">{endpoint.title}</h2>
                <p className="text-zinc-400 leading-relaxed">{endpoint.description}</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                <div className="p-8 space-y-8">
                  {/* Parameters */}
                  <div>
                    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                       <ChevronRight size={16} className="text-rose-500" />
                       Parameters
                    </h4>
                    <div className="space-y-4">
                      {endpoint.query.map((q, qIdx) => (
                        <div key={qIdx} className="flex flex-col gap-1.5">
                          <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{q.name} ({q.type})</label>
                          <input 
                            type="text" 
                            placeholder={q.placeholder}
                            value={testInputs[endpoint.path][q.name] || ''}
                            onChange={(e) => handleInputChange(endpoint.path, q.name, e.target.value)}
                            className="bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500/50 transition-colors w-full"
                          />
                          <span className="text-xs text-zinc-600">{q.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Try it out */}
                  <div className="pt-4">
                    <button 
                      onClick={() => runTest(endpoint)}
                      disabled={loading[endpoint.path]}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-rose-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-rose-500/20"
                    >
                      {loading[endpoint.path] ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Đang tải dữ liệu...
                        </>
                      ) : (
                        <>
                          <Play size={18} className="fill-current" />
                          Thử API ngay (Run Test)
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-8 bg-zinc-950/30">
                   <h4 className="text-white font-semibold mb-4 flex items-center justify-between">
                     <span className="flex items-center gap-2">
                       <ChevronRight size={16} className="text-rose-500" />
                       {testResults[endpoint.path] ? 'Live Response' : 'Expected Response'}
                     </span>
                     {testResults[endpoint.path] && (
                       <button 
                         onClick={() => setTestResults(prev => ({ ...prev, [endpoint.path]: null }))}
                         className="text-zinc-500 hover:text-white"
                       >
                         <X size={14} />
                       </button>
                     )}
                   </h4>
                   
                   <div className="relative group">
                     <pre className="bg-black/60 p-6 rounded-2xl border border-zinc-800 text-[13px] font-mono text-zinc-300 overflow-x-auto max-h-[500px] custom-scrollbar">
                       {testResults[endpoint.path] 
                         ? JSON.stringify(testResults[endpoint.path], null, 2) 
                         : endpoint.response}
                     </pre>
                     {!testResults[endpoint.path] && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded">EXAMPLE</span>
                        </div>
                     )}
                   </div>

                   <div className="mt-4">
                      <p className="text-[11px] text-zinc-600 italic">
                        * Dữ liệu trả về có thể thay đổi theo thời gian thực từ nguồn cung cấp.
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-24 p-10 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 via-zinc-900/50 to-zinc-900 border border-zinc-800/50">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="space-y-4 flex-1 text-center md:text-left">
              <h3 className="text-3xl font-bold text-white tracking-tight">Bạn cần một API riêng?</h3>
              <p className="text-zinc-400 text-lg leading-relaxed max-w-xl">
                Nếu cấu trúc API hiện tại chưa đáp ứng được nhu cầu của bạn, hoặc bạn muốn hợp tác trao đổi dữ liệu banner/link, 
                đừng ngần ngại liên hệ với chúng tôi.
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                <button className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95">
                  Telegram hỗ trợ
                </button>
                <button className="px-8 py-4 bg-zinc-800 text-white rounded-2xl font-bold hover:bg-zinc-700 transition-all active:scale-95">
                  Yêu cầu tính năng
                </button>
              </div>
            </div>
            <div className="hidden md:block w-48 h-48 bg-rose-500/5 rounded-full border border-rose-500/10 flex items-center justify-center shrink-0">
               <Terminal size={80} className="text-rose-500/30" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
