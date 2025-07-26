import Order from "../models/Order.js";
import User from "../models/user.js";
import Medicine from "../models/Medicine.js";
import ReorderRequest from "../models/ReorderRequest.js";
import DeliveryPersonnel from "../models/DeliveryPersonnel.js";
import mongoose from "mongoose";
import chalk from "chalk"; // Add this import at the top
import jwt from "jsonwebtoken";
import { sendOrderConfirmation } from "../utils/emailService.js";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const createOrder = async (req, res) => {
  let currentTry = 0;

  // Input validation
  const { items, totalAmount, shippingAddress, customerDetails } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item",
    });
  }

  if (!totalAmount || totalAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid total amount",
    });
  }

  if (!shippingAddress) {
    return res.status(400).json({
      success: false,
      message: "Shipping address is required",
    });
  }

  if (!customerDetails || !customerDetails.email || !customerDetails.fullName) {
    return res.status(400).json({
      success: false,
      message: "Customer details (email and full name) are required",
    });
  }

  while (currentTry < MAX_RETRIES) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Verify token and get user data
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Check and update stock for all items
      for (const item of items) {
        if (!item.medicineId || !item.quantity || item.quantity <= 0) {
          throw new Error("Invalid item data");
        }

        const medicine = await Medicine.findById(item.medicineId);
        if (!medicine) {
          throw new Error(`Medicine not found: ${item.medicineId}`);
        }
        if (medicine.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}, Requested: ${item.quantity}`
          );
        }

        // Decrease stock
        medicine.stock -= item.quantity;
        await medicine.save({ session });

        // Check if reorder level is reached
        if (medicine.stock <= medicine.reorderLevel && medicine.autoReorder) {
          // Create reorder request
          await createReorderRequest(
            medicine._id,
            medicine.reorderQuantity,
            session
          );
        }
      }

      // Create order
      const order = new Order({
        userId,
        items: items.map((item) => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
        })),
        totalAmount,
        shippingAddress,
        status: "pending",
        paymentStatus: "pending",
        customerDetails: {
          fullName: customerDetails.fullName,
          email: customerDetails.email,
          phone: customerDetails.phone,
        },
      });

      await order.save({ session });
      await session.commitTransaction();

      // Send confirmation email
      try {
        await sendOrderConfirmation(customerDetails.email, {
          orderId: order._id,
          items,
          totalAmount,
          shippingAddress,
          paymentMethod: req.body.paymentMethod || "card",
        });
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
        // Don't fail the order creation if email fails
      }

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

      // Handle specific error types
      if (error.message.includes("Insufficient stock")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("Medicine not found")) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      if (error.message.includes("Invalid item data")) {
        return res.status(400).json({
          success: false,
          message: "Invalid item data provided",
        });
      }

      // Check for MongoDB write conflicts and transient errors
      const isWriteConflict =
        error.code === 112 ||
        error.codeName === "WriteConflict" ||
        error.errorLabels?.includes("TransientTransactionError") ||
        error.message.includes("Write conflict");

      if (isWriteConflict) {
        currentTry++;
        if (currentTry < MAX_RETRIES) {
          console.log(
            chalk.yellow(
              `⚠️ Write conflict detected. Retrying order creation (attempt ${
                currentTry + 1
              }/${MAX_RETRIES})`
            )
          );
          await sleep(RETRY_DELAY * currentTry); // Exponential backoff
          continue;
        } else {
          console.error(
            chalk.red(
              "❌ Failed to create order after maximum retries due to write conflicts"
            )
          );
          return res.status(500).json({
            success: false,
            message:
              "Order creation failed due to high system load. Please try again.",
          });
        }
      }

      // For other errors, log and return
      console.error(chalk.red("⚠️ Order Creation Error:"), error);
      return res.status(500).json({
        success: false,
        message: "Failed to create order. Please try again.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
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
    const { userId } = req.params;

    const orders = await Order.find({ userId })
      .populate({
        path: "items.medicineId",
        select: "name price description", // Add any other medicine fields you need
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      .populate({
        path: "userId",
        select: "name email phone", // Add this to get user details
      })
      .populate("items.medicineId")
      .populate({
        path: "deliveryPersonnel",
        select: "name employeeId vehicleType vehicleNumber assignedArea isOnline totalDeliveries"
      })
      .sort({ createdAt: -1 });

    // Transform orders to include customer details from userId
    const transformedOrders = orders.map((order) => ({
      ...order._doc,
      customerDetails: {
        fullName:
          order.userId?.name || order.customerDetails?.fullName || "N/A",
        email: order.userId?.email || order.customerDetails?.email || "N/A",
        phone: order.userId?.phone || order.customerDetails?.phone || "N/A",
      },
    }));

    console.log(`Found ${orders.length} orders`);

    res.status(200).json(transformedOrders);
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

// Helper function to create reorder request
async function createReorderRequest(medicineId, quantity, session) {
  try {
    const reorderRequest = new ReorderRequest({
      medicineId,
      quantity,
      status: "pending",
      createdAt: new Date(),
    });
    await reorderRequest.save({ session });
    console.log(
      chalk.blue(`📋 Reorder request created for medicine: ${medicineId}`)
    );
  } catch (error) {
    console.error(chalk.red("❌ Failed to create reorder request:"), error);
    // Don't throw error as it shouldn't fail the order creation
  }
}

// ...existing tracking functions...
export const updateOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, location, message } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Add new tracking update
    order.tracking.status = status;
    order.tracking.location = location;
    order.tracking.lastUpdated = new Date();
    order.tracking.updates.push({
      status,
      location,
      message,
      timestamp: new Date(),
    });

    // Update estimated delivery based on status
    if (status === "shipped") {
      order.tracking.estimatedDelivery = new Date(
        Date.now() + 2 * 24 * 60 * 60 * 1000
      ); // 2 days from now
    }

    await order.save();

    res.json({
      success: true,
      message: "Order tracking updated successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error updating tracking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update tracking",
    });
  }
};

export const getOrderTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).select(
      "tracking customerDetails shippingAddress createdAt totalAmount"
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
    console.error("Error fetching tracking:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tracking info",
    });
  }
};

export const generateMedicineReport = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ category: 1, name: 1 });

    const doc = new jsPDF();
    let yPos = 20;

    // Add Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text("Medicine Inventory Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), "PPpp")}`, 105, 30, {
      align: "center",
    });
    yPos = 50;

    // Add Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Inventory Summary", 14, yPos);
    yPos += 10;

    const summary = {
      totalMedicines: medicines.length,
      lowStock: medicines.filter((m) => m.stock <= m.reorderLevel).length,
      outOfStock: medicines.filter((m) => m.stock === 0).length,
      categories: [...new Set(medicines.map((m) => m.category))].length,
    };

    doc.setFontSize(12);
    doc.text(`Total Medicines: ${summary.totalMedicines}`, 20, yPos);
    doc.text(`Low Stock Items: ${summary.lowStock}`, 90, yPos);
    doc.text(`Out of Stock: ${summary.outOfStock}`, 160, yPos);
    yPos += 10;
    doc.text(`Total Categories: ${summary.categories}`, 20, yPos);
    yPos += 20;

    // Add Table Headers
    const headers = ["Name", "Category", "Stock", "Price", "Status"];
    const columnWidths = [60, 40, 30, 30, 30];

    doc.setFillColor(240, 240, 240);
    doc.rect(10, yPos - 5, 190, 10, "F");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);

    let xPos = 10;
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos);
      xPos += columnWidths[i];
    });
    yPos += 10;

    // Add Table Data
    doc.setFontSize(9);
    medicines.forEach((medicine) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }

      const status =
        medicine.stock <= medicine.reorderLevel
          ? medicine.stock === 0
            ? "Out of Stock"
            : "Low Stock"
          : "In Stock";

      xPos = 10;
      doc.text(medicine.name.substring(0, 35), xPos, yPos);
      doc.text(medicine.category || "N/A", xPos + 60, yPos);
      doc.text(medicine.stock.toString(), xPos + 100, yPos);
      doc.text(`Rs.${medicine.price}`, xPos + 130, yPos);
      doc.text(status, xPos + 160, yPos);

      yPos += 7;
    });

    // Add Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount} - Generated by CareLink System`,
        105,
        290,
        { align: "center" }
      );
    }

    // Send response
    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=medicine_report_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating medicine report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate medicine report",
      error: error.message,
    });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    // FIX: Support both req.user._id and req.user.id for userId
    const userId = req.user._id || req.user.id;

    // Find the order and verify it belongs to the user
    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message:
          "Order not found or you are not authorized to cancel this order",
      });
    }

    // Check if order can be cancelled
    const cancelableStatuses = ["pending", "processing"];
    if (!cancelableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled. Current status: ${order.status}`,
      });
    }

    // Update order status to cancelled
    order.status = "cancelled";
    order.cancellationReason = req.body.reason || "User requested cancellation";
    order.cancelledAt = new Date();

    await order.save();

    // Optionally, restore medicine stock
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { stock: item.quantity },
      });
    }

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

// Delivery Service Methods

export const assignDeliveryPersonnel = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonnelId } = req.body;

    if (!deliveryPersonnelId) {
      return res.status(400).json({
        success: false,
        message: "Delivery personnel ID is required",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the delivery personnel
    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    // Check if delivery personnel is active
    if (deliveryPersonnel.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: "Delivery personnel is not active",
      });
    }

    // Update order with delivery personnel
    order.deliveryPersonnel = deliveryPersonnelId;
    order.deliveryStatus = 'assigned';
    order.assignedAt = new Date();

    await order.save();

    // Update delivery personnel's total deliveries
    await DeliveryPersonnel.findByIdAndUpdate(deliveryPersonnelId, {
      $inc: { totalDeliveries: 1 }
    });

    console.log(chalk.green.bold("\n🚚 Delivery Personnel Assigned Successfully"));
    console.log(chalk.blue("Assignment Details:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("Delivery Personnel:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.cyan("Vehicle:"), chalk.yellow(`${deliveryPersonnel.vehicleType} - ${deliveryPersonnel.vehicleNumber}`));
    console.log(chalk.cyan("Assigned Area:"), chalk.yellow(deliveryPersonnel.assignedArea));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Delivery personnel assigned successfully",
      deliveryPersonnel: {
        _id: deliveryPersonnel._id,
        name: deliveryPersonnel.name,
        employeeId: deliveryPersonnel.employeeId,
        vehicleType: deliveryPersonnel.vehicleType,
        vehicleNumber: deliveryPersonnel.vehicleNumber,
        assignedArea: deliveryPersonnel.assignedArea,
        isOnline: deliveryPersonnel.isOnline,
        totalDeliveries: deliveryPersonnel.totalDeliveries
      }
    });
  } catch (error) {
    console.error("Error assigning delivery personnel:", error);
    res.status(500).json({
      success: false,
      message: "Failed to assign delivery personnel",
      error: error.message,
    });
  }
};

export const updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryStatus } = req.body;

    if (!deliveryStatus) {
      return res.status(400).json({
        success: false,
        message: "Delivery status is required",
      });
    }

    // Validate delivery status
    const validStatuses = ['assigned', 'picked_up', 'in_transit', 'delivered'];
    if (!validStatuses.includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid delivery status",
      });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Check if delivery personnel is assigned
    if (!order.deliveryPersonnel) {
      return res.status(400).json({
        success: false,
        message: "No delivery personnel assigned to this order",
      });
    }

    // Update delivery status
    order.deliveryStatus = deliveryStatus;
    order.deliveryStatusUpdatedAt = new Date();

    // If delivered, update order status to completed
    if (deliveryStatus === 'delivered') {
      order.status = 'completed';
      order.completedAt = new Date();
    }

    await order.save();

    console.log(chalk.green.bold("\n📦 Delivery Status Updated"));
    console.log(chalk.blue("Status Update Details:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("New Status:"), chalk.yellow(deliveryStatus));
    console.log(chalk.cyan("Updated At:"), chalk.yellow(new Date().toLocaleString()));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Delivery status updated successfully",
      deliveryStatus: deliveryStatus,
      orderStatus: order.status
    });
  } catch (error) {
    console.error("Error updating delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update delivery status",
      error: error.message,
    });
  }
};

export const getDeliveryInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Find the order with delivery personnel details
    const order = await Order.findById(orderId)
      .populate('deliveryPersonnel', 'name employeeId vehicleType vehicleNumber assignedArea isOnline totalDeliveries');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: {
        orderId: order._id,
        deliveryPersonnel: order.deliveryPersonnel,
        deliveryStatus: order.deliveryStatus,
        assignedAt: order.assignedAt,
        deliveryStatusUpdatedAt: order.deliveryStatusUpdatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching delivery info:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery information",
      error: error.message,
    });
  }
};

// Assign order to delivery personnel (Admin only)
export const assignOrderToDelivery = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { deliveryPersonnelId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the delivery personnel
    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    // Check if delivery personnel is active
    if (deliveryPersonnel.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Delivery personnel is not active",
      });
    }

    // Update order with delivery personnel assignment
    order.deliveryPersonnel = deliveryPersonnelId;
    order.deliveryStatus = "assigned";
    order.deliveryStatusUpdatedAt = new Date();

    await order.save();

    console.log(chalk.green.bold("\n📦 Order Assigned to Delivery"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("Delivery Personnel:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Order assigned to delivery personnel successfully",
      data: {
        orderId: order._id,
        deliveryPersonnel: {
          _id: deliveryPersonnel._id,
          name: deliveryPersonnel.name,
          employeeId: deliveryPersonnel.employeeId,
        },
        deliveryStatus: order.deliveryStatus,
      },
    });
  } catch (error) {
    console.error(chalk.red("❌ Order Assignment Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to assign order to delivery personnel",
      error: error.message,
    });
  }
};
