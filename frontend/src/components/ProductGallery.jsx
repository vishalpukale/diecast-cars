import { useEffect, useMemo, useState } from 'react';
import { getProductGallery } from '../utils/media';

export default function ProductGallery({ product }) {
  const images = useMemo(() => getProductGallery(product), [product]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [product?.id, images.length]);

  if (!images.length) {
    return (
      <div className="grid aspect-[4/3] place-items-center border border-[rgba(18,18,18,0.08)] bg-[var(--paper-2)] text-sm text-[rgba(18,18,18,0.5)]">
        No images
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  const go = (dir) => {
    setActive((prev) => (prev + dir + images.length) % images.length);
  };

  return (
    <div className="product-gallery">
      <div className="relative overflow-hidden border border-[rgba(18,18,18,0.08)] bg-[var(--paper-2)]">
        <img
          src={current.url}
          alt={current.alt || product?.name || 'Diecast car'}
          className="aspect-[4/3] w-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              className="gallery-nav gallery-nav-prev"
              aria-label="Previous image"
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="gallery-nav gallery-nav-next"
              aria-label="Next image"
              onClick={() => go(1)}
            >
              ›
            </button>
            <div className="absolute bottom-3 right-3 rounded bg-black/65 px-2 py-1 text-xs font-semibold text-white">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <button
              key={`${img.url}-${index}`}
              type="button"
              className={`overflow-hidden border ${
                index === active
                  ? 'border-[var(--signal)]'
                  : 'border-[rgba(18,18,18,0.12)] opacity-80 hover:opacity-100'
              }`}
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={img.url}
                alt={img.alt || `Thumbnail ${index + 1}`}
                className="aspect-square w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
