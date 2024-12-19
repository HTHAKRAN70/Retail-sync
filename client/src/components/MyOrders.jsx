import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// The component to show orders for a retailer with filtering options
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [retailerId, setRetailerId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const {currentUser}=useSelector((state)=>state.user);
  const [validationError, setValidationError] = useState(""); 
  const [statuserror,setstatuserror]=useState("");
  const [temporder,settemporder]=useState("");
  const [formdata,setformdata]=useState({
    order:"",
    statusid:"",
  })
  const navigate=useNavigate();
  useEffect(()=>{
      if(!currentUser){
        navigate('/signin');
      }
    },[navigate,currentUser]);
  const vendor_id=currentUser._id;
  const fetchOrders = async () => {
    try {
    //   setLoading(true);
      let url = `Api/order/getvendorOrder/${vendor_id}`;
      if (retailerId) {
        url += `?retailerId=${retailerId}`;
      }
      if (status) {
        url += `?status=${status}`;
      }
      if (orderId){
        url +=`?orderId=${orderId}`;
      }
      const response = await axios.get(url);
      if(response.status===200&&response.data==="Invalid retailer ID"){
        console.log("data message",response.data);
        setOrders(null);
        setValidationError(response.data)
      }else if(response.status===200&&!response.data.length>0){
        console.log("respnse",response.data.length);
        setOrders(null);
      }
      else{
        console.log("response",response.data);
        const ordersWithProductNames = await Promise.all(
            response.data.map(async (order) => {
              const updatedProducts = await Promise.all(
                order.products.map(async (product) => {
                  const productResponse = await axios.get(`/Api/product/getproduct?product_id=${product.productId}`);
                  console.log("productresponse",productResponse);
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


  useEffect(()=>{
    setLoading(false);
    setValidationError('');
    const specialCharRegex = /^[a-zA-Z0-9]+$/;
    
    if(specialCharRegex.test(retailerId)){
      console.log("retailer",retailerId);
        fetchOrders();
    }else if(retailerId.length!==0){
        setValidationError("Retailer ID contains special characters.");
    }
    
  },[retailerId]);
  
  useEffect(()=>{
    setLoading(false);
    setValidationError('');
    const specialCharRegex = /^[a-zA-Z0-9]+$/;
    if(specialCharRegex.test(orderId)){
        fetchOrders();
    }else if(orderId.length!==0){
        setValidationError("Order ID contains special characters.");
    }else{
      fetchOrders();
    }
  },[orderId]);
  useEffect(()=>{
    fetchOrders();
  },[status]);
  useEffect(()=>{
    fetchOrders();
  },[vendor_id]);

  useEffect(()=>{
    console.log("order",orders);
  },[orders]);
  const handleformchange=(e)=>{
    setformdata((prev)=>({
      ...prev,
      [e.target.id]:e.target.value.trim()
    }))
  }
  const validatefield=()=>{
    const specialCharRegex = /^[a-zA-Z0-9]+$/;
    if(!formdata.order||!formdata.statusid){
      setstatuserror("All fields are required")
      return false;
    }
    if(!specialCharRegex.test(formdata.order)){
      setstatuserror("Enter valid orderid");
    }
     else if(specialCharRegex.test(formdata.order)){
      return true;
    }
  }
  const allowedTransitions = {
    Confirmed: [ "Dispatched", "Cancelled"],
    Pending: ["Confirmed"],
    Dispatched: ["Delivered", "Cancelled"],
    Delivered: [], 
    Cancelled: [] 
  };
  
  const validateStatusChange = (currentStatus, newStatus) => {
    const allowed = allowedTransitions[currentStatus] || [];
    return allowed.includes(newStatus);
  };
  const handlestatuschange = async () => {
    if (!validatefield()) return;
    const orderToUpdate = orders.find((order) => order.orderId === formdata.order);
    if (!orderToUpdate) {
      setstatuserror("Order not found.");
      setformdata({
        order:'',
        statusid:'',
      })
      return;
    }
    const currentStatus = orderToUpdate.status;
  const newStatus = formdata.statusid;

  if (!validateStatusChange(currentStatus, newStatus)) {
   
    setstatuserror(
      `Cannot change status from "${currentStatus}" to "${newStatus}".`
    );
    setTimeout(() => {
      setstatuserror('');
    }, 3000);
    return;
  }
    try {
      const res = await axios.post(
        `/Api/order/changestatus?orderid=${formdata.order}&statusid=${formdata.statusid}`
      );
      if (res.status === 200) {
        if (res.data.message === "Order not found") {
          setstatuserror("Order not found.");
        } else {
          setstatuserror("");
          setOrders((prevOrders) =>
            prevOrders.map((order) =>
              order.orderId === formdata.order
                ? { ...order, status: formdata.statusid }
                : order
            )
          );
          setformdata({
            order:'',
            statusid:'',
          });
        }
      }
    } catch (error) {
      setstatuserror("An error occurred while updating status.");
    }
  };

// return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4 text-center">My Orders</h1>
//       <div className="flex flex-wrap space-x-4 mb-4">
//         <div className="">
//           <label htmlFor="vendorId" className="block mb-1">Retailer:</label>
//           <input
//             id="retailerId"
//             type="text"
//             value={retailerId}
//             onChange={(e) => setRetailerId(e.target.value.trim())}
//             className="px-2 h-10 w-full border rounded"
//             placeholder="Retailer ID"
//           />
//         </div>
//         <div className="">
//           <label htmlFor="status" className="block mb-1">Status:</label>
//           <select
//             id="status"
//             value={status}
//             onChange={(e) => setStatus(e.target.value.trim())}
//             className="px-3 h-10 w-full border rounded"
//           >
//             <option value=""></option>
//             <option value="Confirmed">Confirmed</option>
//             <option value="Pending">Pending</option>
//             <option value="Dispatched">Dispatched</option>
//             <option value="Delivered">Delivered</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>
//         </div>
//         <div className="">
//           <label htmlFor="orderId" className="block mb-1">Order ID:</label>
//           <input
//             id="orderId"
//             type="text"
//             value={orderId}
//             onChange={(e) => setOrderId(e.target.value.trim())}
//             className="px-2 h-10 w-full border rounded"
//             placeholder="Order ID"
//           />
//         </div>
//       </div>
//       {validationError && <div className="text-red-500">{validationError}</div>}
//       <h5 className="font-semibold">Set Status</h5>
//       <div className="flex flex-wrap space-x-4 mb-4">
        
//       <div className="">
//           <label htmlFor="status" className="block mb-1">Status:</label>
//           <select
//             id="statusid"
//             value={formdata.statusid}
//             onChange={handleformchange}
//             className="px-3 h-10 w-full border rounded"
//           >
//             <option value=""></option>
//             <option value="Pending">Pending</option>
//             <option value="Dispatched">Dispatched</option>
//             <option value="Delivered">Delivered</option>
//             <option value="Cancelled">Cancelled</option>
//           </select>
//         </div>

//         <div className="">
//           <label htmlFor="orderId" className="block mb-1">Order ID:</label>
//           <input
//             id="order"
//             type="text"
//             value={formdata.order}
//             onChange={handleformchange}
//             className="px-2 h-10 w-full border rounded"
//             placeholder="Order ID"
//           />
//         </div>
//         <div className="mt-[26px] border-none rounded-sm ">
//           <button className="mt-2 " onClick={handlestatuschange}><span className="bg-gray-200 px-3 py-2  font-semibold">Set</span></button>
//         </div>
//       </div>
//       {statuserror && <div className="text-red-500">{statuserror}</div>}


//       {loading && <div>Loading...</div>}
      

//       {!loading && (
//         <div className="overflow-x-auto">
//             {orders&&orders.length>0&&(<div><span>Orders: {orders.length}</span></div>)}
//           <div className="overflow-y-auto max-h-96">
//             <table className="table-auto w-full border-collapse border border-gray-200">
//               <thead className="bg-gray-100 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-400 text-white">
//                 <tr>
//                   <th className="border p-2">Order ID</th>
//                   <th className="border p-2">Order Status</th>
//                   <th className="border p-2">Retailer ID</th>
//                   <th className="border p-2">Products</th>
//                   <th className="border p-2">Total Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {orders &&orders.length > 0 ? (
//                   orders.map((order) => (
//                     <tr key={order._id} className="hover:bg-gray-200 h-[50px] ">
//                       <td className="border p-2">{order.orderId}</td>
//                       <td className="border p-2"><span
//               className={` py-2 px-2 w-[500px] rounded text-white text-sm ${
//                 order.status === "Confirmed"
//                   ? "bg-green-500 "
//                   : order.status === "Pending"
//                   ? "bg-yellow-500"
//                   : order.status === "Dispatched"
//                   ? "bg-blue-500"
//                   : order.status === "Delivered"
//                   ? "bg-purple-500"
//                   : order.status === "Cancelled"
//                   ? "bg-red-500"
//                   : "bg-gray-500"
//               }`}
//             >
//               {order.status}
//             </span></td>
//                       <td className="border p-2">{order.retailer}</td>
//                       <td className="border p-2">
//                         {order.products.map((product, idx) => (
//                           <div key={idx}>{product.productName}</div>
//                         ))}
//                       </td>
//                       <td className="border p-2">{order.orderprices.total}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="5" className="border p-2 text-center">
//                       No orders found
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyOrders;
return (
  <div className="container mx-auto p-4">
    <h1 className="text-2xl lg:text-3xl font-bold mb-4 text-center">My Orders</h1>

    {/* Filter Inputs */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
      <div>
        <label htmlFor="retailerId" className="block mb-1">Retailer:</label>
        <input
          id="retailerId"
          type="text"
          value={retailerId}
          onChange={(e) => setRetailerId(e.target.value.trim())}
          className="px-2 py-2 h-10 w-full border rounded focus:ring focus:ring-blue-300"
          placeholder="Retailer ID"
        />
      </div>
      <div>
        <label htmlFor="status" className="block mb-1">Status:</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value.trim())}
          className="px-3 py-2 h-10 w-full border rounded focus:ring focus:ring-blue-300"
        >
          <option value=""></option>
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
          className="px-2 py-2 h-10 w-full border rounded focus:ring focus:ring-blue-300"
          placeholder="Order ID"
        />
      </div>
    </div>

    {validationError && <div className="text-red-500 mb-4">{validationError}</div>}

    {/* Set Status Section */}
    <div className="mb-4">
      <h5 className="font-semibold mb-2">Set Status</h5>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label htmlFor="statusid" className="block mb-1">Status:</label>
          <select
            id="statusid"
            value={formdata.statusid}
            onChange={handleformchange}
            className="px-3 py-2 h-10 w-full border rounded focus:ring focus:ring-blue-300"
          >
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label htmlFor="order" className="block mb-1">Order ID:</label>
          <input
            id="order"
            type="text"
            value={formdata.order}
            onChange={handleformchange}
            className="px-2 py-2 h-10 w-full border rounded focus:ring focus:ring-blue-300"
            placeholder="Order ID"
          />
        </div>
        <div className="flex items-end">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:ring focus:ring-blue-300"
            onClick={handlestatuschange}
          >
            Set
          </button>
        </div>
      </div>
      {statuserror && <div className="text-red-500 mt-2">{statuserror}</div>}
    </div>

    {/* Order List */}
    {loading ? (
      <div>Loading...</div>
    ) : (
      <div className="overflow-x-auto">
        {orders && orders.length > 0 && (
          <div className="mb-4">
            <span>Orders: {orders.length}</span>
          </div>
        )}
        <div className="overflow-y-auto max-h-96">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 via-blue-400 to-blue-400 text-white">
              <tr>
                <th className="border p-2">Order ID</th>
                <th className="border p-2">Order Status</th>
                <th className="border p-2">Retailer ID</th>
                <th className="border p-2">Products</th>
                <th className="border p-2">Total Price</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-200 h-[50px]">
                    <td className="border p-2">{order.orderId}</td>
                    <td className="border p-2">
                      <span
                        className={`py-2 px-2 rounded text-white text-sm ${
                          order.status === "Confirmed"
                            ? "bg-green-500"
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
                      </span>
                    </td>
                    <td className="border p-2">{order.retailer}</td>
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

export default MyOrders;