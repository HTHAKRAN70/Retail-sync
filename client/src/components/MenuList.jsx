import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Badge, notification } from 'antd';
import {
  HomeOutlined,
  AreaChartOutlined,
  ShoppingCartOutlined,  // For Items
  FileTextOutlined,      // For Orders
  UserOutlined,          // For Customers
} from '@ant-design/icons';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector,useDispatch } from 'react-redux';
import { setPendingOrders } from '../Redux/user/userSlice.js';

const MenuList = () => {
  const {currentUser}=useSelector((state)=>state.user);
  
  const vendorId = currentUser._id;
  const navigate = useNavigate();
  useEffect(()=>{
      if(!currentUser){
        navigate('/signin');
      }
    },[navigate,currentUser]);
  const [orderNotifications, setOrderNotifications] = useState([]);
  const [ordersnu, setordernu] = useState();
  const [showSalesBadge, setShowSalesBadge] = useState(false);
  const [showNewOrderBadge, setShowNewOrderBadge] = useState(false);
  const [firstorder,setfirstorder]=useState(1);

  const socket = io('http://localhost:3000');
  const dispatch=useDispatch();
  useEffect(() => {
    const fetchordernumber = async () => {
      try {
        const res = await axios.get(`/Api/order/getnumber?vendor_id=${vendorId}`);
        if (res.status === 200) {
          console.log("res", res.data);
          dispatch(setPendingOrders(res.data));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchordernumber();
  }, [vendorId]);
  const pendingOrdersCount = useSelector((state) => state.user.pendingorders);

  useEffect(() => {
    socket.emit('registerVendor', vendorId);
    socket.on('newOrderNotification', (data) => {
      console.log('New order received:', data);
      setOrderNotifications((prev) => [...prev, data.orderDetails]);
      setShowSalesBadge(true);
      setShowNewOrderBadge(true);

      // Show notification
      notification.info({
        message: 'New Order Received',
        description: `You have received a new order.`,
        placement: 'topRight',
      });
    });
    return () => {
      socket.disconnect();
    };
  }, [vendorId]);

  useEffect(() => {
    console.log("pendingorders",pendingOrdersCount);
    if (pendingOrdersCount&&pendingOrdersCount > 0) {
      setShowNewOrderBadge(true);
      notification.info({
        message: 'Order confirmation',
        description: `You still have ${pendingOrdersCount}* orders pending confirmation.`,
        placement: 'topRight',
      });
    }
  }, [pendingOrdersCount]);

  const handleNewOrdersClick = () => {
    setShowNewOrderBadge(false);
    navigate('/home?tab=Order-manage'); // Clear "New Orders" badge when clicked
  };

  const handleitemclick = () => {
    navigate('/home?tab=Items');
  };
  const handlemyorder=()=>{
    navigate('/home?tab=MyOrders');
  }

  return (
    <Menu theme="dark" mode="inline" className="Menu-bar">
      {/* Home */}
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={()=>navigate('/home?tab=vendor')}>
       Home
      </Menu.Item>

      {/* Items */}
      <Menu.Item key="inventory-task-1" onClick={handleitemclick} icon={<ShoppingCartOutlined />}>
        Items
      </Menu.Item>

      {/* New Order */}
      <Menu.Item key="sales-task-4" onClick={handleNewOrdersClick} icon={<FileTextOutlined />}>
        New Order
        {showNewOrderBadge && (
          <span className="ml-1 px-2 bg-red-700 text-white border rounded-xl">
            {pendingOrdersCount>=1?pendingOrdersCount:firstorder}
          </span>
        )}
      </Menu.Item>
      <Menu.Item key="sales-task-1" onClick={handlemyorder}  icon={<FileTextOutlined />}>
        Orders
      </Menu.Item>
    </Menu>
  );
};

export default MenuList;

