
import React, { useState,useEffect } from 'react';
import { Layout } from 'antd';
import Retailerdashboard from '../components/Retailerdashboard.jsx';
import CustomHeader from '../components/CustomHeader';
import Logo from '../components/Logo';
import InventoryManagement from '../components/InventoryManagement';
import RetailerMenuList from '../components/RetailerMenuList.jsx';
import '../index.css';
import Store from '../components/Store.jsx';
import Cart from '../components/Cart.jsx';
import { useSelector } from 'react-redux';
import { useLocation ,useNavigate} from 'react-router-dom';
import RetailerInventory from '../components/RetailerInventory.jsx';
import RetailerOrders from '../components/RetailerOrders.jsx';
const { Sider, Content } = Layout;

const RetailerHome = () => {
  const navigate=useNavigate();
  
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('');
  const location = useLocation();
  const [tab, setTab] = useState('vendors');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
   
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);
  const {currentUser}=useSelector((state)=>state.user);
  if(!currentUser){
    navigate('/signup');
  }
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsed={collapsed} collapsible trigger={null} className="sidebar">
        <Logo />
        <RetailerMenuList />
      </Sider>
      <Layout>
        <CustomHeader
          // collapsed={collapsed}
          // setCollapsed={setCollapsed}
          // setSearchText={setSearchText}
          
        />
        <Content style={{ background: '#fff' }}>
          {tab === 'vendors' && <Retailerdashboard/>}
          {tab === 'store' &&<Store/>}
          {tab === 'cart' && <Cart/>}
          {tab === 'order' &&<RetailerOrders/>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default RetailerHome;