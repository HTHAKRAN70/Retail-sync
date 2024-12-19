import retailer from '../models/retailer.js';
import { errorHandler } from '../Utils/error.js';

export const getretailer =async(req,res,next)=>{
    // if(req.user.roll==='retailer'){
    //     return next(errorHandler(403,'You are a retailer you can not see retailer'));
    // }
    try{
        const StartIndex =parseInt(req.query.StartIndex)||0;
        const limit = parseInt(req.query.limit)||9;
        const sortDirection =req.query.sort === 'asc'? 1:-1;

        const users = await retailer.find({
          ...(req.query.retailer_id && { _id: req.query.retailer_id }),
          ...(req.query.address && { address: req.query.address }),
          // ...(req.query.searchTerm && {
          //   // $or: [
          //   //   { name: { $regex: req.query.searchTerm, $options: 'i' } },
          //   //   { description: { $regex: req.query.searchTerm, $options: 'i' } },
          //   // ],
          // }),
        })
          .sort({ updatedAt: sortDirection })
          .skip(StartIndex)
          .limit(limit);
        const userwithoutPassword=users.map((user)=>{
            const {password, ...rest } =user._doc;
            return rest;
        })
        res.status(200).json({
            retailer:userwithoutPassword,
        })
    }catch(err){
        next(err);
    }
}
export const deleteretailer=async(req,res,next)=>{
    if ( req.retailer._id !== req.params.userId) {
      return next(errorHandler(403, 'You are not allowed to delete this user'));
    }
    try {
      await retailer.findByIdAndDelete(req.params.userId);
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