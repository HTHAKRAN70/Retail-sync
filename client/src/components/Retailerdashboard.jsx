import React, { useEffect, useState } from 'react';
import { useSelector,useDispatch } from 'react-redux';
import { vendorClear,vendorRendor } from '../Redux/vendorshop/shopslice';
import { useNavigate } from 'react-router-dom';
import {Button} from 'flowbite-react';

function Retailerdashboard() {
  const navigate=useNavigate();
  const dispatch =useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [vendors, setVendors] = useState([]);
  // useEffect(()=>{
      
  //   },[navigate,currentUser]);
  dispatch(vendorClear());
  useEffect(() => {

    const fetchPosts = async () => {
      try {
        const res = await fetch(`Api/vendor/getvendors`);
        const data = await res.json();
        if (res.ok) {
            setVendors(data.vendors);  // Assuming `data` is an array of vendors
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    if(!currentUser){
      navigate('/signin');
    }
    else if (currentUser.roll === 'retailer') {
      fetchPosts();
    }
  }, [currentUser]);
  console.log
   useEffect(()=>{
    console.log("vendors",vendors);
   },[vendors]);
  const handlestoreclick=(vendor)=>{
    dispatch(vendorRendor(vendor));
    navigate(`/home?tab=store&vendorid=${vendor._id}`);
  }
  
  
  return (
    <div className=" bg-gray-100  h-full ">
      <div className=' p-1 mb-1 bg-gray-300'>
        <h3 className='mt-1 '>STORES</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
  {vendors.map((vendor) => (
    <div
      key={vendor._id}
      className="bg-gradient-to-r from-indigo-200 via-purple-200 to-gray-400 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center"
    >
      <img
        src={vendor.profilePicture}
        alt={vendor.username}
        className="w-24 h-24 object-cover rounded-full mb-4 border-2 border-gray-300 shadow-md"
      />
      <h2 className="text-lg font-semibold text-center mb-1 truncate w-full">
        {vendor.username}
      </h2>
      <p className="text-gray-600 text-center text-sm sm:text-base mb-1 truncate w-full">
        {vendor.email}
      </p>
      <div className="text-center mt-4">
        <button
          onClick={() => handlestoreclick(vendor)}
          className="text-blue-500 hover:text-blue-700 font-medium text-sm sm:text-base"
        >
          View Store
        </button>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}

export default Retailerdashboard;
