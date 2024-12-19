import { current } from '@reduxjs/toolkit';
import React from 'react';
import { useState,useEffect } from 'react';
import { useSelector } from 'react-redux';
import {useLocation,useNavigate} from 'react-router-dom';
import ProductItem from './ProductItem';
function Store() {
  const location=useLocation();
  const queryparams=new URLSearchParams(location.search);
  const vendor_id=queryparams.get('vendorid');
  const [currentshop,setcurrentshop]=useState({});
  const [products,setproducts]=useState([]);
  const [totalproduct,settotalproduct]=useState(0);
  const navigate=useNavigate();
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`Api/product/getproduct?vendor_id=${vendor_id}`);
        const data = await res.json();
        if (res.ok) {
              setproducts(data.product);
              settotalproduct(data.totalProducts);  
        }else{
          console.log("sdf");
        }
      } catch (error) {
        console.log(error);
      }
    };
      fetchPosts();
  }, [currentshop]);
  useEffect(()=>{
    const fetchvendor =async ()=>{
      try{
        const res=await fetch(`Api/vendor/getvendors?vendor_id=${vendor_id}`)
        const data=await res.json();
        if(res.ok){
          setcurrentshop(data.vendors);
        }else{
          console.log("b",data.message);
        }
      }catch(err){
        console.log(err);
      }
    }
    fetchvendor();
  },[]);
  const handleback=()=>{
    navigate('/home?tab=vendors');
  }
  return (
    <div className='bg-slate-100 mt-1 min-h-screen'>
      
      <hr className='mx-2' />
      <div>
      <div className="flex justify-end">
    <button onClick={handleback} className='m-2 p-2 bg-gray-400 text-black text-lg rounded border border-gray-500'>
      {"<-"} Back
    </button>
  </div>
  </div>
      <h3 className='ml-2 mb-3'>Products ({totalproduct})</h3>
      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
                <ProductItem key={product._id} product={product} />
            ))}
        </div>
  </div>
  )
}

export default Store