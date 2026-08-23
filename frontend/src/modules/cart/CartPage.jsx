import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  removeFromCart,
  selectCartItems,
  selectCartSubtotal,
  updateQuantity,
} from '../../redux/reducers/cartSlice';
import { formatInr } from '../../utils/format';

export default function CartPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();

  if (!items.length) {
    return (
      <section className="container-shell py-16 text-center">
        <h1 className="font-display text-5xl tracking-[0.04em]">Your cart is empty</h1>
        <p className="muted mt-3">Browse the catalog and add models to continue.</p>
        <Link to="/catalog" className="btn btn-primary mt-6">
          Browse catalog
        </Link>
      </section>
    );
  }

  return (
    <section className="container-shell py-10">
      <h1 className="font-display mb-8 text-5xl tracking-[0.04em]">Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[88px_1fr_auto] gap-4 border border-[rgba(18,18,18,0.08)] bg-white/70 p-3"
            >
              <img
                src={item.thumbnailUrl}
                alt={item.name}
                className="h-[88px] w-[88px] object-cover"
              />
              <div>
                <Link to={`/product/${item.slug}`} className="font-bold">
                  {item.name}
                </Link>
                <p className="mt-1 text-xs uppercase tracking-wide text-[rgba(18,18,18,0.45)]">
                  {item.brandName} · {item.sku}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={item.stock}
                    value={item.quantity}
                    className="w-20 border border-[rgba(18,18,18,0.16)] bg-white px-2 py-1"
                    onChange={(e) =>
                      dispatch(
                        updateQuantity({ id: item.id, quantity: Number(e.target.value) })
                      )
                    }
                  />
                  <button
                    type="button"
                    className="text-sm font-semibold text-[var(--signal)]"
                    onClick={() => dispatch(removeFromCart(item.id))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <p className="price">{formatInr(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <aside className="h-fit border border-[rgba(18,18,18,0.1)] bg-[var(--ink)] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            Order summary
          </p>
          <div className="mt-4 flex items-center justify-between text-lg font-bold">
            <span>Subtotal</span>
            <span>{formatInr(subtotal)}</span>
          </div>
          <p className="mt-3 text-sm text-white/65">
            Shipping & payment confirmed on WhatsApp after checkout.
          </p>
          <Link to="/checkout" className="btn btn-primary mt-6 w-full">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
