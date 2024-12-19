import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './pages/Signup';
import Signin from './pages/Signin';
import RetailerHome from './pages/RetailerHome';
import VendorHome from './pages/VendorHome';
import RetailerBlog from './pages/RetailerBlog';
import DeliveryPartner from './pages/DeliveryPartner';
import Wholesaler from './pages/Wholesaler';
import { useSelector } from 'react-redux';
// import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import './App.css';

function App() {
  const { currentUser } = useSelector(state => state.user);
  console.log
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/Retaile-blog' element={<RetailerBlog />} />
        <Route path='/Wholesaler-blog' element={<Wholesaler/>} />
        <Route path='/Delivery-blog' element={<DeliveryPartner/>} />
        <Route path='/home' element={
  currentUser && currentUser.roll === 'vendor' 
    ? <VendorHome /> 
    : <RetailerHome />}
    />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
