
import { FireFilled  } from '@ant-design/icons';
import React from 'react';
import {Link} from 'react-router-dom';
import { useSelector } from 'react-redux';

const Logo = () => {
  const {currentUser}=useSelector(state=>state.user);
  return (
    <div className=" flex ">
      <div className=" mt-2">
       <FireFilled className='mt-2 ml-5' />
       <span className='
        px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>Retail</span>
        Sync
        
      </div>
    </div>
  );
};

export default Logo;