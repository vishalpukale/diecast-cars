import { Link, useLocation, useSearchParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const order = location.state?.order;
  const orderNumber = order?.orderNumber || params.get('order');

  return (
    <section className="container-shell py-16 text-center">
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--success)]">
        Order created
      </p>
      <h1 className="font-display text-5xl tracking-[0.04em]">WhatsApp is next</h1>
      <p className="muted mx-auto mt-4 max-w-xl">
        Your order{orderNumber ? ` ${orderNumber}` : ''} is saved with status{' '}
        <strong>pending_whatsapp</strong>. Finish by sending the prefilled message to the
        seller if the chat didn&apos;t open automatically.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {order?.whatsappUrl && (
          <a href={order.whatsappUrl} className="btn btn-primary" target="_blank" rel="noreferrer">
            Open WhatsApp again
          </a>
        )}
        <Link to="/catalog" className="btn btn-ghost">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
