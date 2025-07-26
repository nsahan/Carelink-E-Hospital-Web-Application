import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

// Add calculateMetrics function
async function calculateMetrics(start, end) {
  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end },
  });

  const metrics = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    ),
    completedOrders: orders.filter((o) => o.status === "completed").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) /
          orders.length
        : 0,
  };

  return metrics;
}

// Add getBusinessMetrics helper function
async function getBusinessMetrics(orders) {
  return {
    totalOrders: orders.length,
    totalRevenue: orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0
    ),
    completedOrders: orders.filter((o) => o.status === "completed").length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    averageOrderValue:
      orders.length > 0
        ? orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0) /
          orders.length
        : 0,
    monthlyRevenue: orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).getMonth();
      acc[month] = (acc[month] || 0) + (order.totalAmount || 0);
      return acc;
    }, Array(12).fill(0)),
  };
}

export const generateBusinessReport = async (req, res) => {
  try {
    const { startDate, endDate, reportType = "summary" } = req.body;
    const start = startDate
      ? new Date(startDate)
      : new Date(new Date().setMonth(new Date().getMonth() - 1));
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch orders and calculate metrics
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("userId");

    const metrics = await getBusinessMetrics(orders);

    const doc = new jsPDF();
    let yPos = 20;

    // 1. Header Section
    addReportHeader(doc, "Business Report", start, end);
    yPos = 50;

    // 2. Summary Section
    yPos = addSummarySection(doc, metrics, yPos);
    yPos += 20;

    // 3. Revenue Analysis
    yPos = addRevenueAnalysis(doc, metrics, yPos);
    yPos += 20;

    // 4. Order Status Distribution
    doc.addPage();
    yPos = 20;
    yPos = addOrderStatusDistribution(doc, metrics, yPos);
    yPos += 20;

    // 5. Detailed Orders Table (if requested)
    if (reportType === "detailed") {
      doc.addPage();
      yPos = 20;
      yPos = addDetailedOrdersTable(doc, orders, yPos);
    }

    // 6. Footer
    addReportFooter(doc);

    // Send response
    const pdfBuffer = doc.output("arraybuffer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=business_report_${format(
        new Date(),
        "yyyy-MM-dd"
      )}.pdf`
    );
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message,
    });
  }
};

// Helper functions for report sections
function addReportHeader(doc, title, startDate, endDate) {
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("CareLink Analytics - " + title, 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(
    `Period: ${format(startDate, "MMM dd, yyyy")} - ${format(
      endDate,
      "MMM dd, yyyy"
    )}`,
    105,
    30,
    { align: "center" }
  );
  doc.setTextColor(0, 0, 0);
}

function addSummarySection(doc, metrics, yPos) {
  doc.setFontSize(18);
  doc.text("Summary Metrics", 20, yPos);
  yPos += 10;

  const summaryData = [
    { label: "Total Orders", value: metrics.totalOrders },
    { label: "Total Revenue", value: `Rs.${metrics.totalRevenue.toFixed(2)}` },
    {
      label: "Average Order Value",
      value: `Rs.${metrics.averageOrderValue.toFixed(2)}`,
    },
    { label: "Completed Orders", value: metrics.completedOrders },
  ];

  summaryData.forEach((item) => {
    yPos += 15;
    doc.setFontSize(12);
    doc.text(`${item.label}:`, 30, yPos);
    doc.text(item.value.toString(), 150, yPos);
  });

  return yPos;
}

function addRevenueAnalysis(doc, metrics, yPos) {
  // ... revenue chart and analysis code ...
  return yPos + 100;
}

function addOrderStatusDistribution(doc, metrics, yPos) {
  // ... order status distribution visualization ...
  return yPos + 100;
}

function addDetailedOrdersTable(doc, orders, yPos) {
  doc.setFontSize(18);
  doc.text("Detailed Orders", 20, yPos);
  yPos += 15;

  const headers = ["Order ID", "Customer", "Amount", "Status", "Date"];
  const headerY = yPos;

  // Table Header
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 10, 170, 15, "F");
  headers.forEach((header, index) => {
    doc.text(header, 25 + index * 35, yPos);
  });

  // Table Rows
  orders.forEach((order, index) => {
    yPos += 15;
    if (yPos > 250) {
      doc.addPage();
      yPos = 40;
    }

    doc.text(`#${order._id.toString().slice(-6)}`, 25, yPos);
    doc.text(order.userId?.name || "Guest", 60, yPos);
    doc.text(`Rs.${order.totalAmount}`, 95, yPos);
    doc.text(order.status, 130, yPos);
    doc.text(format(new Date(order.createdAt), "MM/dd/yyyy"), 165, yPos);
  });

  return yPos;
}

function addReportFooter(doc) {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${i} of ${pageCount} - Generated by CareLink System`,
      105,
      280,
      { align: "center" }
    );
  }
}

// Update getStatusColor function to return valid RGB values
function getStatusColor(status) {
  switch (status) {
    case "COMPLETED":
      return [46, 204, 113]; // Green
    case "PENDING":
      return [241, 196, 15]; // Yellow
    case "CANCELLED":
      return [231, 76, 60]; // Red
    default:
      return [0, 0, 0]; // Black
  }
}

export const generateInventoryReport = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("Inventory Status Report", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 25, {
      align: "center",
    });

    // Inventory summary
    const lowStock = medicines.filter(
      (med) => med.stock <= med.minRequiredStock
    );
    const outOfStock = medicines.filter((med) => med.stock === 0);

    // Update autoTable usage
    autoTable(doc, {
      startY: 35,
      head: [["Category", "Count"]],
      body: [
        ["Total Products", medicines.length],
        ["Low Stock Items", lowStock.length],
        ["Out of Stock", outOfStock.length],
      ],
    });

    // Detailed inventory
    doc.addPage();
    doc.text("Inventory Details", 14, 15);

    doc.autoTable({
      startY: 25,
      head: [["Product Name", "Category", "Stock", "Min Required", "Status"]],
      body: medicines.map((med) => [
        med.name,
        med.category,
        med.stock,
        med.minRequiredStock,
        med.stock <= med.minRequiredStock ? "Low Stock" : "Normal",
      ]),
    });

    const fileName = `inventory_report_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    const pdfBuffer = doc.output("arraybuffer");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    console.error("Error generating inventory report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate inventory report",
      error: error.message,
    });
  }
};

export const generateMedicineReport = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ category: 1, name: 1 });

    // Create new document
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
    const pdfBuffer = doc.output();
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
