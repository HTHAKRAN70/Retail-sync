import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Vendor from '../models/vendor.js';
export const addtocart = async (req, res, next) => {
    const { userId, productId } = req.body;
    try {
        // Fetch the product with its full data
        const productInfo = await Product.findById(productId);
        if (!productInfo) {
            return res.status(400).json({ message: 'Product not found' });
        }
        const vendorId = productInfo.vendor_id;
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            console.log("nhi h");
            cart = new Cart({
                user: userId,
                items: [
                    {
                        vendor: vendorId,
                        products: [
                            {
                               productId: productId,
                               quantity:1,
                            },
                        ],
                    },
                ] ,
            });
        } else {
            const vendorIndex = cart.items.findIndex(item => item.vendor?.toString() === vendorId.toString());
            
            if (vendorIndex >= 0) {
                const productIndex = cart.items[vendorIndex].products.findIndex(
                    (item) => item.productId?.toString() === productId.toString()
                );
                console.log("product h",productIndex);
                if (productIndex >= 0) {
                    cart.items[vendorIndex].products[productIndex].quantity += 1;
                } else {
                    cart.items[vendorIndex].products.push({
                        productId: productId,
                        quantity:1,
                    });
                }
            } else {
                cart.items.push({
                    vendor: vendorId,
                    products: [
                        {
                            productId: productId,  
                            quantity:productInfo.quantity,
                        },
                    ],
                });
            }
        }
        await cart.save();
        res.status(200).json({ message: 'Product added to cart' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getcart = async (req, res, next) => {
    const { user_id } = req.query;
     try {
        const cart = await Cart.findOne({ user: user_id })
       
        if (!cart) {
            console.log("nhi mila")
            return res.status(200).json(null);
        }
        
        res.status(200).json(cart);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
// const products = await Product.find({
//     ...(req.query.vendor_id && { vendor_id: req.query.vendor_id }),
//     ...(req.query.category && { category: req.query.category }),
//     ...(req.query.product_id && { _id: req.query.product_id }),
//     ...(req.query.searchTerm && {
//       // $or: [
//       //   { name: { $regex: req.query.searchTerm, $options: 'i' } },
//       //   { description: { $regex: req.query.searchTerm, $options: 'i' } },
//       // ],
//     }),
//   })
 
export const deleteFromCart = async (req, res, next) => {
    console.log("idhr aya");
    const { userid,vendorId, productId } = req.query;
    console.log("query",req.query);
    try {
        if(productId){
            const cart = await Cart.findOne({ user: userid });
        
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(400).json({ message: 'Product not found' });
            }
            const vendorId = product.vendor_id;
            const vendorIndex = cart.items.findIndex(item => item.vendor.toString() === vendorId.toString());
            if (vendorIndex === -1) {
                return res.status(404).json({ message: 'Vendor not found in cart' });
            }
            const productIndex = cart.items[vendorIndex].products.findIndex(
                (item) => item.productId.toString() === productId.toString()
            );
            if (productIndex === -1) {
                return res.status(404).json({ message: 'Product not found in vendor\'s product list' });
            }
            cart.items[vendorIndex].products.splice(productIndex, 1);
            if (cart.items[vendorIndex].products.length === 0) {
                cart.items.splice(vendorIndex, 1);
            }
            await cart.save();
            res.status(200).json({ message: 'Product removed from cart' });
        }
        else if(vendorId){
            const cart=await Cart.findOne({user:userid});
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
            const vendorIndex = cart.items.findIndex(item => item.vendor.toString() === vendorId.toString());
            cart.items.splice(vendorIndex, 1);
            await cart.save();
            res.status(200).json({ message: 'vendor removed from cart' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};