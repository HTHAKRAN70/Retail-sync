import Product from '../models/Product.js';// Import the Vendor model
import vendor from '../models/vendor.js';
import { errorHandler } from '../Utils/error.js';
import { nanoid } from 'nanoid';
export const addproduct = async (req, res, next) => {
  console.log(req.body)
  const id = nanoid(); 
    const { name, description,unit, image,category, price, quantity, discount, vendor_id } = req.body;

    if (!name||!category||!unit || !description || !price || !quantity || !vendor_id) {
      console.log("not all details");
      return next(errorHandler(409, 'Please provide all the required fields'));
    }
    if(!image){
      console.log("not image");
    }else{
      console.log("image",image);
    }
    if(!discount){
      discount=0;
    }
    let trimedname =name.trim().replace(/\s+/g,' ');
    let  trimeeddescription=description.trim().replace(/\s+/g,' ');
    try {
      const vendorname=await vendor.findOne({_id:vendor_id});
        const newProduct = new Product({
            name:trimedname,
            description:trimeeddescription,
            price,
            image,
            quantity,
            category,
            discount,
            unit,
            product_id:id,
            vendor_id:vendorname._id,
        });
          const savedProduct = await newProduct.save();
        
        vendorname.products.push(savedProduct._id);
        console.log("done",savedProduct);
        try {
          await vendorname.save();
        } catch (err) {
          console.error("Save Error Details:", err);
          return next(errorHandler(500, err.message || "Error saving product"));
        }
        console.log("done");
        res.json({product:savedProduct, message: 'Product added successfully' });

    } catch (err) {
      console.log("error")
        next(err);
    }
};
export const deleteproduct =async(req,res,next)=>{
  const {vendorId,productId}=req.query;
  try {
    const deletedProduct=  await Product.findByIdAndDelete(productId);
      const updatedVendor = await vendor.findByIdAndUpdate(
        vendorId,
        { $pull: { products: productId } }, // Removes product _id from the vendor's products array
        { new: true }
      );
    res.status(200).json('User has been deleted');
  } catch (error) {
    console.log("error",error);
    next(error);
  }
}
export const getproduct = async (req, res, next) => {
  // console.log("this is query", req.query);

  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    // const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;

    let product = null;

    // Fetch a single product based on query parameters
    if (req.query.product_id) {
      product = await Product.findOne({ _id: req.query.product_id });
      res.status(200).json({
        product, // Single product as an object
      });
    } else {
      product = await Product.find({
        ...(req.query.vendor_id && { vendor_id: req.query.vendor_id }),
        ...(req.query.category && { category: req.query.category }),
      })
        .sort({ createdAt: sortDirection })
        .skip(startIndex);
        // .limit(limit);
        // console.log("product",product);
    

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const totalProducts = await Product.countDocuments({
      ...(req.query.vendor_id && { vendor_id: req.query.vendor_id }),
      ...(req.query.category && { category: req.query.category }),
    });

    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastMonthProducts = await Product.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      product, // Single product as an object
      totalProducts,
      lastMonthProducts,
    });
  }
  } catch (error) {
    next(error);
  }
};
 

export const editproduct=async(req,res,next)=>{
  console.log("body",req.body);
  try {
    const { productId } = req.params;
    const updateData = req.body; 
    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    if (!updatedProduct) {
      return res.status(200).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
 
