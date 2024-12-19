import express from "express";
import Order from '../models/Order.js';
import Payment from "../models/Payment.js";
import Product from '../models/Product.js';
import retailer from "../models/retailer.js";
import { errorHandler } from '../Utils/error.js';
import { customAlphabet } from "nanoid";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import multer from "multer";
import fs from "fs";
import { jsPDF } from "jspdf";
import Cart from '../models/Cart.js';
import autoTable from "jspdf-autotable";
const reducequantity =async(products)=>{
    for(const item of products){
       const temp= await Product.findById(item.productId);
       temp.quantity=temp.quantity-item.quantity;
      await  temp.save();
    }
}
const removeVendorfromcart=async(cartid,vendorId)=>{
    console.log("cartid",cartid);
    console.log("vendorsid",vendorId);
      
    
    try{
        const cart=await Cart.findById(cartid);
        if(cart){
            cart.items = cart.items.filter(item => item.vendor.toString() !== vendorId);
        if(cart.items.length===0){
            await Cart.findByIdAndDelete(cartid);
        }else{
            await cart.save();
        }
        
    }    

    }catch(error){
        console.log("error",error);
    }
    
    

}
export const addorder = async (req, res, next) => {
    const { retailerId, customerDetails, products, vendorId,orderprices,user,cart} = req.body;
    const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10)(); // Generate unique orderId
    if (!retailerId || !customerDetails || !products || !vendorId) {
        console.log("please provide a required details ");
        return next(errorHandler(409, 'Please provide all the required fields'));
    }
    const retailername=await retailer.findOne({_id:retailerId});
    try {
        
        const order = new Order({
            retailer: retailerId,
            vendor: vendorId,
            products: products,
            phone_no: customerDetails.phone,
            shippingInfo: { 
                name:user.username,
                city: customerDetails.city,
                state: customerDetails.state,
                country: customerDetails.country,
                pinCode: customerDetails.pincode,
                phoneNo: customerDetails.phone,
                Landmark: customerDetails.Landmark,
            },
            orderId: nanoid,
            orderprices:orderprices,
        });
        const savedOrder = await order.save();
        const payment=new Payment({
            Retailer:user.username,
            Vendor:vendorId,
            Order_id:nanoid,
            retailer_id:retailerId,
            Vendor_id:vendorId,
            Amount:orderprices.total,
            Date: new Date().toLocaleString(), 
        })
        const pay=await payment.save();
        await reducequantity(savedOrder.products);
        retailername.orders.push(savedOrder._id);
        if (cart) {
            await removeVendorfromcart(cart._id,vendorId);
        }
        await retailername.save();
        const vendorSocketId = global.vendorConnections[vendorId]; // Global map to track online vendors
        if (vendorSocketId) {
            // console.log("socket bacha h abhi");
              global.io.to(vendorSocketId).emit('newOrderNotification', {
                orderDetails: { 
                    orderId: nanoid,
                    retailer: retailerId,
                    products: products,
                    deliveryAddress: customerDetails.address,
                    phone_no: customerDetails.phone,
                }
            });
        }else{
            // console.log("socket gaya");
        }
        res.json({ message: 'Order placed successfully', orderId: nanoid });
    } catch (error) {
        console.log("error",error);
        next(error);
    }
};

export const getnumber =async(req,res,next)=>{
    const vendor_id=req.query;
    if (!vendor_id) {
        return res.status(400).json({ message: "Vendor ID is required" });
      }
    const totalorder = await Order.countDocuments({
        ...(req.query.vendor_id && { vendor: req.query.vendor_id ,status:'Pending'}),
       });
    res.status(200).json(totalorder);
}


export const getorder = async (req,res,next) =>{
    const vendor_id=req.params.vendorId;
    const status=req.query.status;
    
    console.log("Vendor ID:", vendor_id);
    console.log("Status:", status);
    try{
        let order;
        if(status){
             order=await Order.find({vendor:vendor_id,status:status});
        }else{
             order=await Order.find({vendor:vendor_id});
        }
        
        res.status(200).json(order);
    }catch(error){
        res.status(404).json({message:'order not fonud'})
    }
}
export const getvendorOrder = async (req,res,next) =>{
    const vendor_id=req.params.vendorId;
    const { status } =req.query;
    const { orderId} =req.query;
    const { retailerId}=req.query;
    console.log(req.query);
    try{
        if (retailerId&&!mongoose.Types.ObjectId.isValid(retailerId)) {
            return res.status(200).json('Invalid retailer ID');
        }
        
        let query={vendor :vendor_id};
        if(status){
            query.status=status;
        }
        if(orderId){
            query.orderId=orderId;
        }
        if(retailerId){
            query.retailer=retailerId;
        }
        const orders = await Order.find(query)
        .select('orderId orderprices status products retailer');
        if(orders.length === 0){
            return res.status(200).json({message: 'No orders found for this retailer'});
        }
        return res.status(200).json(orders);
    }catch(error){
        console.log("error",error);
        res.status(404).json({message:'order not fonud'})
    }
}

export const getretailerorder =async(req,res)=>{
    const { retailerId } = req.params; 
    const { vendorId } = req.query; 
    const { status } =req.query;
    const { orderId} =req.query;
    console.log(req.query);
    try{
        if (vendorId&&!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(200).json('Invalid vendor ID');
        }
        let query={retailer :retailerId};
        if(vendorId){
            query.vendor=vendorId;
        }
        if(status){
            query.status=status;
        }
        if(orderId){
            query.orderId=orderId;
        }
        const orders = await Order.find(query)
        .select('orderId orderprices status products vendor');
        if(orders.length === 0){
            return res.status(200).json({message: 'No orders found for this retailer'});
        }
        return res.status(200).json(orders);

    }catch(error){

    }
}
export const changestatus=async(req,res,next)=>{
    const {orderid}=req.query;
    const {statusid}=req.query;
    console.log("body",req.query);
    try{
        const order = await Order.findOne({ orderId: orderid });
        if (!order) {
            return res.status(200).json({ message: 'Order not found' });
        }
        const { retailer: retailerId } = order;
        const retailerData = await retailer.findOne({ _id: retailerId });
        if (!retailerData || !retailerData.email) {
            return res.status(404).json({ message: 'Retailer email not found' });
        }
        const retailerEmail = retailerData.email;
        const updatedOrder = await Order.findOneAndUpdate(
            { orderId: orderid }, 
            { status: statusid }, 
            { new: true }         // Return the updated document
        );
        if(!updatedOrder){
            res.status(200).json({message:'Order not found'});
        }
        const transporter=nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth:{
                user:"hthakran45@gmail.com",
                pass:"rzgw dxws caak gfln",
            }
        })
        const mailOptions = {
            from: "hthakran45@gmail.com",
            to: retailerEmail,
            subject: "Order Actions",
            text: `Your order with Order ID ${orderid} has been ${statusid}`,
           
        };
      await transporter.sendMail(mailOptions);
        console.log("ho gya");
        res.status(200).json({
            message:'Order status updated successfully',
            order:updatedOrder,
        })
    }catch(error){
        console.log("error",error);
        res.status(500).json({ error: 'Internal server error' });
    }
}





