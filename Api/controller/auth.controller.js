import retailer from '../models/retailer.js';
import validator from 'validator';
import { nanoid } from "nanoid";
import vendor from '../models/vendor.js';
import bcryptjs from  'bcryptjs';
import { errorHandler } from '../Utils/error.js'; 
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer'; 
import Otp from "../models/Otp.js";
import crypto from 'crypto';
const ENCRYPTION_KEY = 'n5!F*Hgq9P^XZ0oLq@3W8y&R1vBnMlZ2'; // Must be 32 characters
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};
const decrypt = (encryptedText) => {
    const textParts = encryptedText.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedTextBuffer = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedTextBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
export const signupretailer = async (req, res, next) => {
    console.log(req.body);
    const { username, email, password,roll,phone_no ,image} = req.body;
    if (!username ||!phone_no ||  phone_no===''  ||!roll ||roll==='' || !email || !password) {
        // console.log('thakran');
        return next(errorHandler(400, 'All fields are required'));
    }
    const existingUser = await vendor.findOne({ email });
        if (existingUser) {
            // console.log("aarav")
            return next(errorHandler(400, 'Vendor and retailer can not register with same email'));
        }

    try {
        // Check if the user already exists
        const existingUser = await retailer.findOne({ email });
        if(!validator.isEmail(email)){
            return next(errorHandler(400,'Enter valid email format'));
        }
        if (existingUser) {
            return next(errorHandler(400, 'User already exists with this email'));
        }
        if(password.length<8){
            return next((errorHandler(400,'Enter a strong password ,length should be greater than 8')))
        }
        

        if(phone_no.length!==10){
            return next((errorHandler(400,'phone no should be of 10 digits')))
        }

        // Hash the password
        const hashedPassword = bcryptjs.hashSync(password, 10);

        // Create a new user
        const newUser = new retailer({
            username,
            email,
            password: hashedPassword,
            phone_no,
            roll,
            profilePicture:image,
        });

        // Save the user
        await newUser.save();
        res.json({ message: 'Signup successful' });
    } catch (error) {
        console.error("Error occurred saving user:", error);
        next(error);  // Pass the error to the error handling middleware
    }
};
export const signupvendor = async (req, res, next) => {
    const { username, email, password,roll,phone_no,image } = req.body;
    console.log(req.body);
    if(!validator.isEmail(email)){
        return next(errorHandler(400,'Enter valid email format'));
    }
    if (!username ||!phone_no  || phone_no===''  ||!roll ||roll==='' || !email || !password) {
        console.log('thakran');
        return next(errorHandler(400, 'All fields are required'));
    }
    if(password.length<8){
        return next((errorHandler(400,'Enter a strong password ,length should be greater than 8')))
    }
    const existingUser = await retailer.findOne({ email });
        if (existingUser) {
            // console.log("aarav")
            return next(errorHandler(400, 'Vendor and retailer can not register with same email'));
        }

    try {
        // Check if the user already exists
        const existingUser = await vendor.findOne({ email });
        if (existingUser) {
            console.log("aarav")
            return next(errorHandler(400, 'User already exists with this email'));
        }
        if(phone_no.length!==10){
            return next((errorHandler(400,'phone no should be of 10 digits')))
        }
        const hashedPassword = bcryptjs.hashSync(password, 10);

        // Create a new user
        console.log("vendor",{username,phone_no,roll});
        const newUser = new vendor({
            username,
            email,
            password: hashedPassword,
            phone_no,
            roll,
            profilePicture:image,
        });

        // Save the user
        await newUser.save();

        // Respond with success
        res.json({ message: 'Signup successful' });
    } catch (error) {
        console.error("Error occurred saving user:", error);
        next(error);  // Pass the error to the error handling middleware
    }
};
export const signin =async(req,res,next)=>{
    const{email,password}=req.body;
    // console.log(email)
    if(!validator.isEmail(email)){
        return next(errorHandler(400,'Enter valid email format'));
    }
    if(!email||!password){
        return next(errorHandler(400,'provide all the required fields'));
    }
    try{
        let validuser=await retailer.findOne({email});
        
        if(!validuser){
            validuser=await vendor.findOne({email});
            if(!validuser){
                console.log("ccccc");
                return next(errorHandler(400,'User  not found'));
            }
        }
        
        // console.log(validuser.i);
        const validpassword=bcryptjs.compareSync(password,validuser.password);
        if(!validpassword){
            return next(errorHandler(400,'Incorrect password'));
        }
        const expiresIn='2d';
        const token=jwt.sign(
            {id:validuser.id,roll:validuser.roll},process.env.JWT_SECRET,{expiresIn}
        );
        
        // const {password,...rest}=validuser._doc;
        const { password: _, ...rest } = validuser.toObject();
        
        res.status(200).cookie('access_token',token,{
            httpOnly:true,
        }).json(rest);
    }catch(err){
        next(err);
    }
}
const otpStore =new Map();
const generateOtp = (length = 6) => {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = Math.floor(Math.random() * (max - min + 1)) + min;
    return otp.toString();
  };
export const sendOtp =async(req,res,next)=>{
    const {email}=req.body;
    if(!validator.isEmail(email)){
        return next(errorHandler(400,'Enter valid email format'));
    }

    const otp=generateOtp(6);
    const encryptedOtp = encrypt(otp);
    const expiryTime = Date.now() + 5 * 60 * 1000; 
    const transporter=nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth:{
            user:"hthakran45@gmail.com",
            pass:"rzgw dxws caak gfln",
        }
    })

    const mailOptions={
        from :"hthakran45@gmail.com",
        to:email,
        subject:"Your otp Code",
        text:`Your OTP code is ${otp}`,
    };
    try{
        await Otp.findOneAndUpdate(
            { email },
            { otp: encryptedOtp, expiryTime },
            { upsert: true, new: true }
        );
        await transporter.sendMail(mailOptions);
        res.json({message:"OTP sent succussfully."});
    }catch(error){
        console.log("Error sending Otp:",error);
        res.status(500).json({error:"Failed to send OTP."});
    }
}
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
      const storedOtpData = await Otp.findOne({ email });
  
      if (!storedOtpData) {
        return res.status(400).json({ error: "OTP not found or expired." });
      }
    //   const { otp: storedOtp, expiryTime } = storedOtpData;
      const { otp: encryptedOtp, expiryTime } = storedOtpData;
      if (new Date() > expiryTime) {
        console.log("opt is expired");
        await Otp.deleteOne({ email }); 
        return res.status(400).json({ error: "OTP has expired. Please request a new one." });
      }
    //   if (storedOtp !== otp) {
    //     console.log("not matchde");
    //     return res.status(400).json({ error: "Invalid OTP." });
    //   }
    const decryptedOtp = decrypt(encryptedOtp); // Decrypt the OTP
    if (decryptedOtp !== otp) {
        return res.status(400).json({ error: "Invalid OTP." });
    }
      await Otp.deleteOne({ email }); 
      console.log("confirmed");
      res.json({ message: "OTP verified successfully." });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Failed to verify OTP." });
    }
  };
  
  

  
  

