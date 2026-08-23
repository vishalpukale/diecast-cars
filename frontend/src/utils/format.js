export const formatInr = (amount) =>
  `₹${Number(amount || 0).toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;

export const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
