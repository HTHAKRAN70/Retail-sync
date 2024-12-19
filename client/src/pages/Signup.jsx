import React, { useState,useEffect,useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import image from '../assets/image.jpg' 
import axios from 'axios';
import { Table,Button, Modal,FileInput, Select, TextInput } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
  } from 'firebase/storage';

import { app } from '../firebase';
const Signup = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imageUploadProgress, setImageUploadProgress] = useState(null);
    const [imageUploadError, setImageUploadError] = useState(null);
    const [file,setFile]=useState();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone_no: '',
        password: '',
        confirmPassword: '',
        roll: 'vendor',
        image: '',
      });
    const fileInputRef = useRef(null);
    const [imageUploaded, setImageUploaded] = useState(false);
    const [passworderror,setpassworderror]=useState("");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [generatedOtp, setGeneratedOtp] = useState(null); // To store OTP from the backend
    const [step, setStep] = useState(1); // Step 1: Email input, Step 2: OTP input
    const [error, setError] = useState("");
    const [validateerror,setvalidateError]=useState("");
    const [change ,setchange]=useState(true);
    // const [imageUploaded, setImageUploaded] = useState(false);

    const navigate = useNavigate();
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setImageUploaded(false);
        setImageUploaded(false); 
      };
    const handlehomeclick=()=>{
      navigate('/');
    }
    const handleUpdloadImage = async () => {
        try {
          if (!file) {
            setImageUploadError('Please select an image');
            return;
          }
          if (!file.type.startsWith('image/')) {
            setImageUploadError('File must be an image');
            return;
          }
          setImageUploadError(null);
          const storage = getStorage(app);
          const fileName = new Date().getTime() + '-' + file.name;
          const storageRef = ref(storage, fileName);
          const uploadTask = uploadBytesResumable(storageRef, file);
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setImageUploadProgress(progress.toFixed(0));
            },
            (error) => {
              setImageUploadError('Image upload failed');
              setImageUploadProgress(null);
            },
            () => {
              getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                setImageUploadProgress(null);
                setImageUploaded(true);
                setImageUploadError(null);
                setFormData({ ...formData, image: downloadURL });
              });
            }
          );
        } catch (error) {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
          console.log(error);
        }
      };
      const validateFields = () => {
        const newErrors = {};
        const usernameRegex = /^[A-Za-z0-9]+$/; // Only allows alphabets (uppercase and lowercase)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Validates email format
        const phoneRegex = /^[0-9]+$/; // Ensures phone number contains only digits
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/;
        if (!usernameRegex.test(formData.username)) {
            newErrors.username = 'Username must contain only alphabets  and numbers (no special characters or numbers)';
        }
        if (formData.username.length < 3) {
            newErrors.username = 'Username is too short';
        }
        if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }
        if (!phoneRegex.test(formData.phone_no) || formData.phone_no.length !== 10) {
            newErrors.phone_no = 'Phone number must be exactly 10 digits and contain only numbers';
        }
        if (!passwordRegex.test(formData.password)) {
            newErrors.password= 'Password must contain uppercase, lowercase, digit, and special character.';
        }
        if (formData.password.length < 8||formData.password.length>16) {
            newErrors.password = 'Password length should be in between 8 to 16 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if(!formData.image){
          newErrors.image='Image is required';
        }
    
        setvalidateError(newErrors);
        console.log("ne",newErrors);
        console.log(Object.keys(newErrors).length === 0);
        return Object.keys(newErrors).length === 0;
    };
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value.trim()});
    };

    const handleRoleChange = (e) => {
        setFormData({ ...formData, roll: e.target.value });
    };

    const handleSubmit = async (e) => {
        console.log("handlesubmit",formData);
        e.preventDefault();
        
        console.log(formData);
        console.log("aa to rha h");
        if (!validateFields()) return;
        setLoading(true);
        
        if(formData.roll==='retailer'){
            console.log("retailer");

        try {
            const res = await fetch('/Api/auth/signupretailer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json(); 
            if (!res.ok) {
                console.log("something went wrong");
                return setErrorMessage(data.message || 'Something went wrong');
            }

            if (res.ok) {
                console.log("Success");
                navigate('/signin');
            }
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }
       }else{
        try {
            const res = await fetch('/Api/auth/signupvendor', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json(); 
            if (!res.ok) {
                return setErrorMessage(data.message || 'Something went wrong');
            }

            if (res.ok) {
                console.log("Success");
                navigate('/signin');
            }
        } catch (err) {
            console.log(err);
            setErrorMessage(err.message);
        } finally {
            setLoading(false);
        }

       }
    };
    const sendOtp = async () => {
        try {
          const response = await axios.post("/Api/auth/send-otp", { email });
          setStep(2); 
          setError('');
        } catch (error) {
          console.error("Error sending OTP:", error.response.data.message);
          setError( error.response.data.message);
        }
      };
      const verifyOtp = async () => {

        try{
            const response=await axios.post("/Api/auth/verify-otp",{email,otp});
            // setOtpVerified(true);
            setLoading(false);
            setStep(3);
            console.log(response.data.message);
        }catch(error){
            setLoading(false);
            setError("Invalid or expired OTP. Please try again.");
            console.error(error);
        }
      };
      useEffect(()=>{
        console.log("formdata",formData);
    },[formData])

    const handleEmailchange=(e)=>{
        setFormData({ ...formData, [e.target.id]: e.target.value.trim() });
        setEmail(e.target.value.trim());
    }

    useEffect(()=>{
       console.log("step",step);
    },[step])
    
   const handlebuttonchange=()=>{
    setFile(null);
    setImageUploadProgress(0);
    setImageUploaded(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
    }
   }
   const handleuserchange=(e)=>{
    let inputValue = e.target.value;
    let sanitizedValue = inputValue.replace(/\s+/g, " ").trim();
    setFormData({ ...formData, [e.target.id]: sanitizedValue})

   }
    return (
        <div 
            className="relative w-full h-screen flex items-center justify-center" 
            style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="max-w-md w-full p-6 bg-white bg-opacity-50 shadow-md rounded-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign Up</h1>
                <form onSubmit={handleSubmit}>
                <div className='flex flex-col mt-2 items-start'>
                    <span className='mx-1'>Username</span>
                    <input
                        type="text"
                        id='username'
                        placeholder='username'
                        value={formData.username}
                        required
                        className='shadow-md rounded-lg p-1 w-full'
                        onChange={handleuserchange}
                    />
                    {validateerror.username && <p className="text-red-500">{validateerror.username}</p>}
                </div>

                    {step === 1 && (
                    <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Email</span>
                        <input
                            type="email"
                            id='email'
                            placeholder='abc@gmail.com'
                            value={email}
                            required
                            className='shadow-md rounded-lg p-1 w-full'
                            onChange={handleEmailchange}
                            // onChange={(e) => setEmail(e.target.value)}
                        />
                        <button type="button"  onClick={sendOtp} className='mt-2 px-2 border rounded-lg bg-gray-100 p-1'>Send OTP</button>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                    )}
                    {step === 2 && (
                        <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Verify Otp</span>
                        <div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.trim())}
                            className='shadow-lg border border-neutral-800 rounded-lg p-1 w-[150px]'
                            required
                        />
                        <button type="button"  className='mx-2 px-2 py-1 cursor-pointer rounded-lg bg-gray-400' onClick={verifyOtp} >Verify Otp</button>

                        </div>
                        
                        {error && <p style={{ color: "red" }}>{error}</p>}
                        </div>
                    )}
                    {step === 3&&(
                        <div className='flex flex-col mt-2 items-start'>
                            <span className='mx-1'>Email</span>
                            <input
                                type="email"
                                id='email'
                                placeholder='abc@gmail.com'
                                value={email}
                                required
                                className='shadow-md rounded-lg p-1 w-full'
                                onChange={handleEmailchange}
                            />
                            {validateerror.email && <p className="text-red-500">{validateerror.email}</p>}
                        </div>
                        )}
                    <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Phone No</span>
                        <input
                            type="text"
                            id='phone_no'
                            placeholder='phone no'
                            value={formData.phone_no}
                            required
                            className='shadow-md rounded-lg p-1 w-full'
                            onChange={handleChange}
                        />
                        {validateerror.phone_no && <p className="text-red-500">{validateerror.phone_no}</p>}
                    </div>

                    <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Password</span>
                        <input
                            type="password"
                            id='password'
                            placeholder='password'
                            value={formData.password}
                            required
                            className='shadow-md rounded-lg p-1 w-full'
                            onChange={handleChange}
                        />
                    </div>
                    {validateerror.password && (
              <p className="text-red-500">{validateerror.password}</p>
            )}
                    <div className="flex flex-col mt-2 items-start">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              placeholder="confirm password"
              required
              className="shadow-md rounded-lg p-1 w-full"
              onChange={handleChange}
            />
            {validateerror.confirmPassword && (
              <p className="text-red-500">{validateerror.confirmPassword}</p>
            )}
          </div>
                   
                    <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Your Role</span>
                        <select
                            id="roll"
                            value={formData.roll}
                            onChange={handleRoleChange}
                            className='shadow-md rounded-lg p-1 w-full'
                        >
                            <option value="vendor">Vendor</option>
                            <option value="retailer">Retailer</option>
                        </select>
                    </div>
                        <div className="flex mt-2 gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3">
            <FileInput
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={imageUploadProgress || imageUploaded} // Disable while uploading or when uploaded
            />
            {!imageUploaded ? (
              <Button
                type="button"
                gradientDuoTone="purpleToBlue"
                size="sm"
                outline
                onClick={handleUpdloadImage}
                disabled={imageUploadProgress||imageUploaded}
              >
                {imageUploadProgress ? (
                  <div className="w-16 h-16 bg-white">
                    <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress || 0}%`} />
                  </div>
                ) : (
                  'Upload Your Image'
                )}
              </Button>
            ) : (
              <>
                <Button gradientDuoTone="greenToBlue" size="sm" className='bg-white text-black' disabled={!change}>
                  Image Uploaded
                </Button>
                {change &&(
                    <Button
                    gradientDuoTone="pinkToOrange"
                    size="sm"
                    onClick={handlebuttonchange} // Allow user to re-select an image
                    className='bg-red-600 text-white py-[12px]'
                  >
                    Change
                  </Button>
                )}
                
              </>
            )}
          </div>
          {validateerror.image && <p className="text-red-500">{validateerror.image}</p>}
          {imageUploadError && <p className="text-red-500">{imageUploadError}</p>}

                    {
                        step ===3&&(
                            <button
                        type='submit'
                        className='bg-blue-500 text-white p-2 px-4 mt-4 rounded-xl'
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? 'Signing Up...' : 'Signup'}
                    </button>
                        )
                    }
                    
                    {errorMessage && (
                        <p className='text-red-500 mt-2'>{errorMessage}</p>
                    )}
                </form>
                <div className='flex mt-4'>
                    <span>Have an account? </span>
                    <Link to='/signin' className='text-blue-700 text-md ml-2 hover:underline'>Signin</Link>
                    <div className='mx-4'><button onClick={handlehomeclick}><span className=' bg-blue-600 text-white p-1 px-2 border rounded-md'>Home</span></button></div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
