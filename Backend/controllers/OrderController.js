import Order from "../models/Order.js";
import User from "../models/user.js";
import Medicine from "../models/Medicine.js";
import mongoose from "mongoose";
import chalk from "chalk"; // Add this import at the top
import jwt from "jsonwebtoken";
import { sendOrderConfirmation } from '../utils/emailService.js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createOrder = async (req, res) => {
  let currentTry = 0;

  while (currentTry < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { items, totalAmount, shippingAddress, customerEmail } = req.body;
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Verify token and get user ID
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Validate request data
      if (!items?.length || !totalAmount || !shippingAddress) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      // Validate and update stock one by one instead of bulk
      for (const item of items) {
        const medicine = await Medicine.findById(item.medicineId).session(
          session
        );

        if (!medicine) {
          throw new Error(`Medicine not found: ${item.medicineId}`);
        }

        if (medicine.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${medicine.name}`);
        }

        // Update stock individually
        await Medicine.findByIdAndUpdate(
          item.medicineId,
          { $inc: { stock: -item.quantity } },
          { session, new: true }
        );
      }

      // Create order with user ID
      const order = new Order({
        userId,
        items: items.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount,
        shippingAddress,
        status: "pending",
        paymentStatus: "pending",
      });

      await order.save({ session });
      await session.commitTransaction();

      // Send order confirmation email
      await sendOrderConfirmation(customerEmail, {
        orderId: order._id,
        items: items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount,
        shippingAddress,
        paymentMethod: 'card'
      });

      // Log success message
      console.log(chalk.green.bold("\n✨ New Order Created Successfully"));
      console.log(chalk.blue("Order Details:"));
      console.log(chalk.cyan("Order ID:"), chalk.yellow(order._id));
      console.log(
        chalk.cyan("Total Amount:"),
        chalk.yellow(`Rs.${totalAmount}`)
      );
      console.log(chalk.cyan("Items:"), chalk.yellow(items.length));
      console.log(chalk.cyan("Status:"), chalk.yellow("Pending"));
      console.log(
        chalk.cyan("Timestamp:"),
        chalk.yellow(new Date().toLocaleString())
      );
      console.log(chalk.grey("----------------------------------------\n"));

      return res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: order,
      });
    } catch (error) {
      await session.abortTransaction();

      if (
        error.code === 112 || // Write conflict
        error.errorLabels?.includes("TransientTransactionError")
      ) {
        currentTry++;
        if (currentTry < MAX_RETRIES) {
          console.log(`Retrying order creation (attempt ${currentTry + 1})`);
          await sleep(RETRY_DELAY * currentTry); // Exponential backoff
          continue;
        }
      }

      console.error(chalk.red("⚠️ Order Creation Error:"), error);
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create order",
      });
    } finally {
      session.endSession();
    }
  }

  return res.status(500).json({
    success: false,
    message: "Failed to create order after multiple retries",
  });
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await Order.find({ userId })
      .populate("userId", "name email phone") // Include user details
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders",
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.medicineId", "name image manufacturer")
      .sort({ createdAt: -1 });

    res.json(orders || []);
  } catch (error) {
    console.error("Error fetching my orders:", error);
    res.status(500).json({ success: false, message: error.message });
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
      {
        status,
        ...(status === "completed" ? { receivedDate: new Date() } : {}),
      },
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
        status: "completed",
        deliveredAt: new Date(),
        $set: { "tracking.status": "delivered" },
      },
      { new: true }
    );

    // Schedule order deletion after 5 days
    setTimeout(async () => {
      await Order.findByIdAndDelete(orderId);
    }, 5 * 24 * 60 * 60 * 1000); // 5 days in milliseconds

    res.json({
      success: true,
      message: "Order marked as received",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const markOrderAsReceived = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "completed",
        deliveredAt: new Date(),
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order marked as received",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderNotReceived = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: "tracking_required",
        $set: {
          "tracking.status": "investigating",
          "tracking.lastUpdated": new Date(),
        },
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Order marked for tracking",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getBillingStats = async (req, res) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();

    // Get payment method stats
    const cardOrders = await Order.countDocuments({ paymentMethod: "card" });
    const codOrders = await Order.countDocuments({ paymentMethod: "cod" });

    // Calculate amounts by payment method
    const cardStats = await Order.aggregate([
      {
        $match: {
          paymentMethod: "card",
          status: "delivered", // Only count completed orders
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const codStats = await Order.aggregate([
      {
        $match: {
          paymentMethod: "cod",
          status: "delivered", // Only count completed orders
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    // Calculate total revenue from all completed orders
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: "delivered",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
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
    console.error("Error getting billing stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching billing statistics",
    });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await Order.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: error.message,
    });
  }
};
