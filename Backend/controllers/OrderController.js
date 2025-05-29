import Order from "../models/Order.js";
import mongoose from "mongoose";
import Medicine from "../models/Medicine.js";

export const createOrder = async (req, res) => {
  try {
    console.log("Received order data:", req.body);

    // Basic validation for required fields
    if (
      !req.body.customerDetails ||
      !req.body.items ||
      !req.body.shippingAddress
    ) {
      return res.status(400).json({
        message: "Missing required order data",
        details: "Customer details, items, and shipping address are required",
      });
    }

    // Check stock availability
    for (const item of req.body.items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({
          message: "Medicine not found",
          details: `Medicine with ID ${item.medicineId} is not available`,
        });
      }
      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          message: "Insufficient stock",
          details: `Only ${medicine.stock} units available for ${medicine.name}`,
        });
      }
    }

    // Create order with sanitized data
    const order = new Order({
      items: req.body.items.map((item) => ({
        medicineId: item.medicineId,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      })),
      totalAmount: parseFloat(req.body.totalAmount),
      shippingAddress: req.body.shippingAddress.trim(),
      customerDetails: {
        fullName: req.body.customerDetails.fullName.trim(),
        email: req.body.customerDetails.email.toLowerCase().trim(),
        phone: req.body.customerDetails.phone.trim(),
      },
      status: "pending",
    });

    // Update medicine stock
    for (const item of req.body.items) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: -item.quantity },
      });
    }

    const savedOrder = await order.save();
    console.log("Order saved:", savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(400).json({
      message: "Failed to create order",
      details: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate({
        path: "items.medicineId",
        select: "name price category image",
      })
      .sort({ createdAt: -1 });

    if (!orders) {
      return res.status(404).json({
        success: false,
        message: "No orders found",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log("GET /orders/all - Fetching all orders");

    const orders = await Order.find()
      .populate("items.medicineId") // Add this line to populate medicine details
      .sort({ createdAt: -1 });

    console.log(`Found ${orders.length} orders`);

    if (orders.length === 0) {
      console.log("No orders found in database");
      // Still return empty array but with 200 status
      return res.status(200).json([]);
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      message: error.message,
      details: "Error fetching orders from database",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add this new test endpoint
export const createTestOrder = async (req, res) => {
  try {
    // First find a valid medicine to use
    const medicine = await mongoose.model("Medicine").findOne();

    if (!medicine) {
      return res
        .status(404)
        .json({ message: "No medicines found to create test order" });
    }

    const testOrder = new Order({
      userId: "test123",
      customerDetails: {
        fullName: "Test User",
        email: "test@example.com",
        phone: "1234567890",
      },
      items: [
        {
          medicineId: medicine._id, // Use actual medicine ID
          quantity: 1,
          price: medicine.price || 29.99,
        },
      ],
      totalAmount: medicine.price || 29.99,
      shippingAddress: "123 Test Street",
      status: "pending",
    });

    const savedOrder = await testOrder.save();
    console.log("Test order created:", savedOrder);
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating test order:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const allOrders = await Order.find();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // Calculate monthly revenue for the current year
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1),
          },
          status: { $in: ["completed", "processing"] },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          month: "$_id",
          revenue: 1,
          orderCount: 1,
          _id: 0,
        },
      },
      { $sort: { month: 1 } },
    ]);

    // Fill in missing months with zero values
    const completeMonthlyData = Array.from({ length: 12 }, (_, i) => {
      const existingData = monthlyRevenue.find((m) => m.month === i + 1);
      return existingData || { month: i + 1, revenue: 0, orderCount: 0 };
    });

    const stats = {
      total: allOrders.length,
      pending: allOrders.filter((order) => order.status === "pending").length,
      completed: allOrders.filter((order) => order.status === "completed")
        .length,
      processing: allOrders.filter((order) => order.status === "processing")
        .length,
      totalRevenue: allOrders
        .filter((order) => ["completed", "processing"].includes(order.status))
        .reduce((sum, order) => sum + order.totalAmount, 0),
      monthlyRevenue: completeMonthlyData.map((data) => ({
        ...data,
        month: new Date(currentYear, data.month - 1).toLocaleString("default", {
          month: "short",
        }),
      })),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting order stats:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getSalesAnalytics = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const [totalStats, monthlyStats] = await Promise.all([
      Order.aggregate([
        {
          $match: { status: "completed" },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: "$totalAmount" },
          },
        },
      ]),

      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfYear },
            status: "completed",
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
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Format monthly data
    const monthlyRevenue = monthlyStats.map((stat) => ({
      month: new Date(today.getFullYear(), stat._id.month - 1).toLocaleString(
        "default",
        { month: "short" }
      ),
      revenue: stat.revenue,
      orderCount: stat.orderCount,
    }));

    res.json({
      success: true,
      data: {
        totalRevenue: totalStats[0]?.totalRevenue || 0,
        monthlyRevenue: totalStats[0]?.monthlyRevenue || 0,
        averageOrderValue: totalStats[0]?.averageOrderValue || 0,
        monthlyData: monthlyRevenue,
      },
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales analytics",
      error: error.message,
    });
  }
};

export const updateOrderReceived = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "delivered",
        deliveredAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("items.medicineId");

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBillingStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get payment method stats
    const cardOrders = await Order.countDocuments({ paymentMethod: 'card' });
    const codOrders = await Order.countDocuments({ paymentMethod: 'cod' });
    
    // Calculate amounts by payment method
    const cardStats = await Order.aggregate([
      { 
        $match: { 
          paymentMethod: 'card',
          status: 'delivered' // Only count completed orders
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    const codStats = await Order.aggregate([
      { 
        $match: { 
          paymentMethod: 'cod',
          status: 'delivered' // Only count completed orders
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    // Calculate total revenue from all completed orders
    const totalRevenue = await Order.aggregate([
      { 
        $match: { 
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json({
      success: true,
      totalOrders,
      cardOrders,
      codOrders,
      cardAmount: cardStats[0]?.total || 0,
      codAmount: codStats[0]?.total || 0,
      totalAmount: totalRevenue[0]?.total || 0,
      // ...existing stats...
    });
  } catch (error) {
    console.error('Error getting billing stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching billing statistics'
    });
  }
};
