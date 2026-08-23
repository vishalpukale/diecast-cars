const { eq, desc } = require('drizzle-orm');
const { db, pool } = require('../config/database');
const { ordersTable, orderItemsTable } = require('../models');
const HttpException = require('../utils/HttpException.utils');
const { ORDER_STATUSES } = require('../constants/order-status');

const WHATSAPP_NUMBER = () =>
  String(process.env.WHATSAPP_NUMBER || '917620072536').replace(/\D/g, '');

const STORE_NAME = () => process.env.STORE_NAME || 'DieCast Cars';

const generateOrderNumber = () => {
  const now = new Date();
  const stamp = now
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `DC${stamp}${rand}`;
};

const formatInr = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const buildWhatsAppMessage = ({ orderNumber, customer, items, total, notes }) => {
  const lines = [
    `Hi ${STORE_NAME()}! I want to place an order.`,
    '',
    `Order: ${orderNumber}`,
    `Name: ${customer.name}`,
    `Phone: ${customer.phone}`,
    `Address: ${customer.addressLine}`,
    `City: ${customer.city}`,
    `Pincode: ${customer.pincode}`,
    '',
    'Items:',
    ...items.map(
      (item, i) =>
        `${i + 1}. ${item.productName} (${item.productSku}) × ${item.quantity} = ${formatInr(item.lineTotal)}`
    ),
    '',
    `Total: ${formatInr(total)}`,
  ];

  if (notes) {
    lines.push('', `Notes: ${notes}`);
  }

  lines.push('', 'Please confirm availability & payment details.');
  return lines.join('\n');
};

const validateCheckoutPayload = (payload) => {
  const errors = [];
  if (!payload?.customer?.name?.trim()) errors.push('Name is required');
  if (!payload?.customer?.phone?.trim()) errors.push('Phone is required');
  if (!payload?.customer?.addressLine?.trim()) errors.push('Address is required');
  if (!payload?.customer?.city?.trim()) errors.push('City is required');
  if (!payload?.customer?.pincode?.trim()) errors.push('Pincode is required');
  if (!Array.isArray(payload?.items) || payload.items.length === 0) {
    errors.push('Cart is empty');
  }
  if (errors.length) throw new HttpException(400, errors.join(', '));
};

const createCheckoutOrder = async (payload) => {
  validateCheckoutPayload(payload);

  const customer = {
    name: payload.customer.name.trim(),
    phone: payload.customer.phone.trim(),
    addressLine: payload.customer.addressLine.trim(),
    city: payload.customer.city.trim(),
    pincode: payload.customer.pincode.trim(),
  };
  const notes = payload.notes?.trim() || null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const lineItems = [];
    let subtotal = 0;

    for (const item of payload.items) {
      const productId = Number(item.productId);
      const quantity = Math.max(1, Number(item.quantity) || 1);

      const { rows } = await client.query(
        `SELECT id, sku, name, price, stock, thumbnail_url, scale, is_active, is_deleted
         FROM products WHERE id = $1 FOR UPDATE`,
        [productId]
      );

      if (!rows.length || rows[0].is_deleted || !rows[0].is_active) {
        throw new HttpException(400, `Product unavailable: ${productId}`);
      }

      const product = rows[0];
      if (product.stock < quantity) {
        throw new HttpException(
          400,
          `Insufficient stock for ${product.name}. Available: ${product.stock}`
        );
      }

      const unitPrice = Number(product.price);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      lineItems.push({
        productId: Number(product.id),
        productName: product.name,
        productSku: product.sku,
        unitPrice,
        quantity,
        lineTotal,
        productSnapshot: {
          id: Number(product.id),
          sku: product.sku,
          name: product.name,
          price: unitPrice,
          scale: product.scale,
          thumbnailUrl: product.thumbnail_url,
        },
      });

      await client.query(
        `UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2`,
        [quantity, product.id]
      );
    }

    const orderNumber = generateOrderNumber();
    const total = subtotal;
    const whatsappMessage = buildWhatsAppMessage({
      orderNumber,
      customer,
      items: lineItems,
      total,
      notes,
    });

    const orderInsert = await client.query(
      `INSERT INTO orders (
        order_number, status, customer_name, customer_phone, address_line,
        city, pincode, notes, subtotal, total, currency, whatsapp_message, meta
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'INR',$11,$12)
      RETURNING *`,
      [
        orderNumber,
        'pending_whatsapp',
        customer.name,
        customer.phone,
        customer.addressLine,
        customer.city,
        customer.pincode,
        notes,
        subtotal.toFixed(2),
        total.toFixed(2),
        whatsappMessage,
        JSON.stringify({ source: 'storefront' }),
      ]
    );

    const order = orderInsert.rows[0];

    for (const line of lineItems) {
      await client.query(
        `INSERT INTO order_items (
          order_id, product_id, product_name, product_sku,
          unit_price, quantity, line_total, product_snapshot
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          order.id,
          line.productId,
          line.productName,
          line.productSku,
          line.unitPrice.toFixed(2),
          line.quantity,
          line.lineTotal.toFixed(2),
          JSON.stringify(line.productSnapshot),
        ]
      );
    }

    await client.query('COMMIT');

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER()}?text=${encodeURIComponent(whatsappMessage)}`;

    return {
      orderId: Number(order.id),
      orderNumber: order.order_number,
      status: order.status,
      total: Number(order.total),
      currency: order.currency,
      whatsappUrl,
      whatsappMessage,
      customer,
      items: lineItems,
    };
  } catch (err) {
    await client.query('ROLLBACK');
    throw HttpException.from(err, 500, 'Checkout failed');
  } finally {
    client.release();
  }
};

const listOrders = async ({ limit = 50 } = {}) => {
  const rows = await db
    .select()
    .from(ordersTable)
    .orderBy(desc(ordersTable.createdAt))
    .limit(Math.min(100, Number(limit) || 50));

  return rows.map((o) => ({
    id: Number(o.id),
    orderNumber: o.orderNumber,
    status: o.status,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    city: o.city,
    pincode: o.pincode,
    total: Number(o.total),
    createdAt: o.createdAt,
  }));
};

const getOrderByNumber = async (orderNumber) => {
  const [order] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.orderNumber, orderNumber))
    .limit(1);

  if (!order) throw new HttpException(404, 'Order not found');

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  return {
    id: Number(order.id),
    orderNumber: order.orderNumber,
    status: order.status,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      addressLine: order.addressLine,
      city: order.city,
      pincode: order.pincode,
    },
    notes: order.notes,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    whatsappMessage: order.whatsappMessage,
    items: items.map((i) => ({
      id: Number(i.id),
      productId: i.productId != null ? Number(i.productId) : null,
      productName: i.productName,
      productSku: i.productSku,
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      lineTotal: Number(i.lineTotal),
    })),
    createdAt: order.createdAt,
  };
};

const updateOrderStatus = async (orderNumber, status) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new HttpException(
      400,
      `Invalid status. Allowed: ${ORDER_STATUSES.join(', ')}`
    );
  }

  const [order] = await db
    .update(ordersTable)
    .set({ status, updatedAt: new Date() })
    .where(eq(ordersTable.orderNumber, orderNumber))
    .returning();

  if (!order) throw new HttpException(404, 'Order not found');

  return {
    id: Number(order.id),
    orderNumber: order.orderNumber,
    status: order.status,
    updatedAt: order.updatedAt,
  };
};

const getOrderStatuses = () => ORDER_STATUSES;

module.exports = {
  createCheckoutOrder,
  listOrders,
  getOrderByNumber,
  updateOrderStatus,
  getOrderStatuses,
  WHATSAPP_NUMBER,
};
