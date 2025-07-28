import express from "express";
import Order from '../models/Order.js';
import retailer from "../models/retailer.js";
import vendor from "../models/vendor.js";
import mongoose from "mongoose";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

const addretailer = async (retailerid) => {
    try {
        // Validate the retailerid
        if (!mongoose.Types.ObjectId.isValid(retailerid)) {
            return null;
        }
        
        const data = await retailer.findById(retailerid).lean();
        return data || null;
    } catch (error) {
        return null;
    }
};

const addvendors = async (vendorId) => {
    try {
        // Validate the vendorId
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return null;
        }
        
        const data = await vendor.findById(vendorId).lean();
        return data || null;
    } catch (error) {
        return null;
    }
};

export const getallvendors = async (req, res, next) => {
    const retailerid = req.params.retailerId;
    
    console.log("retailerid",retailerid);

    if (!mongoose.Types.ObjectId.isValid(retailerid)) {
        return res.status(400).json({ message: "Invalid retailerId" });
    }

    try {
        // First, let's check if the retailer exists
        const retailerExists = await retailer.findById(retailerid);
        
        if (!retailerExists) {
            return res.status(404).json({ 
                message: "Retailer not found",
                vendors: [],
                debug: {
                    retailerId: retailerid,
                    retailerExists: false,
                    ordersFound: 0,
                    uniqueVendors: 0,
                    vendorsReturned: 0
                }
            });
        }
        
        const orders = await Order.find({ retailer: retailerid })
            .sort({ createdAt: -1 })
            .select('vendor')
            .lean();
        
        const uniquevendors = [];
        const seen = new Set();
        
        for (const order of orders) {
            if (order.vendor) {
                const vendorid = order.vendor.toString();
                if (!seen.has(vendorid)) {
                    seen.add(vendorid);
                    uniquevendors.push(vendorid);
                }
            }
        }

        // If no vendors found, return empty array
        if (uniquevendors.length === 0) {
            return res.status(200).json({ 
                vendors: [],
                debug: {
                    retailerId: retailerid,
                    retailerExists: true,
                    ordersFound: orders.length,
                    uniqueVendors: 0,
                    vendorsReturned: 0
                }
            });
        }

        const vendorsObject = await Promise.all(
            uniquevendors.map(async (id) => {
                const vendorData = await addvendors(id);
                return vendorData;
            })
        );

        const filteredvendors = vendorsObject.filter(r => r !== null);

        return res.status(200).json({ 
            vendors: filteredvendors,
            debug: {
                retailerId: retailerid,
                retailerExists: true,
                ordersFound: orders.length,
                uniqueVendors: uniquevendors.length,
                vendorsReturned: filteredvendors.length
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            stack: error.stack 
        });
    }
};


export const getallretailers = async (req, res, next) => {
    const vendorId = req.params.vendorId;

    if (!mongoose.Types.ObjectId.isValid(vendorId)) {
        return res.status(400).json({ message: "Invalid vendorId" });
    }

    try {
        // First, let's check if the vendor exists
        const vendorExists = await vendor.findById(vendorId);
        
        if (!vendorExists) {
            return res.status(404).json({ 
                message: "Vendor not found",
                retailers: [],
                debug: {
                    vendorId: vendorId,
                    vendorExists: false,
                    ordersFound: 0,
                    uniqueRetailers: 0,
                    retailersReturned: 0
                }
            });
        }
        
        const orders = await Order.find({ vendor: vendorId })
            .sort({ createdAt: -1 })
            .select('retailer')
            .lean();
        
        const uniqueretailers = [];
        const seen = new Set();
        
        for (const order of orders) {
            if (order.retailer) {
                const retailerId = order.retailer.toString();
                if (!seen.has(retailerId)) {
                    seen.add(retailerId);
                    uniqueretailers.push(retailerId);
                }
            }
        }

        // If no retailers found, return empty array
        if (uniqueretailers.length === 0) {
            return res.status(200).json({ 
                retailers: [],
                debug: {
                    vendorId: vendorId,
                    vendorExists: true,
                    ordersFound: orders.length,
                    uniqueRetailers: 0,
                    retailersReturned: 0
                }
            });
        }

        const retailerObjects = await Promise.all(
            uniqueretailers.map(async (id) => {
                const retailerData = await addretailer(id);
                return retailerData;
            })
        );

        const filteredRetailers = retailerObjects.filter(r => r !== null);

        return res.status(200).json({ 
            retailers: filteredRetailers,
            debug: {
                vendorId: vendorId,
                vendorExists: true,
                ordersFound: orders.length,
                uniqueRetailers: uniqueretailers.length,
                retailersReturned: filteredRetailers.length
            }
        });
    } catch (error) {
        return res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            stack: error.stack 
        });
    }
};

