import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { addToCart } from '../redux/reducers/cartSlice';
import { formatInr } from '../utils/format';
import { resolveMediaUrl } from '../utils/media';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const imageUrl = resolveMediaUrl(product.thumbnailUrl);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ ...product, quantity: 1 }));
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-[rgba(18,18,18,0.08)] bg-white/70 transition duration-300 hover:-translate-y-1 hover:border-[rgba(18,18,18,0.2)] hover:shadow-[0_18px_40px_rgba(18,18,18,0.08)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--paper-2)]">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.isJustArrived && <span className="badge badge-signal">New</span>}
          {product.isFeatured && <span className="badge">Featured</span>}
        </div>
        {Array.isArray(product.images) && product.images.length > 1 ? (
          <span className="absolute bottom-3 right-3 rounded bg-black/60 px-2 py-0.5 text-[0.65rem] font-bold text-white">
            {Math.min(product.images.length, 5)} photos
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[rgba(18,18,18,0.45)]">
          {product.brand?.name || 'Diecast'} · {product.scale || '—'}
        </p>
        <h3 className="line-clamp-2 text-[0.98rem] font-bold leading-snug">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="price text-lg">{formatInr(product.price)}</p>
            {product.compareAtPrice ? (
              <p className="text-xs text-[rgba(18,18,18,0.4)] line-through">
                {formatInr(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
          <button type="button" className="btn btn-primary px-3 py-2 text-xs" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
