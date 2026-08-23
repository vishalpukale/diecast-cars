import { Link, NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../redux/reducers/cartSlice';

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold tracking-wide uppercase transition ${
    isActive ? 'text-[var(--signal)]' : 'text-[rgba(18,18,18,0.72)] hover:text-[var(--ink)]'
  }`;

export default function Header() {
  const count = useSelector(selectCartCount);

  return (
    <header className="site-header">
      <div className="container-shell flex items-center justify-between gap-4 py-3.5">
        <Link to="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center bg-[var(--ink)] text-white">
            <svg width="22" height="22" viewBox="0 0 64 64" fill="none" aria-hidden>
              <path d="M10 36h44l-6-12H16l-6 12z" fill="#E10600" />
              <circle cx="20" cy="40" r="6" fill="#F5F5F3" />
              <circle cx="44" cy="40" r="6" fill="#F5F5F3" />
            </svg>
          </span>
          <span>
            <span className="font-display block text-2xl leading-none tracking-[0.08em]">
              DieCast Cars
            </span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[rgba(18,18,18,0.5)]">
              Collectors store
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Cart
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/catalog" className="btn btn-ghost hidden sm:inline-flex">
            Browse
          </Link>
          <Link to="/cart" className="btn btn-dark relative px-4 py-2.5">
            Cart
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
