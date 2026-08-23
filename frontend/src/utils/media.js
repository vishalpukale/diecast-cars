const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3330/api'
).replace(/\/api\/?$/, '');

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    return `${API_ORIGIN}${url}`;
  }
  return url;
};

export const getProductGallery = (product) => {
  const fromImages = Array.isArray(product?.images)
    ? product.images
        .map((img, index) => ({
          url: typeof img === 'string' ? img : img?.url,
          alt: (typeof img === 'object' && img?.alt) || product?.name || '',
          sort: typeof img === 'object' ? img.sort ?? index : index,
        }))
        .filter((img) => img.url)
    : [];

  const list = fromImages.length
    ? fromImages
    : product?.thumbnailUrl
      ? [{ url: product.thumbnailUrl, alt: product.name || '', sort: 0 }]
      : [];

  return list
    .sort((a, b) => a.sort - b.sort)
    .slice(0, 5)
    .map((img) => ({
      ...img,
      url: resolveMediaUrl(img.url),
    }));
};
