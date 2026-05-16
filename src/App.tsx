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
import { ActorsPage } from './pages/Actors';

import { CosplayPage } from './pages/CosplayPage';
import { CosplayDetail } from './pages/CosplayDetail';
import { WatchRoom } from './pages/WatchRoom';
import APIDocs from './pages/APIDocs';
import { AgeProvider } from './contexts/AgeContext';
import { AgeGate } from './components/AgeGate';

export default function App() {
  return (
    <AgeProvider>
      <HelmetProvider>
        <BrowserRouter>
          <AgeGate />
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
            <Route path="dien-vien-18" element={<ActorsPage />} />
            <Route path="nguoi-lon/cosplay" element={<CosplayPage />} />
            <Route path="nguoi-lon/cosplay/:id" element={<CosplayDetail />} />
            <Route path="film/:slug" element={<MovieDetailPage />} />
            <Route path="watch/:roomId" element={<WatchRoom />} />
            <Route path="api-docs" element={<APIDocs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
    </AgeProvider>
  );
}
