import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getProduct } from '../../services/api';
import { addToCart } from '../../redux/reducers/cartSlice';
import { formatInr } from '../../utils/format';
import ProductGallery from '../../components/ProductGallery';

export default function ProductPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getProduct(slug);
        if (!alive) return;
        setProduct(data);
        setQty(1);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return <p className="container-shell py-16 muted">Loading product…</p>;
  }
  if (error || !product) {
    return (
      <div className="container-shell py-16">
        <p className="text-[var(--signal)]">{error || 'Product not found'}</p>
        <Link to="/catalog" className="btn btn-dark mt-4">
          Back to catalog
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    dispatch(addToCart({ ...product, quantity: qty }));
    toast.success('Added to cart');
  };

  return (
    <section className="container-shell grid gap-10 py-10 lg:grid-cols-2">
      <ProductGallery product={product} />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[rgba(18,18,18,0.45)]">
          {product.brand?.name}
        </p>
        <h1 className="font-display mt-3 text-5xl tracking-[0.04em] leading-[0.95]">
          {product.name}
        </h1>
        <dl className="mt-4 flex flex-wrap gap-6 text-sm">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[rgba(18,18,18,0.45)]">
              Scale
            </dt>
            <dd className="mt-0.5 font-semibold" title="Model size vs real car (e.g. 1:64 = small, 1:18 = large)">
              {product.scale}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-[rgba(18,18,18,0.45)]">
              SKU
            </dt>
            <dd className="mt-0.5 font-semibold" title="Stock Keeping Unit — unique product code">
              {product.sku}
            </dd>
          </div>
        </dl>
        <div className="mt-4 flex items-end gap-3">
          <p className="price text-3xl">{formatInr(product.price)}</p>
          {product.compareAtPrice ? (
            <p className="pb-1 text-sm text-[rgba(18,18,18,0.4)] line-through">
              {formatInr(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
        <p className="mt-5 max-w-xl leading-relaxed text-[rgba(18,18,18,0.72)]">
          {product.description}
        </p>
        <p className="mt-3 text-sm font-semibold">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="field w-28">
            <label htmlFor="qty">Qty</label>
            <input
              id="qty"
              type="number"
              min={1}
              max={product.stock}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={product.stock < 1}
            onClick={handleAdd}
          >
            Add to cart
          </button>
          <Link to="/cart" className="btn btn-ghost">
            View cart
          </Link>
        </div>
      </div>
    </section>
  );
}
