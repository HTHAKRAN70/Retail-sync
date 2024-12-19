
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

function Vendordashboard() {
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [paymentError, setPaymentError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const { currentUser } = useSelector((state) => state.user);
  const [products,setproducts]=useState("");
  const totalproducts=useSelector((state)=>state.user.totalproducts);
  useEffect(()=>{
    console.log("totalproducts",totalproducts);
    setproducts(totalproducts);
  },[totalproducts]);
  useEffect(() => {
    if (currentUser && currentUser._id) {
      console.log("curr",currentUser);
      const fetchnumbers=async()=>{
        try{
          const res=await axios.get(`Api/vendor/getvendorsproducts?vendor_id=${currentUser._id}`)
          setproducts(res.data);
        }catch(error){

        }
      }



      
      const fetchPayments = async () => {
        try {
          const res = await axios.get(`Api/payment/getpayment/${currentUser._id}`);

          if (res.status === 200) {
            if (res.data.message) {
              setPaymentError(res.data.message); // Set error message if available
            } else {
              setPaymentHistory(res.data); // Set payment history
              // Calculate total amount from the payment history
              const total = res.data.reduce((sum, payment) => sum + parseFloat(payment.Amount || 0), 0);
              setTotalAmount(total);
            }
          }
        } catch (error) {
          console.log('Error fetching payments:', error);
          setPaymentError('Error fetching payments'); // General error message
        }
      };

      fetchPayments();
      fetchnumbers();
    }
  }, [currentUser]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* User Information Section */}
      {currentUser && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6 flex items-center">
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">My Profile</h2>
            <p className="text-gray-700"><strong>Username:</strong> {currentUser.username}</p>
            <p className="text-gray-700"><strong>Email:</strong> {currentUser.email}</p>
            <p className="text-gray-700"><strong>Phone:</strong> {currentUser.phone_no}</p>
            <p className="text-gray-700"><strong>Total Products:</strong> {products}</p>
          </div>
          <div className="ml-6">
            <img
              src={currentUser.profilePicture}
              alt="Vendor Profile"
              className="border w-[200px] h-[210px] rounded-md  shadow-md border border-gray-300"
            />
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-blue-100 shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Summary</h2>
        <div className="grid grid-cols-2 gap-4">
          <p className="text-lg text-gray-700"><strong>Total Orders:</strong> {paymentHistory.length}</p>
          <p className="text-lg text-gray-700"><strong>Total Amount Received:</strong> ₹{totalAmount.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Payment History</h2>
        {paymentError && <p className="text-red-500 mb-4">{paymentError}</p>}

        {paymentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-200 text-left">
                  <th className="p-3 border border-gray-300">Order ID</th>
                  <th className="p-3 border border-gray-300">Retailer Name</th>
                  <th className="p-3 border border-gray-300">Retailer ID</th>
                  <th className="p-3 border border-gray-300">Date</th>
                  <th className="p-3 border border-gray-300">Amount</th>
                </tr>
              </thead>
              <tbody>
                {paymentHistory.map((payment, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="p-3 border border-gray-300">{payment.Order_id}</td>
                    <td className="p-3 border border-gray-300">{payment.Retailer}</td>
                    <td className="p-3 border border-gray-300">{payment.retailer_id}</td>
                    <td className="p-3 border border-gray-300">{payment.Date}</td>
                    <td className="p-3 border border-gray-300">₹{payment.Amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !paymentError && <p className="text-gray-700">No payment history found.</p>
        )}
      </div>
    </div>
  );
}

export default Vendordashboard;

