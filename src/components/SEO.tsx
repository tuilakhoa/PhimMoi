import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
}

export const SEO: React.FC<SEOProps> = ({ 
  title, 
  description = "Xem phim online miễn phí chất lượng cao nhanh nhất với đầy đủ các thể loại. Phim mới cập nhật liên tục mỗi ngày.", 
  image = "https://phim.nguonc.com/public/images/Film/kwPN5eeCEcEh347j7aW8BudNVF4.jpg", // Default fallback image from NguonC
  url = typeof window !== 'undefined' ? window.location.href : '',
  type = "website",
  keywords
}) => {
  const siteName = "PhimHay";
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Helmet>
      <meta name="google-site-verification" content="F06Vd6lFniUXmJXH80UUhTa09r0DBaHqgM4JuQTCX6U" />
      <meta name="msvalidate.01" content="3272BDE866C77FFFE8499EB05F224A6B" />
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

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
    </Helmet>
  );
};
