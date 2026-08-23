const orderService = require('../services/order.service');
const { success } = require('../utils/response.utils');

const checkout = async (req, res) => {
  const data = await orderService.createCheckoutOrder(req.body);
  return success(res, data, 'Order created. Continue on WhatsApp.', 201);
};

const listOrders = async (req, res) => {
  const data = await orderService.listOrders(req.query);
  return success(res, data, 'Orders fetched');
};

const getOrder = async (req, res) => {
  const data = await orderService.getOrderByNumber(req.params.orderNumber);
  return success(res, data, 'Order fetched');
};

const updateOrderStatus = async (req, res) => {
  const data = await orderService.updateOrderStatus(
    req.params.orderNumber,
    req.body.status
  );
  return success(res, data, 'Order status updated');
};

const listOrderStatuses = async (req, res) => {
  return success(res, orderService.getOrderStatuses(), 'Order statuses');
};

module.exports = {
  checkout,
  listOrders,
  getOrder,
  updateOrderStatus,
  listOrderStatuses,
};
