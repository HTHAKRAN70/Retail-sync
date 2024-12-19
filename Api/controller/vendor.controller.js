import vendor from '../models/vendor.js';
import { errorHandler } from '../Utils/error.js';
export const getvendor =async(req,res,next)=>{
    if(req.user.roll==='vendor'){
        return next(errorHandler(403,'You are a vendor you can not see vendors'));
    }
    try{
        const StartIndex =parseInt(req.query.StartIndex)||0;
        const limit = parseInt(req.query.limit)||9;
        const sortDirection =req.query.sort === 'asc'? 1:-1;
        let users;
        try{
           users = await vendor.find({
            ...(req.query.vendor_id && { _id: req.query.vendor_id }),
            ...(req.query.address && { category: req.query.category }),
           
          })
          console.log(users);

        }catch(error){
            console.log("error",error);
        }
        
          // .sort({ updatedAt: sortDirection })
          // .skip(StartIndex)
          // .limit(limit);
         console.log("users",users);
        const userwithoutPassword=users.map((user)=>{
            const {password, ...rest } =user._doc;
            return rest;
        })
        res.status(200).json({
            vendors:userwithoutPassword,
        })
    }catch(err){
        next(err);
    }
}
export const deletevendor=async(req,res,next)=>{
    if ( req.vendor.id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to delete this user'));
    }
    try {
      await vendor.findByIdAndDelete(req.params.userId);
      res.status(200).json('User has been deleted');
    } catch (error) {
      next(error);
    }
  };
  export const signout =async(req,res,next)=>{
    try{
      res
      .clearCookie('access_token')
      .status(200)
      .json('User has been signed out');
    }
    catch(error){
      next(error);
    }
  }
  export const getvendorproducts=async(req,res,next)=>{
    const {vendor_id}=req.query;
    try{
      const data=await vendor.findById(vendor_id);
      res.status(200).json(data.products.length)

    }catch(error){
      console.log("error",error);
    }
  }