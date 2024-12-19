import mongoose from "mongoose";
import { nanoid } from 'nanoid';
const vendorSchema = new mongoose.Schema({
    vendor_id: {
        type:String,
        required:true,
        unique:true,
        default: () => nanoid(),
    },
    
    username: {
        type: String,
        required: true,
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
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // References to products
}, { timestamps: true });

const vendor = mongoose.model('vendor', vendorSchema);

export default vendor;
