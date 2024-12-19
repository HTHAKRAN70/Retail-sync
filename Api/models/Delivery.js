import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema({
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
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // References to orders
    status: {
        type: String,
        enum: ['Available', 'Busy', 'Offline'],
        default: 'Available',
    },
}, { timestamps: true });

const DeliveryPartner = mongoose.model('DeliveryPartner', deliveryPartnerSchema);

export default DeliveryPartner;
