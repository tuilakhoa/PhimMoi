import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  absoluteTitle?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  schema?: any; // Structured data (JSON-LD)
  canonical?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title,
  absoluteTitle,
  description = "Xem phim online, phim người lớn 18+, JAV Vietsub và ảnh Cosplay Nude nghệ thuật chất lượng cao. Nền tảng giải trí đa thể loại cập nhật liên tục.", 
  image = "https://phim.nguonc.com/public/images/Film/kwPN5eeCEcEh347j7aW8BudNVF4.jpg", // Default fallback image from NguonC
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website",
  keywords = "phim online, xem phim, phim 18+, phim nguoi lon, jav vietsub, phim sex, phim x, cosplay nude, anh nude nghe thuat, phim bom tan, phim top1",
  schema,
  canonical
}) => {
  const siteName = "PhimTop1";
  const branding = "Xem phim online, Phim 18+ & Cosplay Nude";
  
  const fullTitle = absoluteTitle || (title ? `${title} | ${siteName}` : `${siteName} - ${branding}`);

  return (
    <Helmet>
      <meta name="google-site-verification" content="F06Vd6lFniUXmJXH80UUhTa09r0DBaHqgM4JuQTCX6U" />
      <meta name="msvalidate.01" content="3272BDE866C77FFFE8499EB05F224A6B" />
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />

      {/* Structured Data (JSON-LD) */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};
