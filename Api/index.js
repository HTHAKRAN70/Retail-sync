import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import vendorRoutes from './routes/vendor.route.js';
import productRoutes from './routes/product.route.js';
import orderRoutes from './routes/order.route.js';
import retailerRoutes from './routes/retailer.route.js';
import cookieParser from 'cookie-parser';
import cartroutes from './routes/cart.route.js';
import paymentRoutes from './routes/payment.route.js';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import Notification from './models/Notification.js'; 
dotenv.config();
const app=express();
mongoose.connect(process.env.MONGO)
.then(()=>{
    console.log('Mongodb  is connected');
}).catch((err)=>{
    console.log(err);
})
const server=http.createServer(app);
const io=new Server(server,{
    cors:{
        origin:'http://localhost:5173',
        methods: ['GET','POST'],
        credentials:true,
    }
});
global.vendorConnections = {}; // Map to store vendor socket connections
global.io = io;

io.on('connection', (socket) => {
    // console.log('New client connected:', socket.id);
    socket.on('registerVendor', (vendorId) => {
        global.vendorConnections[vendorId] = socket.id;
        // console.log(`Vendor registered: ${vendorId}`);
    });

    // Vendor disconnects
    socket.on('disconnect', () => {
        for (const [vendorId, socketId] of Object.entries(global.vendorConnections)) {
            if (socketId === socket.id) {
                delete global.vendorConnections[vendorId];
                console.log(`Vendor disconnected: ${vendorId}`);
                break;
            }
        }
    });
});
app.use(cors({
    origin:'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials:true,
}));
app.use(express.json());
app.use(cookieParser()); 
app.use('/Api/auth',authRoutes);
app.use('/Api/vendor',vendorRoutes);
app.use('/Api/retailer',retailerRoutes);
app.use('/Api/product',productRoutes);
app.use('/Api/cart',cartroutes),
app.use('/Api/order',orderRoutes);
app.use('/Api/payment',paymentRoutes);
app.use((err,req,res,next)=>{
    const statuscode=err.statuscode||500;
    const message=err.message||'Internal server error';
    res.status(statuscode).json({
        success:false,
        statuscode,
        message,
    });
})
server.listen(3000,()=>{
    console.log("server started on port 3000!");
})

