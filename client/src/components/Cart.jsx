import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Billing from './Billing';
import { useLocation } from 'react-router-dom';
import { Menu, Badge, notification } from 'antd';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [cart, setCart] = useState(null);
  const [items, setItems] = useState(null);
  const [vendorData, setVendorData] = useState([]);
  const [vendorProductData, setVendorProductData] = useState({});
  const [part, setPart] = useState("vendors");
  const { currentUser } = useSelector((state) => state.user);
  const [payment,setpayment]=useState("");
  const location = useLocation();
  const socket = io('http://localhost:3000');
  const userId = currentUser._id;
  const navigate=useNavigate();
  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
    }
  }, [currentUser, navigate]);
  useEffect(() => {
    
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('payment');
    if (!tabFromUrl) {
        setpayment(null);
    } else {
        console.log("payment", tabFromUrl);
        if (tabFromUrl === 'success') {
            const order = localStorage.getItem("order");
            if (order) {
                console.log("order", JSON.parse(order));
                handlePlaceOrder(JSON.parse(order));
            } else {
                console.error("No order found in localStorage");
            }
        } else if (tabFromUrl === 'Failure') {
          notification.info({
            message: 'Order not placed',
            description: `Payment is not succefully done`,
            placement: 'topRight',
          });
            setPart('Vendor');
        }
        setpayment(tabFromUrl);
    }
}, [location.search]);


  const handleVendorClick = (vendorId) => {
    setSelectedVendor(vendorId);
    localStorage.setItem("selectedVendor",vendorId);
    setPart("billing");
  };
  const handlebackbutton=()=>{
    setSelectedVendor(null);
    setPart("vendors");
    localStorage.removeItem("selectedVendor");
  }

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`Api/cart/getcart?user_id=${currentUser._id.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setCart(data || null);
          setItems(data?.items || []);
        } else {
          console.log("problem", res);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchCart();
  }, [currentUser._id]);
 
  

  useEffect(() => {
    if (items && items.length > 0) {
      const fetchVendorData = async (vendorId) => {
        try {
          const res = await fetch(`/Api/vendor/getvendors?vendor_id=${vendorId}`);
          const data = await res.json();
          return data;
        } catch (error) {
          console.error("Error fetching vendor data:", error);
        }
      };

      const fetchProductData = async (product) => {
        // console.log(product);
        try {
          const res = await fetch(`/Api/product/getproduct?product_id=${product.productId}`);
          const data = await res.json();
          return data;
        } catch (error) {
          console.error("Error fetching product data:", error);
        }
      };

      const fetchAllData = async () => {
        const newVendorProductData = {};
        for (const item of items) {
          const vendorId = item.vendor;
          if (!newVendorProductData[vendorId]) {
            const vendorInfo = await fetchVendorData(vendorId);
            newVendorProductData[vendorId] = {
              vendorInfo,
              products: []
            };
          }
          const productDetails = await Promise.all(item.products.map(product => fetchProductData(product)));
          newVendorProductData[vendorId].products.push(...productDetails);
        }
        setVendorProductData(newVendorProductData);
        localStorage.setItem("vendorData", JSON.stringify(newVendorProductData));
        
        setVendorData(Object.values(newVendorProductData).map(v => v.vendorInfo));
      };
      fetchAllData();
    }
  }, [items]);
  useEffect(()=>{
    console.log("vendorProductData",vendorProductData);
    console.log("vendordata",vendorData);
  },[vendorProductData,vendorData]);
  
  
  const reducequantity = (key) => {
    setVendorData((prevVendorData) => {
        // Filter out the entries where the vendor with the given key exists
        const updatedVendorData = prevVendorData.filter((data) => {
            if (data.vendors[0]) {
                // Check if the vendor exists in this `data.vendors`
                return data.vendors[0]._id!=key;
            }
            return true; 
        });

        return updatedVendorData;
    });
};
const deleteVendorById = (vendorIdToDelete) => {
  setVendorData((prevVendorData) => {
    // Filter out the vendor object that matches the given vendorIdToDelete
    const updatedVendorData = prevVendorData.filter((data) => {
      // Assuming vendorData is an array of objects, where each object has a 'vendors' array
      return !data.vendors.some((vendor) => vendor._id === vendorIdToDelete);
    });
    
    // Return the updated vendorData after deletion
    return updatedVendorData;
  });
};



  const handlePlaceOrder = async (order) => {
    console.log("order placed",order);
    try {
      const res = await fetch('/Api/order/addorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });
      if (res.ok) {
        socket.emit('placeOrder', { userId, orderDetails: order });
        const selected=localStorage.getItem("selectedVendor");
        localStorage.removeItem("selectedVendor");
        deleteVendorById(selected);
        localStorage.removeItem("order");
        notification.info({
          message: 'Order placed',
          description: `Payment successfully done and Order placed and Delivered soon.`,
          placement: 'topRight',
        });
        navigate('/home?tab=cart');
      } else {

      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  };
  return (
    <div className="cart-page-container p-8">
      <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
      <hr />
      {!cart ? (
        <div className="text-center text-xl text-gray-500 mt-8">Cart is empty</div>
      ) : (
        <>
          {part === "vendors"&& vendorData.length > 0 && <h2 className="text-2xl font-semibold mb-4">Vendors</h2>}
          {part === "vendors" &&Array.isArray(vendorData) && vendorData.length === 0&&<div className="text-center text-xl text-gray-500 mt-8">Cart is empty</div>}

          {part === "vendors" && vendorData.length > 0 && (
            vendorData.flatMap(vendorGroup => vendorGroup.vendors).map((vendor) => (
              <div
                key={vendor._id}
                className="w-[500px] flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                onClick={() => handleVendorClick(vendor._id)}
              >
                <img
                  src={vendor.profilePicture}
                  alt={vendor.username}
                  className="w-16 h-16 rounded-full border-2 border-indigo-300 mr-4"
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">{vendor.username}</h3>
                  <p className="text-gray-600">{vendor.email}</p>
                  <p className="text-gray-600">{vendor.phone_no}</p>
                  <p className="text-gray-500 text-sm">{vendor.address}</p>
                </div>
              </div>
            ))
          )}
         
          {part === "billing" && (selectedVendor) && (
            <Billing user={currentUser} backbutton={handlebackbutton} status={payment} cart={cart} vendorData={vendorProductData[selectedVendor]} selectedVendor={selectedVendor} />
          )}

        </>
      )}
    </div>
  );
};

export default Cart;
