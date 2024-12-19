import React, { useState,useEffect } from 'react';
import { Layout } from 'antd';
import CustomHeader from '../components/CustomHeader';
import Logo from '../components/Logo';
import MenuList from '../components/MenuList';
import InventoryManagement from '../components/InventoryManagement';
import Vendordashoboard from '../components/Vendordashoboard';
import '../index.css';
import { useLocation ,useNavigate} from 'react-router-dom';
import MyOrders from '../components/MyOrders.jsx'
import OrderManagement from '../components/OrderManagement.jsx';
import { useSelector } from 'react-redux';
const { Sider, Content } = Layout;

const VendorHome = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchText, setSearchText] = useState('');
  const {currentUser}=useSelector((state)=>state.user);
  const navigate=useNavigate();
  if(!currentUser){
    navigate('/signup');
  }

  const location = useLocation();
  const [tab, setTab] = useState('vendor');
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get('tab');
    if (tabFromUrl) {
      setTab(tabFromUrl);
    }
  }, [location.search]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsed={collapsed} collapsible trigger={null} className="sidebar">
        <Logo />
        <MenuList />
      </Sider>
      <Layout>
        <CustomHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        {/* <hr /> */}
        <Content style={{ margin: ' 0', padding: '24px', background: '#fff' }}>
          {/* {tab==inventroy} */}
          {tab ==='vendor'&&<Vendordashoboard />}
          {tab === 'Items' &&<InventoryManagement/>}
          {tab === 'Order-manage' && <OrderManagement/>}
          {tab === 'MyOrders' && <MyOrders/>}
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default VendorHome;