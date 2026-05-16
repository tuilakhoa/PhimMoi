import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function Layout() {
  const location = useLocation();

  useEffect(() => {
    const isAdultPage = location.pathname.startsWith('/nguoi-lon') || location.pathname.startsWith('/dien-vien-18');
    const faviconUrl = isAdultPage ? '/favicon-adult.svg' : '/favicon.svg';
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/svg+xml';
    link.href = faviconUrl;
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-rose-500/30 flex flex-col">
      <Navbar />
      <main className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