export const getchat=async(req,res,next)=>{
    try{
        const { retailerId, vendorId } = req.params;
        
        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(retailerId)) {
            return res.status(400).json({ message: "Invalid retailerId" });
        }
        
        if (!mongoose.Types.ObjectId.isValid(vendorId)) {
            return res.status(400).json({ message: "Invalid vendorId" });
        }
        
        let chat = await Chat.findOne({
            'participants.retailerId': retailerId,
            'participants.vendorId': vendorId
        });
        
        if (!chat) {
            chat = new Chat({
                participants: { retailerId, vendorId }
            });
            await chat.save();
        }
        
        res.json(chat);
    }catch(error){
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const getallmessages=async(req,res,next)=>{
    try{
        const { chatId } = req.params;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: "Invalid chatId" });
        }
        
        const messages = await Message.find({ chatId: chatId }).sort({ timestamp: 1 });
        
        res.json(messages);
    }catch(error){
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}
export const sendMessage=async(req,res,next)=>{
    const { chatId, senderType, senderId, text } = req.body;
    try{
        const message = new Message({ chatId, senderType, senderId, text });
        await message.save();
        await Chat.findByIdAndUpdate(chatId, {
            lastMessage: {
            sender: senderType,
            text,
            timestamp: new Date()
            }
        });

        // Emit socket event for real-time messaging
        if (global.io) {
            const chat = await Chat.findById(chatId);
            if (chat) {
                const recipientId = senderType === 'vendor' ? chat.participants.retailerId : chat.participants.vendorId;
                global.io.emit('newMessage', {
                    ...message.toObject(),
                    recipientId: recipientId.toString()
                });
            }
        }

        res.json(message);
    }catch(error){
        return res.status(500).json({ message: "Server error" });
    }
}

// Test endpoint to check database data
export const testData = async (req, res, next) => {
    try {
        const { userId, userType } = req.params;
        
        // Validate user ID
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                message: 'Invalid user ID',
                error: 'User ID is not a valid MongoDB ObjectId'
            });
        }
        
        let orders;
        let userExists = false;
        
        if (userType === 'retailer') {
            userExists = await retailer.findById(userId);
            orders = await Order.find({ retailer: userId }).lean();
        } else if (userType === 'vendor') {
            userExists = await vendor.findById(userId);
            orders = await Order.find({ vendor: userId }).lean();
        } else {
            return res.status(400).json({ 
                message: 'Invalid user type',
                error: 'User type must be either "retailer" or "vendor"'
            });
        }
        
        // Get unique contacts
        let uniqueContacts = [];
        if (orders && orders.length > 0) {
            if (userType === 'retailer') {
                uniqueContacts = [...new Set(orders.map(order => order.vendor?.toString()).filter(Boolean))];
            } else {
                uniqueContacts = [...new Set(orders.map(order => order.retailer?.toString()).filter(Boolean))];
            }
        }
        
        res.json({ 
            message: 'Test successful', 
            userExists: !!userExists,
            orderCount: orders?.length || 0,
            uniqueContacts: uniqueContacts.length,
            contactIds: uniqueContacts,
            orders: orders?.slice(0, 3) || [] // Only return first 3 orders to avoid large response
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Test failed', 
            error: error.message,
            stack: error.stack
        });
    }
};
