
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import { HomeOutlined, FileTextOutlined, ShoppingCartOutlined, MessageOutlined } from '@ant-design/icons';
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

  const handleChatClick = () => {
    navigate('/home?tab=chat');
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
      <Menu.Item key="chat" icon={<MessageOutlined />} onClick={handleChatClick}>
        Chat
      </Menu.Item>
    </Menu>
  );
};

export default MenuList;
