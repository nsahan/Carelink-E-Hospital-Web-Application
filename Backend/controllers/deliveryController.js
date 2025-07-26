import DeliveryPersonnel from "../models/DeliveryPersonnel.js";
import Order from "../models/Order.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import chalk from "chalk";
import crypto from "crypto";
import { sendDeliveryPersonnelRegistrationEmail } from "../utils/emailService.js";

// Generate temporary password
const generateTemporaryPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

// Register delivery personnel (Admin only)
export const registerDeliveryPersonnel = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      employeeId,
      vehicleNumber,
      vehicleType,
      assignedArea,
    } = req.body;

    // Check if delivery personnel already exists
    const existingPersonnel = await DeliveryPersonnel.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existingPersonnel) {
      return res.status(400).json({
        success: false,
        message: "Delivery personnel with this email or employee ID already exists",
      });
    }

    // Generate temporary password
    const temporaryPassword = generateTemporaryPassword();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(temporaryPassword, salt);

    // Create new delivery personnel
    const deliveryPersonnel = new DeliveryPersonnel({
      name,
      email,
      phone,
      password: hashedPassword,
      employeeId,
      vehicleNumber,
      vehicleType,
      assignedArea,
    });

    await deliveryPersonnel.save();

    // Send registration email with temporary password
    try {
      await sendDeliveryPersonnelRegistrationEmail(email, temporaryPassword, {
        name,
        employeeId,
        vehicleType,
        vehicleNumber,
        assignedArea,
      });
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
      // We'll still return a success response since the personnel was created
    }

    console.log(chalk.green.bold("\n🚚 New Delivery Personnel Registered"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Name:"), chalk.yellow(name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(employeeId));
    console.log(chalk.cyan("Vehicle:"), chalk.yellow(`${vehicleType} - ${vehicleNumber}`));
    console.log(chalk.cyan("Assigned Area:"), chalk.yellow(assignedArea));
    console.log(chalk.cyan("Temporary Password:"), chalk.yellow(temporaryPassword));
    console.log(chalk.grey("----------------------------------------\n"));

    res.status(201).json({
      success: true,
      message: "Delivery personnel registered successfully. Registration email sent.",
      data: {
        _id: deliveryPersonnel._id,
        name: deliveryPersonnel.name,
        email: deliveryPersonnel.email,
        employeeId: deliveryPersonnel.employeeId,
        vehicleNumber: deliveryPersonnel.vehicleNumber,
        vehicleType: deliveryPersonnel.vehicleType,
        assignedArea: deliveryPersonnel.assignedArea,
        status: deliveryPersonnel.status,
      },
    });
  } catch (error) {
    console.error(chalk.red("❌ Delivery Personnel Registration Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to register delivery personnel",
      error: error.message,
    });
  }
};

