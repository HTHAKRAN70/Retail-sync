import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import jsPDF from "jspdf";
import { Menu, Badge, notification } from 'antd';
import "jspdf-autotable"; 
import axios from "axios";
import '../componentcss/ordermanage.css';
import { decrementOrders } from "../Redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
const OrderManagement = () => {
  const dispatch=useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // For modal management
  const [modalOpen, setModalOpen] = useState(false);

  const fetchProductDetails = async (id) => {
    try {
      const productData = await axios.get(`/Api/product/getproduct/?product_id=${id}`);
      return productData.data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      return null;
    }
  };
  const navigate=useNavigate();

  const fetchCustomerDetails = async (id) => {
    try {
      const customerData = await axios.get(`/Api/retailer/getretailer/?retailer_id=${id}`);
      return customerData.data.retailer[0];
    } catch (error) {
      console.error("Error fetching customer details:", error);
      return null;
    }
  };
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (isoDate) => {
    const date = new Date(isoDate);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderRes = await axios.get(`/Api/order/getorder/${currentUser._id}?status=Pending`);
        const orderData = orderRes.data;
        console.log("orderData",orderData);
        
        const structuredOrders = await Promise.all(
          orderData.map(async (item) => {
            const customerDetails = await fetchCustomerDetails(item.retailer);
            const productDetailsArray = await Promise.all(
              item.products.map(async (product) => {
                const productDetails = await fetchProductDetails(product.productId);
                return {
                  product: productDetails,
                  quantity: product.quantity,

                };
              })
            );

            return {
              customerDetails,
              products: productDetailsArray,
              createdAt: item.createdAt,
              orderId: item._id,
              orderdetails:item.orderprices,
              shippingInfo:item.shippingInfo,
            };
          })
        );

        setOrders(structuredOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
      }
    };
    if(!currentUser){
      navigate('/signin');
    }else{
      fetchOrders();
    }
  }, [currentUser]);

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setModalOpen(false);
  };
 
  const handleConfirmOrder = async (order,email) => {
    console.log("order",order);
    try {
      const response=await axios.post(`/Api/order/confirmorder`, { email, order });

      if(response.status === 200){
        dispatch(decrementOrders());
           setOrders((prev)=>
           prev.filter((o) => o.orderId!==order.orderId)
          );
          notification.info({
            message: 'Order confirmed',
            description: `Order has been confirmed and sent mail to customer.`,
            placement: 'topRight',
          });
          }else{
            notification.info({
              message: 'Order not confirmed',
              description: `Something went wrong`,
              placement: 'topRight',
            });

          }
     
    } catch (error) {
      console.error("Error confirming order and sending invoice:", error);
    }
    handleCloseModal();
  };
  // useEffect(()=>{

  // },[Or])
  
  

  const handleCancelOrder = async(orderId,email) => {
    try{
      const response=await axios.put(`/Api/order/cancelorder?orderid=${orderId}&email=${email}`);
       if(response.status===200){
        dispatch(decrementOrders());
           setOrders((prev)=>
           prev.filter((o) => o.orderId!==orderId)
          );
       }
    }catch(error){
      console.log("error",error);
    }
    handleCloseModal();
  };
  useEffect(()=>{
    console.log("order",orders);
  },[orders]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h2>Order Management</h2>
      {orders&&orders.length==0 && <div className="text-blue-500">Your don't have any Pending Orders.. </div>}

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3 sm:grid-cols-1">
        
        {orders&&orders.map((order, index) => (
          <div
            key={index}
            style={{
              marginBottom: "20px",
              border: "1px solid #ccc",
              padding: "10px",
            }}
            className="w-full max-w-md flex justify-between bg-gradient-to-r from-indigo-200 via-purple-200 to-gray-100"
          >
            <div>
              <h3>{order.customerDetails.username}</h3>
              <p>Phone No: {order.customerDetails.phone_no}</p>
              <p> {order.shippingInfo.city} {order.shippingInfo.state} {order.shippingInfo.country}</p>
              <p>Products: {order.products.length}</p>
              <p>
                Date: {formatDate(order.createdAt)}, Time: {formatTime(order.createdAt)}
              </p>
              <button
                className="text-blue-400"
                onClick={() => handleViewOrder(order)}
              >
                View
              </button>
            </div>
            <div>
              <img
                src={order.customerDetails.profilePicture || "/fallback-image.jpg"}
                className="w-[150px] mt-[10px]"
                alt="Profile"
              />
            </div>
          </div>
        ))}
      </div>

      {modalOpen && selectedOrder && (
  <div className={`modal-overlay ${modalOpen ? "modal-open" : ""}`}>
    <div className={` modal-content ${modalOpen ? "modal-slide-in" : "modal-slide-out"}`}>
      <h3 className="modal-title">Order Details</h3>
      <div className="modal-body">
        <div className="customer-info">
          <h4>Customer Information</h4>
          <p>
            <strong>Name:</strong> {selectedOrder.customerDetails.username}
          </p>
          <p>
            <strong>Address:</strong> {selectedOrder.shippingInfo.address}, {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.state}({selectedOrder.shippingInfo.pinCode}), {selectedOrder.shippingInfo.country}
          </p>
          <p>
            <strong>Phone:</strong> {selectedOrder.shippingInfo.phoneNo}
          </p>
          <p>
          <strong>LandMark:</strong> {selectedOrder.shippingInfo.Landmark}
          </p>
        </div>

        <div className="products-section">
          <h4>Products</h4>
          <div className="products-list">
            {selectedOrder.products.map((product, idx) => (
              <div key={idx} className="product-item">
                <img
                  src={product.product.product.image || "/fallback-product.jpg"}
                  alt={product.product.product.category}
                  className="product-image"
                />
                <div>
                  <p>
                    <strong>Product Name:</strong> {product.product.product.name}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {product.quantity}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{product.product.product.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4>Total</h4>
          <div>
                  <p>
                    <strong>Total Prices:</strong> {selectedOrder.orderdetails.subtotal.toFixed(2)}
                  </p>
                  <p>
                    <strong>Quantity:</strong>  {selectedOrder.orderdetails.tax.toFixed(2)}
                  </p>
                  <p>
                    <strong>Price:</strong> {selectedOrder.orderdetails.total.toFixed(2)}
                  </p>
                </div>
        </div>
      </div>
      <div className="modal-buttons">
        <button className="confirm-button" onClick={() => handleConfirmOrder(selectedOrder,selectedOrder.customerDetails.email)}>
          Confirm Order
        </button>
        <button className="cancel-button" onClick={() => handleCancelOrder(selectedOrder.orderId,selectedOrder.customerDetails.email)}>
          Cancel Order
        </button>
        <button className="close-button" onClick={handleCloseModal}>
          Close
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};
export default OrderManagement;
