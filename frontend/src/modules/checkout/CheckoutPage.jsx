import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import {
  clearCart,
  selectCartItems,
  selectCartSubtotal,
} from '../../redux/reducers/cartSlice';
import { checkoutOrder } from '../../services/api';
import { formatInr } from '../../utils/format';

const initialForm = {
  name: '',
  phone: '',
  addressLine: '',
  city: '',
  pincode: '',
  notes: '',
};

export default function CheckoutPage() {
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  if (!items.length) {
    return (
      <section className="container-shell py-16 text-center">
        <h1 className="font-display text-5xl tracking-[0.04em]">Nothing to checkout</h1>
        <Link to="/catalog" className="btn btn-primary mt-6">
          Browse catalog
        </Link>
      </section>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const result = await checkoutOrder({
        customer: {
          name: form.name,
          phone: form.phone,
          addressLine: form.addressLine,
          city: form.city,
          pincode: form.pincode,
        },
        notes: form.notes || undefined,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
      });

      dispatch(clearCart());
      toast.success(`Order ${result.orderNumber} created`);
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
      navigate(`/order-success?order=${encodeURIComponent(result.orderNumber)}`, {
        state: { order: result },
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container-shell py-10">
      <h1 className="font-display mb-2 text-5xl tracking-[0.04em]">Checkout</h1>
      <p className="muted mb-8 max-w-2xl">
        Confirm your details. We&apos;ll save the order and open WhatsApp with your cart
        so the seller can confirm payment & delivery.
      </p>

      <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-4 border border-[rgba(18,18,18,0.08)] bg-white/70 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field">
              <label htmlFor="name">Full name *</label>
              <input id="name" name="name" required value={form.name} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone (WhatsApp) *</label>
              <input
                id="phone"
                name="phone"
                required
                value={form.phone}
                onChange={onChange}
                placeholder="10-digit mobile"
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="addressLine">Address *</label>
            <textarea
              id="addressLine"
              name="addressLine"
              required
              rows={3}
              value={form.addressLine}
              onChange={onChange}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="field">
              <label htmlFor="city">City *</label>
              <input id="city" name="city" required value={form.city} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="pincode">Pincode *</label>
              <input
                id="pincode"
                name="pincode"
                required
                value={form.pincode}
                onChange={onChange}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              value={form.notes}
              onChange={onChange}
              placeholder="Landmark, preferred courier, etc."
            />
          </div>
        </div>

        <aside className="h-fit border border-[rgba(18,18,18,0.1)] bg-[var(--ink)] p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">
            Your order
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span className="text-white/80">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-semibold">
                  {formatInr(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatInr(subtotal)}</span>
          </div>
          <button type="submit" className="btn btn-primary mt-6 w-full" disabled={submitting}>
            {submitting ? 'Creating order…' : 'Confirm & open WhatsApp'}
          </button>
        </aside>
      </form>
    </section>
  );
}
