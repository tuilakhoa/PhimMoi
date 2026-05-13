import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Category } from './pages/Category';
import { Search } from './pages/Search';
import { MovieDetailPage } from './pages/MovieDetail';
import { Discover } from './pages/Discover';
import { Watchlist } from './pages/Watchlist';
import { History } from './pages/History';
import { AdultPage } from './pages/Adult';

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="danh-sach/:slug" element={<Category />} />
            <Route path="the-loai/:slug" element={<Category />} />
            <Route path="quoc-gia/:slug" element={<Category />} />
            <Route path="nam-phat-hanh/:year" element={<Category />} />
            <Route path="tim-kiem" element={<Search />} />
            <Route path="kham-pha" element={<Discover />} />
            <Route path="yeu-thich" element={<Watchlist />} />
            <Route path="lich-su" element={<History />} />
            <Route path="nguoi-lon" element={<AdultPage />} />
            <Route path="film/:slug" element={<MovieDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}