// Login delivery personnel
export const loginDeliveryPersonnel = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find delivery personnel by email
    const deliveryPersonnel = await DeliveryPersonnel.findOne({ email });

    if (!deliveryPersonnel) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, deliveryPersonnel.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if personnel is active
    if (deliveryPersonnel.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please contact admin.",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: deliveryPersonnel._id,
        email: deliveryPersonnel.email,
        role: "delivery",
        employeeId: deliveryPersonnel.employeeId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update last active
    deliveryPersonnel.lastActive = new Date();
    deliveryPersonnel.isOnline = true;
    await deliveryPersonnel.save();

    console.log(chalk.green.bold("\n🚚 Delivery Personnel Login"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Name:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.cyan("Status:"), chalk.yellow("Online"));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        deliveryPersonnel: {
          _id: deliveryPersonnel._id,
          name: deliveryPersonnel.name,
          email: deliveryPersonnel.email,
          employeeId: deliveryPersonnel.employeeId,
          vehicleNumber: deliveryPersonnel.vehicleNumber,
          vehicleType: deliveryPersonnel.vehicleType,
          assignedArea: deliveryPersonnel.assignedArea,
          status: deliveryPersonnel.status,
          totalDeliveries: deliveryPersonnel.totalDeliveries,
          rating: deliveryPersonnel.rating,
        },
      },
    });
  } catch (error) {
    console.error(chalk.red("❌ Delivery Personnel Login Error:"), error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};

// Get delivery personnel dashboard
export const getDeliveryDashboard = async (req, res) => {
  try {
    const deliveryPersonnelId = req.user.id;

    // Get delivery personnel info
    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    // Get assigned orders for this delivery personnel
    const assignedOrders = await Order.find({
      deliveryPersonnel: deliveryPersonnelId,
      deliveryStatus: { $in: ["assigned", "picked_up", "in_transit"] },
      status: { $in: ["pending", "processing", "shipped"] },
    })
      .populate("userId", "name email phone")
      .populate("items.medicineId", "name")
      .sort({ createdAt: -1 });

    // Get today's completed deliveries
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDeliveries = await Order.find({
      deliveryPersonnel: deliveryPersonnelId,
      deliveryStatus: "delivered",
      completedAt: { $gte: today, $lt: tomorrow },
    }).countDocuments();

    // Get total completed deliveries for this personnel
    const totalDeliveries = await Order.find({
      deliveryPersonnel: deliveryPersonnelId,
      deliveryStatus: "delivered",
    }).countDocuments();

    const dashboardData = {
      deliveryPersonnel: {
        name: deliveryPersonnel.name,
        employeeId: deliveryPersonnel.employeeId,
        vehicleNumber: deliveryPersonnel.vehicleNumber,
        vehicleType: deliveryPersonnel.vehicleType,
        assignedArea: deliveryPersonnel.assignedArea,
        status: deliveryPersonnel.status,
        totalDeliveries: deliveryPersonnel.totalDeliveries,
        rating: deliveryPersonnel.rating,
        isOnline: deliveryPersonnel.isOnline,
      },
      stats: {
        assignedOrders: assignedOrders.length,
        todayDeliveries,
        totalDeliveries,
        pendingDeliveries: assignedOrders.filter(order => 
          order.deliveryStatus === "assigned" || order.deliveryStatus === "picked_up"
        ).length,
      },
      assignedOrders,
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error(chalk.red("❌ Delivery Dashboard Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// Mark order as delivered (by delivery personnel)
export const markOrderAsDelivered = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPersonnelId = req.user.id;

    console.log(chalk.blue("🔍 Mark Order as Delivered - Debug Info:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("Delivery Personnel ID:"), chalk.yellow(deliveryPersonnelId));
    console.log(chalk.cyan("Request User:"), chalk.yellow(JSON.stringify(req.user, null, 2)));

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(chalk.red("❌ Order not found"));
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    console.log(chalk.cyan("Order found:"), chalk.yellow(order._id));
    console.log(chalk.cyan("Order delivery personnel:"), chalk.yellow(order.deliveryPersonnel));
    console.log(chalk.cyan("Order delivery status:"), chalk.yellow(order.deliveryStatus));
    console.log(chalk.cyan("Order status:"), chalk.yellow(order.status));
    console.log(chalk.cyan("Delivery Personnel ID type:"), chalk.yellow(typeof deliveryPersonnelId));
    console.log(chalk.cyan("Order delivery personnel type:"), chalk.yellow(typeof order.deliveryPersonnel));

    // Check if order is assigned to this delivery personnel
    if (!order.deliveryPersonnel) {
      console.log(chalk.red("❌ Order has no delivery personnel assigned"));
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to any delivery personnel",
      });
    }

    // Convert both to strings for comparison
    const orderDeliveryPersonnelId = order.deliveryPersonnel.toString();
    const currentDeliveryPersonnelId = deliveryPersonnelId.toString();

    console.log(chalk.cyan("Order delivery personnel ID (string):"), chalk.yellow(orderDeliveryPersonnelId));
    console.log(chalk.cyan("Current delivery personnel ID (string):"), chalk.yellow(currentDeliveryPersonnelId));
    console.log(chalk.cyan("IDs match:"), chalk.yellow(orderDeliveryPersonnelId === currentDeliveryPersonnelId));

    if (orderDeliveryPersonnelId !== currentDeliveryPersonnelId) {
      console.log(chalk.red("❌ Order not assigned to this delivery personnel"));
      console.log(chalk.red("Expected:"), chalk.yellow(orderDeliveryPersonnelId));
      console.log(chalk.red("Got:"), chalk.yellow(currentDeliveryPersonnelId));
      return res.status(403).json({
        success: false,
        message: "This order is not assigned to you",
      });
    }

    // Check if order is in deliverable state
    if (!["assigned", "picked_up", "in_transit"].includes(order.deliveryStatus)) {
      console.log(chalk.red("❌ Order not in deliverable state"));
      console.log(chalk.red("Current delivery status:"), chalk.yellow(order.deliveryStatus));
      return res.status(400).json({
        success: false,
        message: "Order is not ready for delivery. Current status: " + order.deliveryStatus,
      });
    }

    // Check if delivery personnel is online
    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      console.log(chalk.red("❌ Delivery personnel not found"));
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    console.log(chalk.cyan("Delivery personnel found:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Is online:"), chalk.yellow(deliveryPersonnel.isOnline));

    if (!deliveryPersonnel.isOnline) {
      console.log(chalk.red("❌ Delivery personnel not online"));
      return res.status(403).json({
        success: false,
        message: "You must be online to mark orders as delivered",
      });
    }

    // Update order status
    order.status = "completed";
    order.deliveryStatus = "delivered";
    order.completedAt = new Date();
    order.deliveryStatusUpdatedAt = new Date();

    await order.save();

    // Update delivery personnel stats
    if (deliveryPersonnel) {
      deliveryPersonnel.totalDeliveries += 1;
      await deliveryPersonnel.save();
    }

    console.log(chalk.green.bold("\n✅ Order Delivered Successfully"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("Delivery Personnel:"), chalk.yellow(deliveryPersonnel?.name || "Unknown"));
    console.log(chalk.cyan("Customer:"), chalk.yellow(order.customerDetails?.fullName || "Unknown"));
    console.log(chalk.cyan("Amount:"), chalk.yellow(`Rs.${order.totalAmount}`));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Order marked as delivered successfully",
      data: order,
    });
  } catch (error) {
    console.error(chalk.red("❌ Order Delivery Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to mark order as delivered",
      error: error.message,
    });
  }
};

// Update delivery personnel location
export const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const deliveryPersonnelId = req.user.id;

    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    deliveryPersonnel.currentLocation = {
      type: "Point",
      coordinates: [longitude, latitude],
    };
    deliveryPersonnel.lastActive = new Date();

    await deliveryPersonnel.save();

    res.json({
      success: true,
      message: "Location updated successfully",
    });
  } catch (error) {
    console.error(chalk.red("❌ Location Update Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to update location",
      error: error.message,
    });
  }
};

// Get all delivery personnel (Admin only)
export const getAllDeliveryPersonnel = async (req, res) => {
  try {
    const deliveryPersonnel = await DeliveryPersonnel.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: deliveryPersonnel,
    });
  } catch (error) {
    console.error(chalk.red("❌ Get Delivery Personnel Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery personnel",
      error: error.message,
    });
  }
};

