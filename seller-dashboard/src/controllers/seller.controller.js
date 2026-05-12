const userModel = require("../models/user.model");
const productModel = require("../models/product.model");
const orderModel = require("../models/order.model");
const paymentModel = require("../models/payment.model");

async function getMetrics(req, res) {
  try {
    const sellerId = req.user;
    const [sales, revenueData, topProducts] = await Promise.all([
      orderModel.countDocuments({
        sellerId,
        status: { $in: ["COMPLETED", "DELIVERED", "SHIPPED"] },
      }),
      paymentModel.aggregate([
        {
          $match: {
            sellerId,
            status: { $in: ["PAID", "SUCCEEDED", "COMPLETED"] },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ["$amount", 0] } },
          },
        },
      ]),
      orderModel.aggregate([
        {
          $match: {
            sellerId,
            status: { $in: ["COMPLETED", "DELIVERED", "SHIPPED"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            unitsSold: { $sum: { $ifNull: ["$items.quantity", 1] } },
            revenue: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$items.price", 0] },
                  { $ifNull: ["$items.quantity", 1] },
                ],
              },
            },
          },
        },
        { $sort: { unitsSold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            name: "$product.name",
            image: "$product.image",
            unitsSold: 1,
            revenue: 1,
          },
        },
      ]),
    ]);

    return res.status(200).json({
      sales,
      revenue: revenueData[0]?.totalRevenue || 0,
      topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getOrders(req, res) {
  try {
    const sellerId = req.user;

    // Get all products for this seller
    const products = await productModel.find({ sellerId }).select("_id");
    const productIds = products.map((p) => p._id);

    // Get all orders that containing seller's products
    const orders = await orderModel
      .find({ "items.product": { $in: productIds } })
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });

    // filter orders to only include items from this seller
    const filteredOrders = orders.map((order) => {
      const sellerItems = order.items.filter((item) =>
        productIds.includes(item.product._id),
      );
      return {
        ...order.toObject(),
        items: sellerItems,
      };
    });

    return res.status(200).json({ orders: filteredOrders });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

async function getProducts(req, res) {
  try {
    const sellerId = req.user;
    const products = await productModel.find({ sellerId });
    return res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  getMetrics,
  getOrders,
  getProducts
};
