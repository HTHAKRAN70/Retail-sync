// import React, { useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Menu, Badge, notification } from 'antd';
// import {
//   HomeOutlined,
//   AreaChartOutlined,
//   ShoppingCartOutlined,  // For Items
//   FileTextOutlined,      // For Orders
//   UserOutlined,          // For Customers
//   MessageOutlined,       // For Chat
// } from '@ant-design/icons';
// import { io } from 'socket.io-client';
// import axios from 'axios';
// import { useSelector,useDispatch } from 'react-redux';
// import { setPendingOrders } from '../Redux/user/userSlice.js';

// const MenuList = () => {
//   const {currentUser}=useSelector((state)=>state.user);
//   console.log("currentuser",currentUser);
//   const vendorId = currentUser._id;
//   const navigate = useNavigate();
//   useEffect(()=>{
//       if(!currentUser){
//         navigate('/signin');
//       }
//     },[navigate,currentUser]);
//   const [orderNotifications, setOrderNotifications] = useState([]);
//   const [ordersnu, setordernu] = useState();
//   const [showSalesBadge, setShowSalesBadge] = useState(false);
//   const [showNewOrderBadge, setShowNewOrderBadge] = useState(false);
//   const [firstorder,setfirstorder]=useState(1);

//   const socket = io('http://localhost:5173');
//   const dispatch=useDispatch();
//   useEffect(() => {
//     const fetchordernumber = async () => {
//       try {
//         const res = await axios.get(`/Api/order/getnumber?vendor_id=${vendorId}`);
//         if (res.status === 200) {
//           console.log("res", res.data);
//           dispatch(setPendingOrders(res.data));
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     fetchordernumber();
//   }, [vendorId]);
//   let pendingOrdersCount = useSelector((state) => state.user.pendingorders);
 
//   useEffect(() => {
//     socket.emit('registerVendor', vendorId);
//     socket.on('newOrderNotification', (data) => {
//       console.log('New order received:', data);
//       dispatch(setPendingOrders(pendingOrdersCount+1));
//       pendingOrdersCount++;
//       setShowSalesBadge(true);
//       setShowNewOrderBadge(true);
//       notification.info({
//         message: 'New Order Received',
//         description: `You have received a new order.`,
//         placement: 'topRight',
//       });
//     });
//     return () => {
//       socket.disconnect();
//     };
//   }, [vendorId]);

//   useEffect(() => {
//     console.log("pendingorders",pendingOrdersCount);
//     if (pendingOrdersCount&&pendingOrdersCount > 0) {
//       setShowNewOrderBadge(true);
//       notification.info({
//         message: 'Order confirmation',
//         description: `You still have ${pendingOrdersCount}* orders pending confirmation.`,
//         placement: 'topRight',
//       });
//     }
//   }, [pendingOrdersCount]);

//   const handleNewOrdersClick = () => {
//     setShowNewOrderBadge(false);
//     navigate('/home?tab=Order-manage'); // Clear "New Orders" badge when clicked
//   };

//   const handleitemclick = () => {
//     navigate('/home?tab=Items');
//   };
//   const handlechatapp = () => {
//     navigate('/home?tab=chat');
//   };
//   const handlemyorder=()=>{
//     navigate('/home?tab=MyOrders');
//   }

//   return (
//     <Menu theme="dark" mode="inline" className="Menu-bar">
//       {/* Home */}
//       <Menu.Item key="home" icon={<HomeOutlined />} onClick={()=>navigate('/home?tab=vendor')}>
//        Home
//       </Menu.Item>

//       {/* Items */}
//       <Menu.Item key="inventory-task-1" onClick={handleitemclick} icon={<ShoppingCartOutlined />}>
//         Items
//       </Menu.Item>

//       {/* New Order */}
//       <Menu.Item key="sales-task-4" onClick={handleNewOrdersClick} icon={<FileTextOutlined />}>
//         New Order
//         {showNewOrderBadge && (
//           <span className="ml-1 px-2 bg-red-700 text-white border rounded-xl">
//             {pendingOrdersCount>=1?pendingOrdersCount:firstorder}
//           </span>
//         )}
//       </Menu.Item>
//       <Menu.Item key="sales-task-1" onClick={handlemyorder}  icon={<FileTextOutlined />}>
//         Orders
//       </Menu.Item>
//       <Menu.Item key="sales-task-2" onClick={handlechatapp}  icon={<MessageOutlined />}>
//        Chat with {currentUser.roll=='vendor'?'Retailers':'Vendors'}
//       </Menu.Item>
//     </Menu>
//   );
// };

