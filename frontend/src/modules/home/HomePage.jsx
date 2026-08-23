import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBrands, getProducts } from '../../services/api';
import ProductCard from '../../components/ProductCard';

export default function HomePage() {
  const [justArrived, setJustArrived] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [arrived, feat, brandList] = await Promise.all([
          getProducts({ justArrived: true, limit: 8 }),
          getProducts({ featured: true, limit: 8 }),
          getBrands(),
        ]);
        if (!alive) return;
        setJustArrived(arrived.items || []);
        setFeatured(feat.items || []);
        setBrands(brandList || []);
      } catch (err) {
        if (alive) setError(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <section className="hero-plane">
        <div className="container-shell relative z-10 grid min-h-[min(88vh,760px)] items-end gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-rise">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-white/60">
              Authentic diecast · India
            </p>
            <h1 className="font-display max-w-xl text-[clamp(3.4rem,9vw,6.4rem)] leading-[0.88] tracking-[0.04em]">
              DieCast Cars
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75">
              Hot Wheels to AutoArt — build your shelf with models that feel real.
              Cart online, confirm on WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog" className="btn btn-primary">
                Browse collection
              </Link>
              <Link to="/catalog?justArrived=true" className="btn btn-ghost border-white/30 text-white">
                Just arrived
              </Link>
            </div>
          </div>

          <div className="animate-rise-delay relative hidden lg:block">
            <div className="animate-drift absolute -left-6 top-8 h-40 w-40 rounded-full bg-[var(--signal)]/30 blur-3xl" />
            <div className="relative overflow-hidden border border-white/15 bg-white/5 p-6 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                Scale range we carry
              </p>
              <p className="font-display mt-3 text-5xl tracking-[0.06em]">1:64 → 1:18</p>
              <p className="mt-2 text-xs text-white/50">
                Pocket-size Hot Wheels (1:64) up to large display models (1:18)
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/70">
                Premium castings, chase editions, and weekly drops — ready for collectors
                who care about finish, scale, and authenticity.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                {['Hot Wheels', 'Mini GT', 'Tomica'].map((label) => (
                  <div key={label} className="border border-white/10 bg-black/20 px-2 py-3 text-xs font-semibold">
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell -mt-8 relative z-20">
        <div className="trust-strip">
          {[
            'Free shipping cues above ₹1499',
            '100% authentic brands',
            'Safe collector packaging',
            'Fast WhatsApp dispatch',
          ].map((item) => (
            <div key={item} className="trust-item">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="container-shell mt-16">
        <div className="section-head">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgba(18,18,18,0.45)]">
              Brands we carry
            </p>
            <h2>Known names. Real metal.</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/catalog?brand=${brand.slug}`}
              className="border border-[rgba(18,18,18,0.12)] bg-white/60 px-4 py-2 text-sm font-semibold transition hover:border-[var(--ink)]"
            >
              {brand.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shell mt-16">
        <div className="section-head">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgba(18,18,18,0.45)]">
              Fresh metal
            </p>
            <h2>Just arrived</h2>
          </div>
          <Link to="/catalog?justArrived=true" className="text-sm font-bold uppercase tracking-wide">
            View all →
          </Link>
        </div>
        {loading && <p className="muted">Loading models…</p>}
        {error && <p className="text-[var(--signal)]">{error}</p>}
        {!loading && !error && (
          <div className="product-grid">
            {justArrived.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container-shell mt-16 mb-8">
        <div className="section-head">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[rgba(18,18,18,0.45)]">
              Collector picks
            </p>
            <h2>Featured</h2>
          </div>
          <Link to="/catalog?featured=true" className="text-sm font-bold uppercase tracking-wide">
            View all →
          </Link>
        </div>
        {!loading && !error && (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container-shell mb-10 overflow-hidden border border-[rgba(18,18,18,0.1)] bg-[var(--ink)] text-white">
        <div className="grid gap-6 p-8 md:grid-cols-[1.3fr_auto] md:items-center md:p-12">
          <div>
            <h2 className="font-display text-4xl tracking-[0.05em] md:text-5xl">
              Start your collection today
            </h2>
            <p className="mt-3 max-w-xl text-white/70">
              Add models to your cart, share details on WhatsApp, and we&apos;ll confirm
              stock and shipping manually — simple, personal, collector-first.
            </p>
          </div>
          <Link to="/catalog" className="btn btn-primary self-start">
            Browse collection
          </Link>
        </div>
      </section>
    </>
  );
}
