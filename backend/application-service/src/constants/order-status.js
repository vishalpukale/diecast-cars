/** Order lifecycle — seller updates these in admin after WhatsApp checkout */
const ORDER_STATUSES = [
  'pending_whatsapp',
  'confirmed',
  'shipped',
  'completed',
  'cancelled',
];

const ORDER_STATUS_LABELS = {
  pending_whatsapp: 'Pending WhatsApp',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

module.exports = {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
};