// Update delivery personnel status (Admin only)
export const updateDeliveryPersonnelStatus = async (req, res) => {
  try {
    const { personnelId } = req.params;
    const { status } = req.body;

    const deliveryPersonnel = await DeliveryPersonnel.findByIdAndUpdate(
      personnelId,
      { status },
      { new: true }
    ).select("-password");

    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    res.json({
      success: true,
      message: "Delivery personnel status updated successfully",
      data: deliveryPersonnel,
    });
  } catch (error) {
    console.error(chalk.red("❌ Update Status Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message,
    });
  }
};

// Logout delivery personnel
export const logoutDeliveryPersonnel = async (req, res) => {
  try {
    const deliveryPersonnelId = req.user.id;

    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (deliveryPersonnel) {
      deliveryPersonnel.isOnline = false;
      deliveryPersonnel.lastActive = new Date();
      await deliveryPersonnel.save();
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error(chalk.red("❌ Logout Error:"), error);
    res.status(500).json({
      success: false,
      message: "Logout failed",
      error: error.message,
    });
  }
}; 

// Go online (delivery personnel)
export const goOnline = async (req, res) => {
  try {
    const deliveryPersonnelId = req.user.id;

    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    deliveryPersonnel.isOnline = true;
    deliveryPersonnel.lastActive = new Date();
    await deliveryPersonnel.save();

    console.log(chalk.green.bold("\n🟢 Delivery Personnel Online"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Name:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "You are now online",
      data: {
        isOnline: true,
        lastActive: deliveryPersonnel.lastActive,
      },
    });
  } catch (error) {
    console.error(chalk.red("❌ Go Online Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to go online",
      error: error.message,
    });
  }
};

// Go offline (delivery personnel)
export const goOffline = async (req, res) => {
  try {
    const deliveryPersonnelId = req.user.id;

    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    deliveryPersonnel.isOnline = false;
    deliveryPersonnel.lastActive = new Date();
    await deliveryPersonnel.save();

    console.log(chalk.yellow.bold("\n🔴 Delivery Personnel Offline"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Name:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "You are now offline",
      data: {
        isOnline: false,
        lastActive: deliveryPersonnel.lastActive,
      },
    });
  } catch (error) {
    console.error(chalk.red("❌ Go Offline Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to go offline",
      error: error.message,
    });
  }
}; 

// Get all orders for debugging (Admin only)
export const getAllOrdersForDebug = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("deliveryPersonnel", "name employeeId")
      .select("_id totalAmount status deliveryStatus deliveryPersonnel createdAt")
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(chalk.blue.bold("\n📦 Orders Debug Info:"));
    orders.forEach(order => {
      console.log(chalk.cyan("Order ID:"), chalk.yellow(order._id.slice(-8)));
      console.log(chalk.cyan("Status:"), chalk.yellow(order.status));
      console.log(chalk.cyan("Delivery Status:"), chalk.yellow(order.deliveryStatus || "Not set"));
      console.log(chalk.cyan("Delivery Personnel:"), chalk.yellow(order.deliveryPersonnel?.name || "Not assigned"));
      console.log(chalk.cyan("Customer:"), chalk.yellow(order.userId?.name || "Unknown"));
      console.log(chalk.grey("---"));
    });

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(chalk.red("❌ Get Orders Debug Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to get orders",
      error: error.message,
    });
  }
}; 

