import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import backgroundImage from '../assets/background.avif'; // Adjust the path as needed
import {useSelector,useDispatch} from 'react-redux';
import image from '../assets/image.jpg'
import { signInfailure,signInstart,signInsuccess } from '../Redux/user/userSlice.js';
const Signin = () => {
    const [errorMessage, setErrorMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ });
    const dispatch= useDispatch();
    const {currentUser} =useSelector(state=>state.user);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value});
    };
    const handleEmailChange = (e) => {
        // Trim email and validate format
        const email = e.target.value.trim();
        setFormData({ ...formData, email });
    };
    const validateEmail = (email) => {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handlehomeclick=()=>{
        navigate('/');
      }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            return dispatch(signInfailure('Please fill all the fields'));
        }

        if (!validateEmail(formData.email)) {
            return dispatch(signInfailure('Invalid email format'));
        }
        try {
            setLoading(true); // Set loading to true before making the request
            const res = await fetch('/Api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
    
            const data = await res.json(); 
            if (!res.ok) {
                return setErrorMessage(data.message || 'Something went wrong');
            }
    
            if (res.ok) {
                dispatch(signInsuccess(data));
                const queryParam = data.roll === 'retailer' ? 'retailer' : 'vendor';
                navigate(`/home`);
            }
        } catch (err) {
            console.log(err);
            dispatch(signInfailure(err.message));
            setErrorMessage(err.message);
        } finally {
            setLoading(false); // Set loading to false in the finally block
        }
    };
    

    return (
        <div 
            className="relative w-full h-screen flex items-center justify-center " 
            style={{ backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="max-w-md w-full p-6 bg-white bg-opacity-50 shadow-md rounded-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
                <form onSubmit={handleSubmit}>
                    
                    <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Email</span>
                        <input
                            type="email"
                            id='email'
                            placeholder='abc@gmail.com'
                            required
                            className='shadow-md rounded-lg p-1 w-full'
                            onChange={handleChange}
                        />
                    </div>
                    
                    <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-1'>Password</span>
                        <input
                            type="password"
                            id='password'
                            placeholder='password'
                            required
                            className='shadow-md rounded-lg p-1 w-full'
                            onChange={handleChange}
                        />
                    </div>
                    <button
                        type='submit'
                        className='bg-blue-500 w-full text-white p-2 px-4 mt-4 rounded-xl'
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? 'Signing In...' : 'SignIn'}
                    </button>
                    {errorMessage && (
                        <p className='text-red-500 mt-2'>{errorMessage}</p>
                    )}
                </form>
                <div className='flex mt-4'>
                    <span>Don't Have an account? </span>
                    <Link to='/signup' className='text-blue-700 text-md ml-2 hover:underline'>Signup</Link>
                    <div className='mx-4'><button onClick={handlehomeclick}><span className=' bg-blue-600 text-white p-1 px-2 border rounded-md'>Home</span></button></div>
                </div>
            </div>
        </div>
    );
};

export default Signin;
