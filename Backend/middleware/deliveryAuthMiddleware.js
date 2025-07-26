import jwt from "jsonwebtoken";
import DeliveryPersonnel from "../models/DeliveryPersonnel.js";

// Protect delivery personnel routes
export const protectDelivery = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    console.log("🔐 Delivery Auth Debug:");
    console.log("Headers:", req.headers.authorization ? "Token present" : "No token");
    console.log("Token:", token ? token.substring(0, 20) + "..." : "No token");

    if (!token) {
      console.log("❌ No token provided");
      return res.status(401).json({
        success: false,
        message: "Authentication token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    // Check if user is delivery personnel
    if (decoded.role !== "delivery") {
      console.log("❌ Wrong role:", decoded.role);
      return res.status(403).json({
        success: false,
        message: "Access denied. Delivery personnel only.",
      });
    }

    // Find delivery personnel
    const deliveryPersonnel = await DeliveryPersonnel.findById(decoded.id).select("-password");

    if (!deliveryPersonnel) {
      console.log("❌ Delivery personnel not found");
      return res.status(401).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }

    console.log("✅ Delivery personnel found:", deliveryPersonnel.name);
    console.log("Status:", deliveryPersonnel.status);
    console.log("Is Online:", deliveryPersonnel.isOnline);

    // Check if account is active
    if (deliveryPersonnel.status !== "active") {
      console.log("❌ Account not active");
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please contact admin.",
      });
    }

    req.user = {
      id: deliveryPersonnel._id,
      email: deliveryPersonnel.email,
      role: "delivery",
      employeeId: deliveryPersonnel.employeeId,
      name: deliveryPersonnel.name,
    };

    console.log("✅ Auth successful for:", deliveryPersonnel.name);
    next();
  } catch (error) {
    console.error("❌ Delivery auth error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Verify delivery personnel is online
export const requireOnline = async (req, res, next) => {
  try {
    console.log("🔍 Online Check Debug:");
    console.log("User ID:", req.user.id);
    
    const deliveryPersonnel = await DeliveryPersonnel.findById(req.user.id);
    
    if (!deliveryPersonnel) {
      console.log("❌ Delivery personnel not found in online check");
      return res.status(404).json({
        success: false,
        message: "Delivery personnel not found",
      });
    }
    
    console.log("Delivery personnel found:", deliveryPersonnel.name);
    console.log("Is Online:", deliveryPersonnel.isOnline);
    
    if (!deliveryPersonnel.isOnline) {
      console.log("❌ Delivery personnel not online");
      return res.status(403).json({
        success: false,
        message: "You must be online to perform this action",
      });
    }

    console.log("✅ Online check passed");
    next();
  } catch (error) {
    console.error("❌ Online check error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking online status",
    });
  }
}; 