// Get delivery personnel info for debugging
export const getDeliveryPersonnelInfo = async (req, res) => {
  try {
    const deliveryPersonnel = await DeliveryPersonnel.find()
      .select("_id name email employeeId status isOnline")
      .sort({ createdAt: -1 });

    console.log(chalk.blue.bold("\n🚚 Delivery Personnel Info:"));
    deliveryPersonnel.forEach(personnel => {
      console.log(chalk.cyan("ID:"), chalk.yellow(personnel._id));
      console.log(chalk.cyan("Name:"), chalk.yellow(personnel.name));
      console.log(chalk.cyan("Employee ID:"), chalk.yellow(personnel.employeeId));
      console.log(chalk.cyan("Status:"), chalk.yellow(personnel.status));
      console.log(chalk.cyan("Online:"), chalk.yellow(personnel.isOnline));
      console.log(chalk.grey("---"));
    });

    res.json({
      success: true,
      data: deliveryPersonnel,
    });
  } catch (error) {
    console.error(chalk.red("❌ Get Delivery Personnel Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to get delivery personnel",
      error: error.message,
    });
  }
}; 

// Assign order to current delivery personnel (for testing)
export const assignOrderToSelf = async (req, res) => {
  try {
    const { orderId } = req.params;
    const deliveryPersonnelId = req.user.id;

    console.log(chalk.blue("🔍 Assign Order to Self - Debug Info:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("Delivery Personnel ID:"), chalk.yellow(deliveryPersonnelId));

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.log(chalk.red("❌ Order not found"));
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Find the delivery personnel
    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);
    if (!deliveryPersonnel) {
      console.log(chalk.red("❌ Delivery personnel not found"));
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    // Update order with delivery personnel assignment
    order.deliveryPersonnel = deliveryPersonnelId;
    order.deliveryStatus = "assigned";
    order.deliveryStatusUpdatedAt = new Date();

    await order.save();

    console.log(chalk.green.bold("\n✅ Order Assigned to Self"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Order ID:"), chalk.yellow(orderId));
    console.log(chalk.cyan("Delivery Personnel:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Order assigned to you successfully",
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
    console.error(chalk.red("❌ Order Self-Assignment Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to assign order to self",
      error: error.message,
    });
  }
}; 

// Change password for delivery personnel
export const changeDeliveryPassword = async (req, res) => {
  try {
    console.log("🔐 Change Password Debug:");
    console.log("Request body:", req.body);
    console.log("User from middleware:", req.user);
    
    const { currentPassword, newPassword } = req.body;
    const deliveryPersonnelId = req.user.id; // From middleware

    console.log("Current password provided:", !!currentPassword);
    console.log("New password provided:", !!newPassword);
    console.log("Delivery personnel ID:", deliveryPersonnelId);

    // Find delivery personnel
    const deliveryPersonnel = await DeliveryPersonnel.findById(deliveryPersonnelId);

    if (!deliveryPersonnel) {
      console.log("❌ Delivery personnel not found");
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    console.log("✅ Delivery personnel found:", deliveryPersonnel.name);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, deliveryPersonnel.password);

    console.log("Current password valid:", isCurrentPasswordValid);

    if (!isCurrentPasswordValid) {
      console.log("❌ Current password is incorrect");
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      console.log("❌ New password validation failed");
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    deliveryPersonnel.password = hashedNewPassword;
    await deliveryPersonnel.save();

    console.log(chalk.green.bold("\n🔐 Delivery Personnel Password Changed"));
    console.log(chalk.blue("Details:"));
    console.log(chalk.cyan("Name:"), chalk.yellow(deliveryPersonnel.name));
    console.log(chalk.cyan("Employee ID:"), chalk.yellow(deliveryPersonnel.employeeId));
    console.log(chalk.grey("----------------------------------------\n"));

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(chalk.red("❌ Change Password Error:"), error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
}; 