const Order = require("../models/Order");

exports.getUserOrders = async (req, res) => {
  try {
    // Ensure user can only access their own orders
    if (req.user._id.toString() !== req.params.userId) {
      return res.status(403).json({
        message: "Access denied: You can only view your own orders",
      });
    }

    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.medicineId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
};

exports.getOrderStats = async (req, res) => {
  try {
    const total = await Order.countDocuments();
    const pending = await Order.countDocuments({ status: "pending" });
    const completed = await Order.countDocuments({ status: "completed" });

    // Calculate total revenue from completed orders
    const completedOrders = await Order.find({ status: "completed" });
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Get monthly revenue data for the last 6 months
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  { $subtract: ["$_id.month", 1] },
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          revenue: 1,
          orderCount: 1,
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      total,
      pending,
      completed,
      totalRevenue,
      monthlyRevenue,
    });
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({ message: "Error fetching order statistics" });
  }
};

exports.reorderPreviousOrder = async (req, res) => {
  try {
    const originalOrder = await Order.findById(req.params.orderId).populate(
      "items.medicineId"
    );

    if (!originalOrder) {
      return res.status(404).json({ message: "Original order not found" });
    }

    // Check medicine availability
    const unavailableMedicines = await originalOrder.checkReorderAvailability();
    if (unavailableMedicines.length === originalOrder.items.length) {
      return res.status(400).json({
        message: "All medicines from this order are currently unavailable",
        unavailableMedicines,
      });
    }

    // Create new order with available items only
    const availableItems = originalOrder.items.filter(
      (item) => !unavailableMedicines.includes(item.medicineId.toString())
    );

    const newOrder = new Order({
      userId: originalOrder.userId,
      items: availableItems,
      totalAmount: availableItems.reduce((sum, item) => sum + item.price, 0),
      shippingAddress: originalOrder.shippingAddress,
      customerDetails: originalOrder.customerDetails,
      isReorder: true,
      originalOrderId: originalOrder._id,
      reorderCount: (originalOrder.reorderCount || 0) + 1,
    });

    await newOrder.save();

    // Update medicine stock
    for (const item of availableItems) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: -1 },
      });
    }

    res.status(201).json({
      order: newOrder,
      unavailableMedicines:
        unavailableMedicines.length > 0 ? unavailableMedicines : null,
      message:
        unavailableMedicines.length > 0
          ? "Order created with available medicines only"
          : "Order successfully reordered",
    });
  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).json({ message: "Error processing reorder" });
  }
};

exports.getReorderHistory = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate({
      path: "reorderHistory.orderId",
      select: "createdAt totalAmount status",
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      originalOrder: order,
      reorderHistory: order.reorderHistory,
      reorderCount: order.reorderCount,
    });
  } catch (error) {
    console.error("Error fetching reorder history:", error);
    res.status(500).json({ message: "Error fetching reorder history" });
  }
};
