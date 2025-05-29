import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

export const sendSupplierNotification = async (medicines) => {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">⚠️ Urgent: Low Stock Alert</h2>
        <p>The following medicines need immediate restocking:</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead style="background-color: #f8f9fa;">
            <tr>
              <th style="padding: 12px; border: 1px solid #dee2e6;">Medicine Name</th>
              <th style="padding: 12px; border: 1px solid #dee2e6;">Current Stock</th>
              <th style="padding: 12px; border: 1px solid #dee2e6;">Required Quantity</th>
              <th style="padding: 12px; border: 1px solid #dee2e6;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${medicines
              .map((med) => {
                // Generate approval token
                const token = jwt.sign(
                  { medicineId: med.id, action: "restock" },
                  process.env.JWT_SECRET,
                  { expiresIn: "24h" }
                );

                const approvalUrl = `${process.env.BASE_URL}/v1/api/medicines/restock/approve/${med.id}/${token}`;

                return `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${
                      med.name
                    }</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6; color: ${
                      med.stock <= 3 ? "#dc3545" : "#ffc107"
                    }">${med.stock}</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">${
                      med.reorderQuantity || 50
                    }</td>
                    <td style="padding: 12px; border: 1px solid #dee2e6;">
                      <a href="${approvalUrl}" 
                         style="background-color: #28a745; color: white; padding: 8px 16px; text-decoration: none; border-radius: 5px;">
                        Approve Restock
                      </a>
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
        <p style="margin-top: 20px; color: #666;">
          Click the "Approve Restock" button for each medicine to authorize the restock.
          These links will expire in 24 hours.
        </p>
      </div>
    `;

    await sendEmail({
      to: process.env.SUPPLIER_EMAIL,
      subject: "🚨 Urgent: Low Stock Alert - Immediate Action Required",
      html: emailContent,
    });

    return true;
  } catch (error) {
    console.error("Failed to send supplier notification:", error);
    throw error;
  }
};

export const sendAppointmentConfirmation = async (
  userEmail,
  appointmentDetails
) => {
  const {
    doctorName,
    date,
    time,
    location = "Main Hospital Branch",
  } = appointmentDetails;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; text-align: center;">Appointment Confirmation</h2>
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-bottom: 15px;">Dear Patient,</h3>
        <p style="color: #475569;">Your appointment has been successfully scheduled!</p>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(
            date
          ).toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${location}</p>
        </div>
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
          <p style="color: #475569; margin: 0;">Please arrive 15 minutes before your scheduled appointment time.</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b;">
        <p>If you need to reschedule or cancel your appointment, please do so at least 24 hours in advance.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Appointment Confirmation - CareLink Hospital",
    html: emailTemplate,
  });
};

export const sendAppointmentReminder = async (
  userEmail,
  appointmentDetails
) => {
  const {
    doctorName,
    date,
    time,
    location = "Main Hospital Branch",
  } = appointmentDetails;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #dc2626; text-align: center;">Appointment Reminder</h2>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-bottom: 15px;">Dear Patient,</h3>
        <p style="color: #475569;">This is a reminder for your upcoming appointment tomorrow!</p>
        <div style="margin: 20px 0;">
          <p style="margin: 10px 0;"><strong>Doctor:</strong> ${doctorName}</p>
          <p style="margin: 10px 0;"><strong>Date:</strong> ${new Date(
            date
          ).toLocaleDateString()}</p>
          <p style="margin: 10px 0;"><strong>Time:</strong> ${time}</p>
          <p style="margin: 10px 0;"><strong>Location:</strong> ${location}</p>
        </div>
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p style="color: #475569; margin: 0;">Please arrive 15 minutes before your scheduled appointment time.</p>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #64748b;">
        <p>If you need to reschedule or cancel your appointment, please do so immediately.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: "Appointment Reminder - Tomorrow - CareLink Hospital",
    html: emailTemplate,
  });
};

export const sendReturnNotification = async (medicines) => {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Medicine Return Notification</h2>
      <p>The following medicines are being returned:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f3f4f6;">
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Medicine Name</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Return Quantity</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Reason</th>
          </tr>
        </thead>
        <tbody>
          ${medicines
            .map(
              (med) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.name}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.returnQuantity}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${med.reason}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;

  return sendEmail({
    to: process.env.SUPPLIER_EMAIL,
    subject: "Medicine Return Notification",
    html: emailContent,
  });
};

