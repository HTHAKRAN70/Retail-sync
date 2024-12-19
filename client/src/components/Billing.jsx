import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import {loadStripe} from '@stripe/stripe-js';
import { Menu, Badge, notification } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation ,useNavigate} from 'react-router-dom';

function Billing({user,status, cart,backbutton, selectedVendor, vendorData }) {
  console.log("status",status);
  if(status&&status==='sucess'){
    notification.info({
      message: 'Order Placed',
      description: `Order has been Placed and delivered soon.`,
      placement: 'topRight',
    });
    handlePlaceOrder();
  }else if(status==='failure'){
    notification.info({
      message: 'Order Unsuccessfull',
      description: `Order has not Placed succeffully.`,
      placement: 'topRight',
    });

  }
  const navigate=useNavigate();
  const [quantities, setQuantities] = useState({});
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [ordersummary,setordersummary] =useState({});
  const [orderStatus, setOrderStatus] = useState('');
  const { currentUser } = useSelector((state) => state.user);
  const socket = io('http://localhost:3000');
  const userId = currentUser._id;
  const [vendorDetails, setVendorDetails] = useState(vendorData);
  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
    }
  }, [currentUser, navigate]);

  const [order, setOrder] = useState({
    retailerId: userId,
    vendorId: selectedVendor,
    products: [],
    customerDetails: {  },
    orderprices:{},
    cart:cart,
    user:user,
  });

    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');
    const [pincode, setPincode] = useState('');
    const [landmark, setLandmark] = useState('');
    const [errors, setErrors] = useState({});
    const validateFields = () => {
      const validationErrors = {};
      if (!city) {
        validationErrors.city = 'City is required.';
      } else if (!/^[a-zA-Z\s]+$/.test(city.trim())) {
        validationErrors.city = 'City must contain only letters and spaces.';
      }else if(city.length>50){
        validationErrors.city = 'City must contain less than 50 characters';
      }
      if (!state) {
        validationErrors.state = 'State is required.';
      } else if (!/^[a-zA-Z\s]+$/.test(state.trim())) {
        validationErrors.state = 'State must contain only letters and spaces.';
      }else if (state.length>50){
        validationErrors.state = 'State must contains less than 50 characters';
      }
      if (!country) {
        validationErrors.country = 'Country is required.';
      } else if (!/^[a-zA-Z\s]+$/.test(country.trim())) {
        validationErrors.country = 'Country must contain only letters and spaces.';
      }else if(country.length>50){
        validationErrors.country = 'Country must contain less than  50 characters.';
      }
      if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
        validationErrors.pincode = 'Pincode must be exactly 6 digits.';
      }
      if (!phone || phone.trim().length !== 10 || !/^\d{10}$/.test(phone.trim())) {
        validationErrors.phone = 'Phone number must be exactly 10 digits.';
      }
      if(!landmark){
        validationErrors.landmark='Landmark is required';
      }
     else if (landmark.length > 60) {
        validationErrors.landmark = 'Landmark must be at most 60 characters long.';
      } else if (landmark && !/^[a-zA-Z\s]+$/.test(landmark.trim())) {
        validationErrors.landmark = 'Landmark must  contain only  alphabets.';
      }
    
      setErrors(validationErrors);
      return Object.keys(validationErrors).length === 0;
    };
    
