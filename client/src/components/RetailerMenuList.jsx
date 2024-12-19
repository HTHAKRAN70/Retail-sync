// // src/components/MenuList.js
// import React from 'react';
// import {Link,useNavigate} from 'react-router-dom';
// import { Menu } from 'antd';
// import { HomeOutlined, AreaChartOutlined,FileTextOutlined, AccountBookOutlined, FundViewOutlined, SubnodeOutlined, MailOutlined,ShoppingCartOutlined } from '@ant-design/icons';
// import { FaShoppingCart } from 'react-icons/fa';
// import '../index.css';
// import { useSelector,useDispatch } from 'react-redux';

// const MenuList = () => {
//   const {currentUser}=useSelector((state)=>state.user);
//   if(!currentUser){
//     navigate('/signup');
//   }
//   const navigate=useNavigate();
//   const handlehomeclick=()=>{
//       navigate('/home?tab=vendors');
//   }
//   const handlecartclick=()=>{
//     navigate('/home?tab=cart');
//   }
//   const handleorderclick=()=>{
//     navigate('/home?tab=order');
//   }
//   return (
//     <Menu theme="dark" mode="inline" className="Menu-bar">
//       <Menu.Item key="home" icon={<HomeOutlined />} onClick={handlehomeclick}>
//       Home
//       </Menu.Item>
//       <Menu.Item key="purchases-task-2" icon={<FileTextOutlined />} onClick={handleorderclick}>Orders</Menu.Item>
//       <Menu.Item key="cart" icon={<ShoppingCartOutlined />} onClick={handlecartclick}>
//       Cart
//       </Menu.Item>
      
//     </Menu>
//   );
// };

// export default MenuList;
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { HomeOutlined, FileTextOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import '../index.css';

const MenuList = () => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!currentUser) {
    navigate('/signup');
  }

  // Extract tab from query parameters
  const urlParams = new URLSearchParams(location.search);
  const activeTab = urlParams.get('tab') || 'vendors'; // Default to 'vendors' if no tab query is present

  // Handle menu item clicks
  const handleHomeClick = () => {
    navigate('/home?tab=vendors');
  };

  const handleCartClick = () => {
    navigate('/home?tab=cart');
  };

  const handleOrderClick = () => {
    navigate('/home?tab=order');
  };

  return (
    <Menu
      theme="dark"
      mode="inline"
      selectedKeys={[activeTab]} // Dynamically set the active tab based on the query parameter
      className="Menu-bar"
    >
      <Menu.Item key="vendors" icon={<HomeOutlined />} onClick={handleHomeClick}>
        Home
      </Menu.Item>
      <Menu.Item key="order" icon={<FileTextOutlined />} onClick={handleOrderClick}>
        Orders
      </Menu.Item>
      <Menu.Item key="cart" icon={<ShoppingCartOutlined />} onClick={handleCartClick}>
        Cart
      </Menu.Item>
    </Menu>
  );
};

export default MenuList;
