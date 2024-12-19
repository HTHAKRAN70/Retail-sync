import mongoose from "mongoose";

const retailerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    },
    roll:{
        type:String,
        required:true,
    },
    phone_no:{
        type:String,
        required:true,
    },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // References to orders
}, { timestamps: true });

const retailer = mongoose.model('retailer', retailerSchema);

export default retailer;