useEffect(()=>{
  console.log("error",errors);
},[errors]);
  useEffect(() => {
    setVendorDetails(vendorData); 
  }, [vendorData]);
  const calculateSummary = () => {
    let subtotal = 0;
    vendorDetails.products
      ?.map((item) => item.product) 
      .forEach((product) => {
        if(product.quantity>0){
          const quantity = quantities[product._id] || 1; 
        subtotal += product.price * (1 - product.discount / 100) * quantity; 
        }
      });
    const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2)); 
    return { subtotal, tax, total };
  };
  useEffect(() => {
    if (vendorDetails.products) {
      const initialQuantities = {};
      vendorDetails.products.forEach((item) => {
        const product = item.product; 
        if (product.quantity > 0) {
          initialQuantities[product._id] = 1;
        }
      });
  
      console.log("initialQuantities", initialQuantities);
  
      setQuantities(initialQuantities);
      setOrder((prev) => ({
        ...prev,
        products: Object.entries(initialQuantities).map(([productId, quantity]) => ({
          productId,
          quantity,
        })),
      }));
    }
  }, [vendorDetails]);

  
  useEffect(()=>{
    setordersummary(calculateSummary());
  },[vendorDetails,quantities])
  useEffect(()=>{
    setOrder((prev)=>({
      ...prev,
      orderprices:ordersummary,
    }))

  },[ordersummary]);

  const handleQuantityChange = (product, delta) => {
  if(delta===+1&&quantities[product._id]===product.quantity){
    return quantities;
  }else if(delta === -1 ){
    setQuantities((prev) => {
      const newQuantities = {
        ...prev,
        [product._id]: Math.max((prev[product._id] || 1) + delta, 1),
      };
      setOrder((prevOrder) => ({
        ...prevOrder,
        products: Object.entries(newQuantities).map(([id, quantity]) => ({
          productId: id,
          quantity,
        })),
      }));

      return newQuantities;
    });
    
  }
    setQuantities((prev) => {
      const newQuantities = {
        ...prev,
        [product._id]: Math.max((prev[product._id] || 1) + delta, 1),
      };

      // Update products in the order based on new quantities
      setOrder((prevOrder) => ({
        ...prevOrder,
        products: Object.entries(newQuantities).map(([id, quantity]) => ({
          productId: id,
          quantity,
        })),
      }));

      return newQuantities;
    });
  };

  const calculateTotalAmount = (price, discount, quantity) => {
    const discountedPrice = price * (1 - discount / 100);
    return discountedPrice * quantity;
  };
  const makePayment = async()=>{
    if (!validateFields()) return;
    // console.log(import.meta.env.VITE_STRIPE_PUBLISH);
    const stripe = await loadStripe(`${import.meta.env.VITE_STRIPE_PUBLISH}`);
    const body = {
        products:order.products,
        vendor:order.vendorId,
        retailer:order.retailerId,
        
    }
    const headers = {
        "Content-Type":"application/json"
    }
    const response = await fetch("Api/payment/makepayment",{
        method:"POST",
        headers:headers,
        body:JSON.stringify(body)
    });

    const session = await response.json();

    const result = stripe.redirectToCheckout({
        sessionId:session.id
    });
    
    if(result.error){
      console.log("not ok");
        console.log(result.error);
    }else{
      console.log("all ok");
      localStorage.setItem("order", JSON.stringify(order));
    }
}
  const handlePlaceOrder = async () => {
    if (!validateFields()) return;
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
        reducequantity(order,vendorData);
        setOrderStatus('Order placed successfully!');
        setQuantities({});
        setOrderStatus('');
        notification.info({
          message: 'Order placed',
          description: `Payment successfully done.`,
          placement: 'topRight',
        });
      } else {
        setOrderStatus('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setOrderStatus('Failed to place order. Please try again.');
    }
  };

  const removeProductFromVendor = async (vendorId, productId) => {
    try {
      await axios.delete(`/Api/cart/deletefromcart?userid=${userId}&vendorId=${vendorId}&productId=${productId}`);
      setVendorDetails((prevDetails) => {
        const updatedProducts = prevDetails.products.filter((productGroup) => {
          const product = productGroup.product;
          return product && product._id !== productId;
        });
        return { ...prevDetails, products: updatedProducts };
      });
  
      setOrder((prevOrder) => ({
        ...prevOrder,
        products: prevOrder.products.filter((p) => p.productId !== productId),
      }));
  
      console.log('Product removed successfully from UI');
    } catch (error) {
      console.error('Error removing product:', error);
    }
  };


  useEffect(()=>{
    console.log("order",order);
  },[order]);
  return (
    <div className="max-w-screen-xl mx-auto p-4">
      {selectedVendor && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="vendor-products flex-1">
            
            <h2 className="text-2xl font-bold mb-4">
              Products from Vendor: {vendorData.vendorInfo?.vendors[0]?.username}
            </h2>
            <div>
                <div className="flex justify-end">
              <button onClick={backbutton}  className='p-2 bg-gray-400 text-black text-lg rounded border border-gray-500'>
                {"<-"} Back
              </button>
            </div>
           </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendorDetails.products?.flatMap((productGroup) =>{
                const product=productGroup.product;
                  
                  const quantity = quantities[product._id] || 1;
                  const stock=product.quantity;
                  let flag=true;
                  if(stock===0||stock<0){
                    flag=false;
                  }
                  const totalAmount = calculateTotalAmount(product.price, product.discount, quantity);
                   return (
                    <div key={product._id} className="p-4 border rounded-lg bg-white shadow-lg">
                      <img
                        src={product.image || 'https://via.placeholder.com/150'}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p className="text-gray-600">Description: {product.description}</p>
                      <p className="font-semibold">Original Price:₹{product.price.toFixed(2)}</p>
                      <p className="text-green-600">Discount: {product.discount.toFixed(2) || 0}%</p>
                      <p className="text-lg font-bold">Discounted Price: ₹{totalAmount.toFixed(2)}</p>

                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(product, -1)}
                          className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                          disabled={!flag}
                        >
                          -
                        </button>
                        <span className="text-lg ">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(product, 1)}
                          className="px-2  py-1 bg-gray-200 rounded hover:bg-gray-300"
                          disabled={!flag}
                        >
                          +
                        </button>
                        
                      </div>
                      {!flag &&(<div className='text-red-500 text-sm mt-2'>currnetly out of stock</div>)}
                      {flag &&(<div className='text-red-500 text-sm mt-2'>only {product.quantity} left</div>)}
                      {/* <div className='text-red-500 text-sm mt-2'>only {product.quantity} left</div> */}
                      <button
                        onClick={() => removeProductFromVendor(selectedVendor, product._id)}
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Remove from Cart
                      </button>
                    </div>
                  );
                } )
              }
            </div>
          </div>
          
          <div className="order-summary lg:w-1/3 bg-gray-100 p-6 rounded-lg">
          
            <h3 className="text-xl font-bold">Order Summary</h3>
            <p>Subtotal: ₹{ordersummary.subtotal}</p>
            <p>Tax: ₹{ordersummary.tax}</p>
            <p>Total: ₹{ordersummary.total}</p>
            <h3 className="text-xl font-bold mb-4">Order Information</h3>
            <div className="mb-4">
              <label className="block font-semibold mb-1">LandMark:</label>
               <input
                type="text"
                value={landmark}
                onChange={(e) => {
                  setLandmark(e.target.value.replace(/\s+/g, ' '));
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    customerDetails: { ...prevOrder.customerDetails, Landmark: e.target.value.replace(/\s+/g, ' ') },
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter Landmark,less than 50 words"
              />
            </div>
            {errors.landmark && <p className="text-red-500 text-sm">{errors.landmark}</p>}

            <div className="mb-4">
              <label className="block font-semibold mb-1">City:</label>
              <input
                type="text"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value.replace(/\s+/g, ' '));
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    customerDetails: { ...prevOrder.customerDetails, city: e.target.value.replace(/\s+/g, ' ') },
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter your city"
              />
            </div>
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

            <div className="mb-4">
              <label className="block font-semibold mb-1">State:</label>
              <input
                type="text"
                value={state}
                onChange={(e) => {
                  setState(e.target.value.replace(/\s+/g, ' '));
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    customerDetails: { ...prevOrder.customerDetails, state: e.target.value.replace(/\s+/g, ' ') },
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter your state"
              />
            </div>
            {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}

            <div className="mb-4">
              <label className="block font-semibold mb-1">Country:</label>
              <input
                type="text"
                value={country}
                onChange={(e) => {
                  setCountry(e.target.value.replace(/\s+/g, ' '));
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    customerDetails: { ...prevOrder.customerDetails, country: e.target.value.replace(/\s+/g, ' ') },
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter your country"
              />
            </div>
            {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}

            <div className="mb-4">
              <label className="block font-semibold mb-1">Pincode:</label>
              <input
                type="number"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    customerDetails: { ...prevOrder.customerDetails, pincode: e.target.value },
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter your pincode"
              />
            </div>
            {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}

            <div className="mb-4">
              <label className="block font-semibold mb-1">Phone Number:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\s+/g, ''));
                  setOrder((prevOrder) => ({
                    ...prevOrder,
                    customerDetails: { ...prevOrder.customerDetails, phone: e.target.value.replace(/\s+/g, ' ') },
                  }));
                }}
                className="w-full p-2 border rounded"
                placeholder="Enter your phone number"
              />
            </div>
           {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}

            
            
            <button onClick={makePayment} className="mt-4 bg-green-500 text-white px-4 py-2 rounded">
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Billing;

