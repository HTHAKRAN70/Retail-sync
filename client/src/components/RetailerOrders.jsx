import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

// The component to show orders for a retailer with filtering options
const RetailerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const {currentUser}=useSelector((state)=>state.user);
  const [validationError, setValidationError] = useState(""); 
  const retailerId=currentUser._id;
  const fetchOrders = async () => {
    try {
    //   setLoading(true);
      let url = `Api/order/getretailerorder/${retailerId}`;
      if (vendorId) {
        url += `?vendorId=${vendorId}`;
      }
      if (status) {
        url += `?status=${status}`;
      }
      if (orderId){
        url +=`?orderId=${orderId}`;
      }
      const response = await axios.get(url);
      if(response.status===200&&response.data==='Invalid vendor ID'){
        console.log("data message",response.data);
        setOrders(null);
        setValidationError(response.data)
      }else if(response.status===200&&!response.data.length>0){
        console.log("respnse",response.data.length);
        setOrders(null);
      }else{
        const ordersWithProductNames = await Promise.all(
            response.data.map(async (order) => {
              const updatedProducts = await Promise.all(
                order.products.map(async (product) => {
                  const productResponse = await axios.get(`/Api/product/getproduct?product_id=${product.productId}`);
                //   console.log("productresponse",productResponse.data);
                  return { ...product, productName: productResponse.data.product.name };
                })
              );
              return { ...order, products: updatedProducts };
            })
          );
          setOrders(ordersWithProductNames);
        // setOrders(response.data);
      }
      setLoading(false);
    } catch (error) {
        console.log("error",error);
        setLoading(false);
      setError("An error occurred while fetching orders.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleApplyFilters = () => {
    if (validateFields()) {
      fetchOrders();
    }
  };


  useEffect(()=>{
    setLoading(false);
    setValidationError('');
    const specialCharRegex = /^[a-zA-Z0-9]+$/;
    
    if(specialCharRegex.test(vendorId)){
        
        fetchOrders();
    }else if(vendorId.length!==0){
        setValidationError("Vendor ID contains special characters.");
    }
    
  },[vendorId]);
  
  useEffect(()=>{
    setLoading(false);
    setValidationError('');
    const specialCharRegex = /^[a-zA-Z0-9]+$/;
    if(specialCharRegex.test(orderId)){
        fetchOrders();
    }else if(orderId.length!==0){
        setValidationError("Order ID contains special characters.");
    }
  },[orderId]);
  useEffect(()=>{
    fetchOrders();
  },[status]);
  useEffect(()=>{
    fetchOrders();
  },[retailerId]);

  useEffect(()=>{
    console.log("order",orders);
  },[orders]);
return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">My Orders</h1>

      <div className="flex flex-wrap space-x-4 mb-4">
        <div>
          <label htmlFor="vendorId" className="block mb-1">Vendor:</label>
          <input
            id="vendorId"
            type="text"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value.trim())}
            className="px-2 h-10 w-36 border rounded"
            placeholder="Vendor ID"
          />
        </div>

        <div>
          <label htmlFor="status" className="block mb-1">Status:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value.trim())}
            className="px-3 h-10 w-36 border rounded"
          >
            <option value="">All</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label htmlFor="orderId" className="block mb-1">Order ID:</label>
          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.trim())}
            className="px-2 h-10 w-36 border rounded"
            placeholder="Order ID"
          />
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {validationError && <div className="text-red-500">{validationError}</div>}

      {!loading && (
        <div className="overflow-x-auto">
            {orders&&orders.length>0&&(<div><span>Orders: {orders.length}</span></div>)}
          <div className="overflow-y-auto max-h-96">
            <table className="table-auto w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-400 text-white">
                <tr>
                  <th className="border p-2">Order ID</th>
                  <th className="border p-2">Order Status</th>
                  <th className="border p-2">Vendor ID</th>
                  <th className="border p-2">Products</th>
                  <th className="border p-2">Total Price</th>
                </tr>
              </thead>
              <tbody>
                {orders&&orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-200 h-[50px] ">
                      <td className="border p-2">{order.orderId}</td>
                      <td className="border p-2"><span
              className={` py-2 px-2 w-[500px] rounded text-white text-sm ${
                order.status === "Confirmed"
                  ? "bg-green-500 "
                  : order.status === "Pending"
                  ? "bg-yellow-500"
                  : order.status === "Dispatched"
                  ? "bg-blue-500"
                  : order.status === "Delivered"
                  ? "bg-purple-500"
                  : order.status === "Cancelled"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            >
              {order.status}
            </span></td>
                      <td className="border p-2">{order.vendor}</td>
                      <td className="border p-2">
                        {order.products.map((product, idx) => (
                          <div key={idx}>{product.productName}</div>
                        ))}
                      </td>
                      <td className="border p-2">{order.orderprices.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="border p-2 text-center">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetailerOrders;

