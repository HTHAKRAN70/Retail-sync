// import React, { useState } from 'react';
// import axios from 'axios';
// import { useDispatch,useSelector } from 'react-redux';
// import { addProductToVendor, removeProductFromVendor } from '../Redux/cart/cartSlice'; // Adjust the path to your slice
// import ImageModal from './ImageModal'; 
// const ProductItem = ({ product }) => {
//     const [quantity, setQuantity] = useState(1);
//     const [modalOpen, setModalOpen] = useState(false);

//     const discountedPrice = product.price - (product.price * product.discount) / 100;
//     const [amount, setAmount] = useState(discountedPrice);
//     const [isDisabled,setisDisabled]=useState(false);
//     const {currentUser}=useSelector((state)=>state.user);
//     // console.log("current",currentUser._id);
//     const handleAddToCart = async() => {
//         setisDisabled(true);
//          const formdata = {
//             userId:currentUser._id,
//             productId:product._id,
//         };
//         try{
//             const res = await fetch('/Api/cart/add',{
//                 method:'Post',
//                 headers:{
//                     'Content-Type':'application/json',
//                   },
//                   body:JSON.stringify(formdata),
//             });
//             if(res.ok){
//                 // console.log('Cart updated:',res);
//             }else{
//                 console.log('Failer to update cart',res);
//             }
//         }catch(error){
//             console.log("this is the error",error);
//         }    
//     };
//     return (
//         <div className="bg-white p-4 rounded shadow-lg">
//             <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-48 object-cover rounded cursor-pointer"
//                 onClick={() => setModalOpen(true)}
//             />
//             <h3 className="text-lg font-semibold">{product.name}</h3>
//             <p>{product.description}</p>
//             <p>Original Price: ${product.price}</p>
//             <p>Discount: {product.discount}%</p>
//             <p>Discounted Price: ${discountedPrice}</p> {/* Show discounted price */}
//             <button
//                 onClick={handleAddToCart}
//                 className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg"
//                 disabled={isDisabled}
//             >
//                 Add to Cart
//             </button>
//             {modalOpen && (
//                 <ImageModal image={product.image} descritpion={product.description} onClose={() => setModalOpen(false)} />
//             )}
//         </div>
//     );
// };

// export default ProductItem;
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { addProductToVendor, removeProductFromVendor } from '../Redux/cart/cartSlice'; // Adjust the path to your slice
import ImageModal from './ImageModal'; 

const ProductItem = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [modalOpen, setModalOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false); // Track if button is clicked
    const [buttonText, setButtonText] = useState("Add to Cart");
    const [buttonColor, setButtonColor] = useState("bg-blue-500"); // Initial color

    const discountedPrice = product.price - (product.price * product.discount) / 100;
    const { currentUser } = useSelector((state) => state.user);

    const handleAddToCart = async () => { 
        const formdata = {
            userId: currentUser._id,
            productId: product._id,
        };

        try {
            const res = await fetch('/Api/cart/add', {
                method: 'Post',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formdata),
            });

            if (res.ok) {
                setButtonText("Added to Cart"); // Change button text when success
            } else {
                console.log('Failed to update cart', res);
                setButtonText("Try Again"); // Show error message if cart update fails
            }
        } catch (error) {
            console.log("Error: ", error);
            setButtonText("Error - Try Again"); // Show error message if API call fails
        }
    };

    return (
        <div className="bg-white p-4 rounded shadow-lg">
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded cursor-pointer"
                onClick={() => setModalOpen(true)}
            />
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p>{product.description}</p>
            <p>Original Price: ₹{product.price}/{product.unit}</p>
            <p>Discount: {product.discount}%</p>
            <p>Discounted Price: ₹{discountedPrice}</p> {/* Show discounted price */}

            <button
                onClick={handleAddToCart}
                className='bg-blue-500 text-white p-2 border rounded-md transition transform duration-150 ease-in-out hover:opacity-75 active:scale-95 hover:cursor-pointer '
                disabled={isDisabled}
            >
                {buttonText} {/* Change button text */}
            </button>

            {modalOpen && (
                <ImageModal image={product.image} description={product.description} onClose={() => setModalOpen(false)} />
            )}
        </div>
    );
};

export default ProductItem;

