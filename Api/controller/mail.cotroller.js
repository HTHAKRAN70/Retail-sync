import express from "express";
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import retailer from "../models/retailer.js";
import { errorHandler } from '../Utils/error.js';
import { customAlphabet } from "nanoid";
import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs";
import { jsPDF } from "jspdf";
import Cart from '../models/Cart.js';
import autoTable from "jspdf-autotable";


const generateId = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp.toString();
  };
const generateInvoicePDF = async (orderDetails) => {
    // console.log("order details",orderDetails);
    const doc = new jsPDF();
  
    // Title
    doc.setFontSize(18);
    doc.text("Invoice", 14, 20);
  
    // Customer and Order Details
    doc.setFontSize(12);
    doc.text(`Retailer Name: ${orderDetails.customerDetails.username}`, 14, 30);
    doc.text(`Phone: ${orderDetails.customerDetails.phone_no}`, 14, 40);
    doc.text(`Address: ${orderDetails.customerDetails.address}`, 14, 50);
    doc.text(`Order ID: ${orderDetails.orderId}`, 14, 60);
    doc.text(`Invoice ID: ${generateId()}`, 14, 70);
    doc.text(`Date: ${new Date(orderDetails.createdAt).toLocaleDateString()}`, 14, 80);
    const tableColumns = ["Product Name", "Quantity", "Price (₹)"];
    const tableRows = orderDetails.products.map((product) => [
      product.product.product.name,
      product.quantity,
      product.product.product.price,
    ]);
  
    doc.autoTable({
      startY: 90,
      head: [tableColumns],
      body: tableRows,
    });
    const finalY = doc.previousAutoTable.finalY || 90;
    doc.text(`Subtotal: ₹${orderDetails.orderdetails.subtotal.toFixed(2)}`, 14, finalY + 10);
    doc.text(`Tax: ₹${orderDetails.orderdetails.tax.toFixed(2)}`, 14, finalY + 20);
    doc.text(`Total: ₹${orderDetails.orderdetails.total.toFixed(2)}`, 14, finalY + 30);
  
    const pdfPath = `uploads/Invoice_${orderDetails.orderId}.pdf`;
     doc.save(pdfPath);
    return pdfPath;
  };
  
  export const sendmail = async (req, res, next) => {
    const { email, order} = req.body;
    console.log("email",email);
    try {
        const currentOrder = await Order.findById(order.orderId);
        if (!currentOrder) return next(errorHandler(404, "Order not found"));
        const pdfPath = await generateInvoicePDF(order);
        const transporter=nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: 465,
            secure: true,
            auth:{
                user:process.env.SMTP_USER,
                pass:process.env.SMTP_PASS,
            }
        })
        await Order.findByIdAndUpdate(order.orderId, { status: "Confirmed" }, { new: true });
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: email,
            subject: "Order Confirmation",
            text: `Your order with Order ID ${order.orderId} has been confirmed. Find the invoice attached.`,
            attachments: [
            {
                filename: `Invoice_${order.orderId}.pdf`,
                path: pdfPath,
            },
            ],
        };
      await transporter.sendMail(mailOptions);
      fs.unlinkSync(pdfPath);
      
      res.status(200).json({ message: "Invoice sent successfully." });
    } catch (error) {
      console.error("Error sending invoice:", error);
      next(errorHandler(500, "Failed to send invoice."));
    }
  };

  export const cancelorder = async (req, res, next) => {
    const { orderid, email } = req.query;
    console.log("Request body:", req.query);
  
    try {
      // Find the order by ID
      const order = await Order.findOne({ _id: orderid });
      if (!order) {
        console.log("Order not found");
        return res.status(404).json({ message: 'Order not found' });
      }
  
      console.log("Order found:", order);
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderid }, 
        { status: 'Cancelled' },
        { new: true }
      );
  
      if (!updatedOrder) {
        console.log("Order update failed");
        return res.status(500).json({ message: 'Failed to update order status' });
      }
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth:{
            user:process.env.SMTP_USER,
            pass:process.env.SMTP_PASS,
        }
      });
  
      const mailOptions = {
        from:process.env.SMTP_USER,
        to: email,
        subject: "Order Actions",
        text: `Your order with Order ID ${orderid} has been Cancelled`,
      };
  
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully");
  
      // Send response to client
      return res.status(200).json({
        message: 'Order status updated successfully',
        order: updatedOrder,
      });
  
    } catch (error) {
      console.log("Error occurred:", error);
      // Handle errors and send a single response
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
  