export const sendReorderNotification = async (medicines) => {
  const emailContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #2563eb;">Automatic Reorder Notification</h2>
      <p>The following medicines have reached their reorder level and need to be restocked:</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead style="background-color: #f3f4f6;">
          <tr>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Medicine Name</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Current Stock</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Reorder Quantity</th>
            <th style="padding: 12px; border: 1px solid #e5e7eb;">Priority Level</th>
          </tr>
        </thead>
        <tbody>
          ${medicines
            .map(
              (med) => `
            <tr>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${
                med.name
              }</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb; ${
                med.stock <= 3
                  ? "color: #dc2626; font-weight: bold;"
                  : "color: #f59e0b;"
              }">${med.stock}</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">${
                med.reorderQuantity
              }</td>
              <td style="padding: 12px; border: 1px solid #e5e7eb;">
                ${
                  med.stock <= 3
                    ? '<span style="color: #dc2626; font-weight: bold;">URGENT</span>'
                    : '<span style="color: #f59e0b;">Standard</span>'
                }
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <div style="margin-top: 20px; padding: 15px; background-color: #f3f4f6; border-radius: 5px;">
        <p style="margin: 0; color: #4b5563;">
          <strong>Note:</strong> This is an automated reorder request. Please process these orders as soon as possible.
        </p>
      </div>
      <div style="margin-top: 20px; text-align: center;">
        <p style="color: #6b7280;">
          Generated by CareLink Hospital Inventory Management System<br>
          ${new Date().toLocaleString()}
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: process.env.SUPPLIER_EMAIL,
    subject: "🔄 Automatic Reorder Request - Medicine Stock Alert",
    html: emailContent,
  });
};

export const sendSupplierEmail = async (medicine) => {
  const restockUrl = `${process.env.baseUrl}/v1/api/medicines/restock/approve/${medicine._id}`;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #dc3545; margin: 0;">⚠️ Low Stock Alert!</h2>
      </div>
      <div style="background-color: white; padding: 20px; border-radius: 10px; border: 1px solid #dee2e6;">
        <h3 style="color: #0d6efd; margin-top: 0;">Medicine Stock Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
            <strong>Medicine Name:</strong> ${medicine.name}
          </li>
          <li style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
            <strong>Current Stock:</strong> 
            <span style="color: #dc3545; font-weight: bold;">${medicine.stock} units</span>
          </li>
          <li style="padding: 10px 0; border-bottom: 1px solid #dee2e6;">
            <strong>Required Restock:</strong> 50 units
          </li>
          <li style="padding: 10px 0;">
            <strong>Category:</strong> ${medicine.category}
          </li>
        </ul>
        <div style="margin-top: 30px; text-align: center;">
          <a href="${restockUrl}" 
             style="background-color: #0d6efd; color: white; padding: 12px 25px; 
                    text-decoration: none; border-radius: 5px; font-weight: bold;">
            Approve Restock (50 units)
          </a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: "jayarathnasahan257@gmail.com",
    subject: `🚨 Low Stock Alert: ${medicine.name}`,
    html: emailTemplate,
  });
};

import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";

export const checkAndSendReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const appointments = await Appointment.find({
      date: {
        $gte: tomorrow,
        $lt: dayAfterTomorrow,
      },
      status: "confirmed",
    })
      .populate("userId")
      .populate("doctorId");

    for (const appointment of appointments) {
      await sendAppointmentReminder(appointment.userId.email, {
        doctorName: appointment.doctorId.name,
        date: appointment.date,
        time: appointment.time,
        location: appointment.doctorId.location,
      });
    }

    console.log(`Sent reminders for ${appointments.length} appointments`);
  } catch (error) {
    console.error("Error sending reminders:", error);
  }
};

export const sendOrderConfirmation = async (userEmail, orderDetails) => {
  const { orderId, items, totalAmount, shippingAddress, paymentMethod } = orderDetails;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; text-align: center;">Order Confirmation</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b;">Thank you for your order!</h3>
        <p>Order ID: #${orderId}</p>
        
        <div style="margin: 20px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; padding: 20px 0;">
          <h4>Order Details:</h4>
          ${items.map(item => `
            <div style="display: flex; justify-content: space-between; margin: 10px 0;">
              <span>${item.name} x ${item.quantity}</span>
              <span>Rs.${item.price * item.quantity}</span>
            </div>
          `).join('')}
          <div style="margin-top: 15px; font-weight: bold;">
            <div style="display: flex; justify-content: space-between;">
              <span>Total Amount:</span>
              <span>Rs.${totalAmount}</span>
            </div>
          </div>
        </div>
        
        <div style="margin-top: 20px;">
          <h4>Shipping Address:</h4>
          <p>${shippingAddress}</p>
          
          <h4>Payment Method:</h4>
          <p>${paymentMethod}</p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #64748b;">
        <p>You will receive shipping updates once your order is dispatched.</p>
        <p>For any queries, please contact our support team.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Order Confirmation - #${orderId}`,
    html: emailTemplate
  });
};

export const sendShippingUpdate = async (userEmail, shippingDetails) => {
  const { orderId, trackingNumber, estimatedDelivery, carrierName } = shippingDetails;

  const emailTemplate = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2563eb; text-align: center;">Your Order Has Been Shipped!</h2>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e293b;">Shipping Details</h3>
        <div style="margin: 20px 0;">
          <p><strong>Order ID:</strong> #${orderId}</p>
          <p><strong>Carrier:</strong> ${carrierName}</p>
          <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
          <p><strong>Estimated Delivery:</strong> ${new Date(estimatedDelivery).toLocaleDateString()}</p>
        </div>
        
        <div style="background-color: #fff; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0;">Track Your Order</h4>
          <p style="margin: 0;">You can track your order status by clicking the button below:</p>
          <a href="${process.env.FRONTEND_URL}/orders/${orderId}" 
             style="display: inline-block; margin-top: 15px; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
            Track Order
          </a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #64748b;">
        <p>Questions about your order? Contact our support team.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: userEmail,
    subject: `Your Order #${orderId} Has Been Shipped!`,
    html: emailTemplate
  });
};
