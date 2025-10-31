
import express from "express";
import Order from '../models/Order.js';
import Payment from "../models/Payment.js";
import Product from '../models/Product.js';
import retailer from "../models/retailer.js";
import { errorHandler } from '../Utils/error.js';
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import Cart from '../models/Cart.js';

const reducequantity = async (products) => {
  if (!Array.isArray(products)) return;
  for (const item of products) {
    try {
      const temp = await Product.findById(item.productId);
      if (!temp) {
        console.warn('Product not found for reducequantity:', item.productId);
        continue;
      }
      temp.quantity = Math.max(0, (temp.quantity || 0) - (item.quantity || 0));
      await temp.save();
    } catch (err) {
      console.error('Error reducing quantity for', item.productId, err);
    }
  }
};

const removeVendorfromcart = async (cartid, vendorId) => {
  try {
    if (!cartid) return;
    const cart = await Cart.findById(cartid);
    if (!cart) return;
    cart.items = cart.items.filter(item => item.vendor?.toString() !== vendorId);
    if (cart.items.length === 0) {
      await Cart.findByIdAndDelete(cartid);
    } else {
      await cart.save();
    }
  } catch (error) {
    console.log("removeVendorfromcart error", error);
  }
};

export const addorder = async (req, res, next) => {
  const { retailerId, customerDetails, products, vendorId, orderprices, user, cart } = req.body;
  const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)(); // Generate unique orderId

  if (!retailerId || !customerDetails || !products || !vendorId) {
    console.log("please provide required details ");
    return next(errorHandler(409, 'Please provide all the required fields'));
  }

  const retailername = await retailer.findOne({ _id: retailerId });
  if (!retailername) {
    return next(errorHandler(404, 'Retailer not found'));
  }

  try {
    const order = new Order({
      retailer: retailerId,
      vendor: vendorId,
      products: products,
      phone_no: customerDetails.phone,
      shippingInfo: {
        name: user?.username || customerDetails.name || '',
        city: customerDetails.city,
        state: customerDetails.state,
        country: customerDetails.country,
        pinCode: customerDetails.pincode,
        phoneNo: customerDetails.phone,
        Landmark: customerDetails.Landmark,
      },
      orderId: nanoid,
      orderprices: orderprices,
      status: 'Pending',
    });

    const savedOrder = await order.save();

    const payment = new Payment({
      Retailer: user?.username || '',
      Vendor: vendorId,
      Order_id: nanoid,
      retailer_id: retailerId,
      Vendor_id: vendorId,
      Amount: orderprices?.total || 0,
      Date: new Date().toLocaleString(),
    });

    await payment.save();

    await reducequantity(savedOrder.products);

    // add order to retailer orders array (make sure retailer schema has orders array)
    retailername.orders = retailername.orders || [];
    retailername.orders.push(savedOrder._id);

    if (cart) {
      await removeVendorfromcart(cart._id, vendorId);
    }

    await retailername.save();

    // Emit notification to vendor if online
    console.log("onlineUsers map:", global.onlineUsers);
    console.log("vendor id", vendorId);
    const vendorSocketId = global.onlineUsers.get(vendorId); // Map.get
    console.log("vendorSocketId", vendorSocketId);
    if (vendorSocketId) {
      console.log("Emitting newOrderNotification to vendor socket.");
      global.io.to(vendorSocketId).emit('newOrderNotification', {
        orderDetails: {
          orderId: nanoid,
          retailer: retailerId,
          products: products,
          deliveryAddress: customerDetails.address || `${customerDetails.city || ''}, ${customerDetails.state || ''}`,
          phone_no: customerDetails.phone,
        }
      });
    } else {
      console.log(`Vendor ${vendorId} not online (no socket).`);
    }

    res.json({ message: 'Order placed successfully', orderId: nanoid });
  } catch (error) {
    console.log("addorder error", error);
    next(error);
  }
};

export const getnumber = async (req, res, next) => {
  try {
    const { vendor_id } = req.query;
    if (!vendor_id) {
      return res.status(400).json({ message: "Vendor ID is required" });
    }

    const totalorder = await Order.countDocuments({
      vendor: vendor_id,
      status: 'Pending'
    });

    res.status(200).json(totalorder);
  } catch (err) {
    console.error('getnumber error', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getorder = async (req, res, next) => {
  const vendor_id = req.params.vendorId;
  const status = req.query.status;
  try {
    let order;
    if (status) {
      order = await Order.find({ vendor: vendor_id, status: status });
    } else {
      order = await Order.find({ vendor: vendor_id });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('getorder error', error);
    res.status(404).json({ message: 'order not found' });
  }
};

export const getvendorOrder = async (req, res, next) => {
  const vendor_id = req.params.vendorId;
  const { status, orderId, retailerId } = req.query;
  try {
    if (retailerId && !mongoose.Types.ObjectId.isValid(retailerId)) {
      return res.status(400).json('Invalid retailer ID');
    }

    let query = { vendor: vendor_id };
    if (status) query.status = status;
    if (orderId) query.orderId = orderId;
    if (retailerId) query.retailer = retailerId;

    const orders = await Order.find(query).select('orderId orderprices status products retailer');
    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: 'No orders found for this retailer' });
    }
    return res.status(200).json(orders);
  } catch (error) {
    console.log("getvendorOrder error", error);
    res.status(404).json({ message: 'order not found' });
  }
};

export const getretailerorder = async (req, res) => {
  const { retailerId } = req.params;
  const { vendorId, status, orderId } = req.query;
  try {
    if (vendorId && !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json('Invalid vendor ID');
    }
    let query = { retailer: retailerId };
    if (vendorId) query.vendor = vendorId;
    if (status) query.status = status;
    if (orderId) query.orderId = orderId;

    const orders = await Order.find(query).select('orderId orderprices status products vendor');
    if (!orders || orders.length === 0) {
      return res.status(200).json({ message: 'No orders found for this retailer' });
    }
    return res.status(200).json(orders);
  } catch (error) {
    console.error('getretailerorder error', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const changestatus = async (req, res, next) => {
  const { orderid, statusid } = req.query;
  try {
    const order = await Order.findOne({ orderId: orderid });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const retailerId = order.retailer;
    const retailerData = await retailer.findOne({ _id: retailerId });
    if (!retailerData || !retailerData.email) {
      return res.status(404).json({ message: 'Retailer email not found' });
    }
    const retailerEmail = retailerData.email;

    const updatedOrder = await Order.findOneAndUpdate(
      { orderId: orderid },
      { status: statusid },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // send email (if SMTP configured)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to: retailerEmail,
        subject: "Order Actions",
        text: `Your order with Order ID ${orderid} has been ${statusid}`,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (mailErr) {
        console.warn('Failed to send mail', mailErr);
      }
    } else {
      console.log('SMTP not configured, skipping email send.');
    }

    res.status(200).json({
      message: 'Order status updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.log("changestatus error", error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
