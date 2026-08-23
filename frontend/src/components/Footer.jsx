import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[rgba(18,18,18,0.1)] bg-[var(--track)] text-white">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-4xl tracking-[0.08em]">DieCast Cars</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70">
            Authentic Hot Wheels, Mini GT, Tomica and premium diecast models.
            Checkout on WhatsApp until online payments are live.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            Explore
          </p>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/catalog">Full catalog</Link>
            <Link to="/catalog?justArrived=true">Just arrived</Link>
            <Link to="/cart">Your cart</Link>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
            Order help
          </p>
          <p className="text-sm text-white/70">
            WhatsApp orders:{' '}
            <a className="text-white underline" href="https://wa.me/917620072536">
              +91 76200 72536
            </a>
          </p>
          <p className="mt-2 text-sm text-white/70">Free shipping cues above ₹1499.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} DieCast Cars. Built for collectors.
      </div>
    </footer>
  );
}
