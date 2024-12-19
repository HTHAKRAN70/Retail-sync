import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be at least 0'], // Minimum price is 0
    },
    quantity: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ['grocerry', 'crockery', 'stationary', 'toiletry', 'cosmetic'], // Restrict to specific categories
      required: true,
    },
    unit: {
        type: String,
        required: [true, "Please Enter Unit of Measurement for product"],
        enum: ["kg", "piece", "litre", "box", "meter"],
        default: "piece",
      },
    image: {
      type: String,
      default:
        'https://w7.pngwing.com/pngs/895/199/png-transparent-spider-man-heroes-download-with-transparent-background-free-thumbnail.png',
    },
    discount: {
      type: Number,
      required: true,
      min: [0, 'Discount cannot be less than 0'], // Minimum discount is 0
      max: [100, 'Discount cannot exceed 100%'],  // Maximum discount is 100%
    },
    vendor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor', // Referencing Vendor schema
      required: true,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
