// // import {Avatar, Button,Dropdown,Navbar,TextInput} from 'flowbite-react';
// // import {AiOutlineSearch} from 'react-icons/ai';
// // import {Link,useLocation, useNavigate} from 'react-router-dom';
// // import {useSelector,useDispatch } from 'react-redux';
// // import { useEffect,useState } from 'react';

// // function Header() {
// //     const path=useLocation().pathname;
// //     const {currentUser}=useSelector(state=>state.user);
// //     const dispatch=useDispatch();
// //     const [searchterm,setsearchterm]=useState('');
// //     const location =useLocation().pathname;
// //     const navigate = useNavigate();
// //     useEffect(()=>{
// //       const urlParams=new URLSearchParams(location.search);
// //       const searchtermfromurl =urlParams.get('searchTerm');
// //       if(searchtermfromurl ){
// //         setsearchterm(searchtermfromurl);
// //       }

// //     },[location.search]);



// //     const handlesignout=async()=>{
// //       try{
// //         const res=await fetch('Api/vendor/signout',{
// //           method:'POST',
// //         });
// //         const data=await res.json();
// //         if (!res.ok) {
// //           console.log(data.message);
// //         } else{
// //           navigate('/signin');
// //         }
// //       }catch(error){
// //         console.log(error);
// //       }

// //   }

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     const urlParams = new URLSearchParams(location.search);
// //     urlParams.set('searchTerm', searchterm);
// //     const searchQuery = urlParams.toString();
// //     navigate(`/search?${searchQuery}`);
// //   };


// //   return (
// //     <Navbar className="border-b-2 ">
// //         <div
// //         className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold '>
// //         <span className='
// //         px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'>{currentUser.username} Inventory</span>
// //         </div>
// //         <div className='flex gap-2 md:order-2'>
            
// //             {currentUser && (
// //           <Dropdown
// //             arrowIcon={false}
// //             inline
// //             label={
// //               <Avatar alt='user' img={currentUser.profilePicture} rounded />
// //             }
// //           >
// //             <Dropdown.Header>
// //               <span className='block text-sm'>@{currentUser.username}</span>
// //               <span className='block text-sm font-medium truncate'>
// //                 {currentUser.email}
// //               </span>
// //             </Dropdown.Header>
// //             <hr />
// //             <Dropdown.Divider />
// //             <Dropdown.Item onClick={handlesignout}>Signout</Dropdown.Item>
// //             </Dropdown>
// //         ) }
            

// //         </div>

// //     </Navbar>
// //   )
// // }

// // export default Header
// import { Avatar, Button, Dropdown, Navbar, TextInput } from 'flowbite-react';
// import { AiOutlineSearch } from 'react-icons/ai';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { useSelector, useDispatch } from 'react-redux';
// import { useEffect, useState } from 'react';
// import {signoutSuccess} from '../Redux/user/userSlice.js';

// function Header() {
//   const path = useLocation().pathname;
//   const { currentUser } = useSelector((state) => state.user);
//   const dispatch = useDispatch();
//   const [searchterm, setsearchterm] = useState('');
//   const location = useLocation().pathname;
//   const navigate = useNavigate();
//   useEffect(() => {
//     if (!currentUser) {
//       navigate('/signup');
//     }
//   }, [currentUser, navigate]);
//   useEffect(() => {
//     const urlParams = new URLSearchParams(location.search);
//     const searchtermfromurl = urlParams.get('searchTerm');
//     if (searchtermfromurl) {
//       setsearchterm(searchtermfromurl);
//     }
//   }, [location.search]);

//   const handlesignout = async () => {
//     try {
//       const res = await fetch('Api/vendor/signout', {
//         method: 'POST',
//       });
//       const data = await res.json();
//       if (!res.ok) {
//         console.log(data.message);
//       } else {
//         dispatch(signoutSuccess());
//         navigate('/signin');
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const urlParams = new URLSearchParams(location.search);
//     urlParams.set('searchTerm', searchterm);
//     const searchQuery = urlParams.toString();
//     navigate(`/search?${searchQuery}`);
//   };

//   return (
//     <Navbar className="border-b-2 bg-slate-400">
//       <div className="flex items-center justify-between w-full">
//         {/* Logo Section */}
//         <div
//           className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold"
//         >
//           <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
//             {currentUser.username} Inventory
//           </span>
//         </div>

//         {/* Profile Section */}
//         <div className="flex items-center gap-2 md:order-2">
//           {currentUser && (
//             <Dropdown
//               arrowIcon={false}
//               inline
//               label={
//                 <Avatar alt="user" img={currentUser.profilePicture} rounded />
//               }
//             >
//               <Dropdown.Header>
//                 <span className="block text-sm">@{currentUser.username}</span>
//                 <span className="block text-sm font-medium truncate">
//                   {currentUser.email}
//                 </span>
//               </Dropdown.Header>
//               <hr />
//               <Dropdown.Divider />
//               <Dropdown.Item onClick={handlesignout}>Signout</Dropdown.Item>
//             </Dropdown>
//           )}
//         </div>
//       </div>
//     </Navbar>
//   );
// }

// export default Header;
import { Avatar, Button, Dropdown, Navbar } from 'flowbite-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { signoutSuccess } from '../Redux/user/userSlice.js';

function Header() {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [searchterm, setsearchterm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to signup if currentUser is not available
  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchtermfromurl = urlParams.get('searchTerm');
    if (searchtermfromurl) {
      setsearchterm(searchtermfromurl);
    }
  }, [location.search]);

  const handlesignout = async () => {
    try {
      const res = await fetch('Api/vendor/signout', {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        dispatch(signoutSuccess());
        navigate('/signin');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('searchTerm', searchterm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <Navbar className="border-b-2 bg-slate-400">
      <div className="flex items-center justify-between w-full">
        {/* Logo Section */}
        <div className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold">
          <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white">
            {currentUser?.username} Inventory
          </span>
        </div>

        {/* Profile Section */}
        <div className="flex items-center gap-2 md:order-2">
          {currentUser && (
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <Avatar alt="user" img={currentUser.profilePicture} rounded />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">@{currentUser.username}</span>
                <span className="block text-sm font-medium truncate">
                  {currentUser.email}
                </span>
              </Dropdown.Header>
              <hr />
              <Dropdown.Divider />
              <Dropdown.Item onClick={handlesignout}>Signout</Dropdown.Item>
            </Dropdown>
          )}
        </div>
      </div>
    </Navbar>
  );
}

export default Header;

