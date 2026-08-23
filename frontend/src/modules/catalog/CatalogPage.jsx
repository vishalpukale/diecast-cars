import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getBrands, getCategories, getProducts } from '../../services/api';
import ProductCard from '../../components/ProductCard';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = useMemo(
    () => ({
      brand: searchParams.get('brand') || '',
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      featured: searchParams.get('featured') || '',
      justArrived: searchParams.get('justArrived') || '',
      sort: searchParams.get('sort') || 'newest',
      page: searchParams.get('page') || '1',
    }),
    [searchParams]
  );

  useEffect(() => {
    getBrands().then(setBrands).catch(() => {});
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getProducts({
          ...filters,
          limit: 16,
        });
        if (!alive) return;
        setProducts(data.items || []);
        setPagination(data.pagination);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [filters]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <section className="container-shell py-10">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgba(18,18,18,0.45)]">
          Catalog
        </p>
        <h1 className="font-display text-5xl tracking-[0.04em]">All models</h1>
      </div>

      <div className="mb-8 grid gap-3 md:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input
            id="search"
            value={filters.search}
            placeholder="Name or SKU"
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="brand">Brand</label>
          <select
            id="brand"
            value={filters.brand}
            onChange={(e) => updateFilter('brand', e.target.value)}
          >
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="sort">Sort</label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="name">Name</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="flags">Flags</label>
          <select
            id="flags"
            value={
              filters.justArrived === 'true'
                ? 'justArrived'
                : filters.featured === 'true'
                  ? 'featured'
                  : ''
            }
            onChange={(e) => {
              const next = new URLSearchParams(searchParams);
              next.delete('featured');
              next.delete('justArrived');
              next.delete('page');
              if (e.target.value === 'featured') next.set('featured', 'true');
              if (e.target.value === 'justArrived') next.set('justArrived', 'true');
              setSearchParams(next);
            }}
          >
            <option value="">All</option>
            <option value="justArrived">Just arrived</option>
            <option value="featured">Featured</option>
          </select>
        </div>
      </div>

      {loading && <p className="muted">Loading catalog…</p>}
      {error && <p className="text-[var(--signal)]">{error}</p>}
      {!loading && !error && products.length === 0 && (
        <p className="muted">No models match these filters.</p>
      )}
      {!loading && !error && products.length > 0 && (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', String(pagination.page - 1))}
              >
                Prev
              </button>
              <span className="text-sm font-semibold">
                Page {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilter('page', String(pagination.page + 1))}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