// export default MenuList;

// MenuList.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, notification } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  FileTextOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { io } from 'socket.io-client';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { setPendingOrders } from '../Redux/user/userSlice.js';

const MenuList = () => {
  const { currentUser } = useSelector((state) => state.user);
  const pendingOrdersCountFromStore = useSelector((state) => state.user.pendingorders);
  const pendingRef = useRef(pendingOrdersCountFromStore);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    pendingRef.current = pendingOrdersCountFromStore;
  }, [pendingOrdersCountFromStore]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
    }
  }, [navigate, currentUser]);

  const [showNewOrderBadge, setShowNewOrderBadge] = useState(false);
  const socketRef = useRef(null);

  // create socket once when currentUser is available
  useEffect(() => {
    if (!currentUser?._id) return;

    // connect to backend socket server (note port 3000)
    const socket = io('http://localhost:3000', {
      query: {
        userId: currentUser._id,
        userType: currentUser.roll || 'vendor'
      },
      transports: ['websocket'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('socket connected', socket.id);
    });

    // optional: listen to online users updates
    socket.on('getOnlineUsers', (list) => {
      // you can use this if you want to display online users
      console.log('online users list', list);
    });

    socket.on('newOrderNotification', (data) => {
      console.log('New order received:', data);
      // increment local ref and update redux store
      const newCount = (pendingRef.current || 0) + 1;
      pendingRef.current = newCount;
      dispatch(setPendingOrders(newCount));
      setShowNewOrderBadge(true);

      notification.info({
        message: 'New Order Received',
        description: 'You have received a new order.',
        placement: 'topRight',
      });
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [currentUser, dispatch]);

  // fetch initial pending order count once
  useEffect(() => {
    const fetchOrderNumber = async () => {
      if (!currentUser?._id) return;
      try {
        const res = await axios.get(`/Api/order/getnumber?vendor_id=${currentUser._id}`);
        if (res.status === 200) {
          dispatch(setPendingOrders(res.data));
          // keep ref in sync
          pendingRef.current = res.data;
          if (res.data > 0) setShowNewOrderBadge(true);
        }
      } catch (error) {
        console.error('fetchOrderNumber error', error);
      }
    };
    fetchOrderNumber();
  }, [currentUser, dispatch]);

  const pendingOrdersCount = useSelector((state) => state.user.pendingorders);

  const handleNewOrdersClick = () => {
    setShowNewOrderBadge(false);
    navigate('/home?tab=Order-manage');
  };

  const handleItemClick = () => {
    navigate('/home?tab=Items');
  };
  const handleChatApp = () => {
    navigate('/home?tab=chat');
  };
  const handleMyOrder = () => {
    navigate('/home?tab=MyOrders');
  };

  return (
    <Menu theme="dark" mode="inline" className="Menu-bar">
      <Menu.Item key="home" icon={<HomeOutlined />} onClick={() => navigate('/home?tab=vendor')}>
        Home
      </Menu.Item>

      <Menu.Item key="inventory-task-1" onClick={handleItemClick} icon={<ShoppingCartOutlined />}>
        Items
      </Menu.Item>

      <Menu.Item key="sales-task-4" onClick={handleNewOrdersClick} icon={<FileTextOutlined />}>
        New Order
        {showNewOrderBadge && (
          <span className="ml-1 px-2 bg-red-700 text-white border rounded-xl">
            {pendingOrdersCount >= 1 ? pendingOrdersCount : 1}
          </span>
        )}
      </Menu.Item>

      <Menu.Item key="sales-task-1" onClick={handleMyOrder} icon={<FileTextOutlined />}>
        Orders
      </Menu.Item>

      <Menu.Item key="sales-task-2" onClick={handleChatApp} icon={<MessageOutlined />}>
        Chat with {currentUser?.roll === 'vendor' ? 'Retailers' : 'Vendors'}
      </Menu.Item>
    </Menu>
  );
};

export default MenuList;
