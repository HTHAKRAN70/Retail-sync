import React, { useEffect,useRef, useState } from 'react';
import {Container, TextField,Typography } from "@mui/material";
import axios from 'axios';
import '../index.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
// import { useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa'; 
import { Table,Button, Modal,FileInput, Select, TextInput } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import InventoryManagementTable from './InventoryManagementTable.jsx';
import {setproductslength,decreaseproducts } from '../Redux/user/userSlice.js';
import { useSelector,useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
const InventoryManagement = ({ searchText }) => {
  const dispatch=useDispatch();
  const fileInputRef = useRef(null);
  const [vendorproduct, setVendorProduct] = useState([]);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { currentUser } = useSelector(state => state.user);
  const [formData, setFormData] = useState({
    name:'',
    description:'',
    price:'',
    category:'',
    unit:'',
    quantity:'',
    image:'',
    vendor_id:currentUser._id
  });
  const navigate=useNavigate();
  
  const [file,setFile]=useState();
  const [formtext,setformtext]=useState('Add Product');
  const [showMore,setshowMore]=useState(true);
  const [publishsuccess,setpublishsuccess]=useState();
  const [PublishError,setPublishError]=useState();
  const [change ,setchange]=useState(true);
  const [formErrors, setFormErrors] = useState({
    name:'',
    description:'',
    price:'',
    quantity:'',
    image:'',
    category:'',
    unit:'',
    discount:''
  });
  useEffect(()=>{
    if(!currentUser){
      navigate('/signin');
    }
    setFormData({...formData,vendor_id:currentUser._id})
  },[currentUser]);

  const optionsUnit = [
    { value: "piece", label: "Piece" },
    { value: "kg", label: "KG" },
    { value: "box", label: "Box" },
    { value: "meter", label: "Meter" },
    { value: "litre", label: "Litre" },
  ];
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setImageUploaded(false);
    setImageUploaded(false); 
  };
  const handlebuttonchange=()=>{
    setFile(null);
    setImageUploadProgress(0);
    setImageUploaded(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
    }
   }

  useEffect(() => {
    const fetchposts = async () => {
        try {
            const res = await fetch(`/Api/product/getproduct?vendor_id=${currentUser._id}`);
            const data = await res.json();
            if (res.ok) {
              // console.log("this is",data.product);
              dispatch(setproductslength(data.product.length));
                setVendorProduct(data.product);
                // console.log("products length",data.product);
                // dispatch(setproductslength(data.product));
                if (data.products.length < 9) {
                    setshowMore(false);
                }
            }
        } catch (error) {
            console.log(error.message);
        }
    };
    if (currentUser.roll==='vendor') {
        fetchposts();
    }
}, []);

const handleDelete = async (id) => {
  try {
    const res = await fetch(`/Api/product/deleteproduct?productId=${id}&&vendorId=${currentUser._id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      setVendorProduct(vendorproduct.filter(product => product._id !== id));
      dispatch(decreaseproducts());
      setFormData({
        name:'',
        description:'',
        price:'',
        category:'',
        unit:'',
        quantity:'',
        discount:'',
        image:'',
        vendor_id:currentUser._id,
      })
    }
  } catch (error) {
    console.log(error.message);
  }
};

const handleEdit = (product) => {
  setformtext('Edit Product');
  localStorage.setItem("productid",product._id);
  setEditingItem(product);
  setFormData({
    name:product.name,
    description:product.description,
    price:product.price,
    image:product.image,
    discount:product.discount,
    category:product.category,
    unit:product.unit,
    quantity:product.quantity,
    vendor_id:currentUser._id,
  });
  setFile(product.image);
  setShowModal(true);
  setImageUploadProgress(true);
  setImageUploaded(true);
};

  const handleUpdloadImage = async () => {
    try {
      if (!file) {
        setImageUploadError('Please select an image');
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
            setImageUploaded(true);
            
          });
        }
      );
    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.log(error);
    }
  };
  const handleEditproduct=async()=>{
    const editproductid=localStorage.getItem("productid");
      try{
        const res=await axios.put(`/Api/product/editproduct/${editproductid}`,formData);
        const product=res.data;
        if(res.status===200){
          setVendorProduct((prevProducts) =>
            prevProducts.map((product) =>
              product._id === editproductid
                ? { ...product, ...res.data } // Spread the existing product and merge with the updated data
                : product
            )
          );
          setFormData({
            name:'',
            description:'',
            price:'',
            category:'',
            unit:'',
            quantity:'',
            discount:'',
            image:'',
            vendor_id:currentUser._id,
          })

        }

      }catch(error){
        console.log("error",error);
      }
  }
  const handleSubmit = async(e) => {
    
    e.preventDefault();
    if (!validateForm()) return;
    setShowModal(false);
    if(formtext==='Edit Product'){
      await handleEditproduct();
      return;
    }
    try{
      const res=await fetch('/Api/product/addproduct',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify(formData),
      });

      const data= await res.json();
      if(!res.ok){
        console.log("notok",data.message);
        setPublishError(data.message);
        setpublishsuccess(null);
        return ;
      }
      if (res.ok) {
        setVendorProduct((prevProducts) => [...prevProducts, data.product]);
        setPublishError(null);
        setpublishsuccess('Post has been published');
        setImageUploadError(null);
        setImageUploadProgress(null);
        setImageUploaded(null);
        setFormData({
          name:"",
          description:"",
          price:'',
          quantity:'',
          discount:'',
          discount:'',
          vendor_id:currentUser._id,
        });
        setFormErrors({});
      };
    }catch(err){
      console.log(err);
    }
    setEditingItem(null);
  };

  useEffect(()=>{
    console.log("vendorproduct",vendorproduct);
  },[vendorproduct]);
  useEffect(()=>{
    console.log("formdata",formData);
  },[formData]);
  const validateForm = () => {
    const errors = {};
  
    // Check if any field is empty or missing
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Name is required';
    }
    if (!formData.description || formData.description.trim() === '') {
      errors.description = 'Description is required';
    }

    if (!formData.price || formData.price < 35) {
      errors.price = 'Price must be greater than 35';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if ( formData.discount < 1 || formData.discount > 100) {
      errors.discount = 'Discount must be between 1 and 100';
    }
    if (!formData.unit) {
      errors.unit = 'Unit of measurement is required';
    }
    if (!formData.category) {
      errors.category = 'Category is required';
    }
  
    if (formData.name && /[^a-zA-Z0-9\s]/.test(formData.name)) {
      errors.name = 'Name cannot contain special characters';
    }
    
    if (formData.description && formData.description.replace(/\s+/g, ' ').trim().length > 100) {
      errors.description = 'Description cannot exceed 100 character';
    }
    if(formData.name&&formData.name.replace(/\s+/g, ' ').trim().length > 30){
      errors.name='Name cannot exceed 30 character';
    }
    console.log("AFAWDad",(formData.price * (1 - formData.discount / 100)));
    if(formData.price&&formData.discount&&(formData.price * (1 - formData.discount / 100))<30){
      errors.price='Net calculated amount after subtracting discount should be greater than 35';
    }
    if(!formData.image){
      errors.image='Image is required';
    }
  
    setFormErrors(errors);
    if (Object.keys(errors).length === 0) {
      const sanitizedFormData = {
        ...formData,
        name: formData.name.replace(/\s+/g, ' ').trim(),
        description: formData.description.replace(/\s+/g, ' ').trim(), 
      };
      setFormData(sanitizedFormData); 
      return true;
    }
  
    // Return true if no errors
    return Object.keys(errors).length === 0;
  };
  
  const handleaddproductbutton=()=>{
    setShowModal(true);
    setformtext('Add Product');
  }
  const handlecanelbutton=()=>{
    setShowModal(false);
    setFormData({
      name:'',
      description:'',
      price:'',
      category:'',
      unit:'',
      quantity:'',
      image:'',
      vendor_id:currentUser._id,
    })
    setFile(null);
    setFormErrors({});
    setImageUploadProgress(null);
    setImageUploaded(null);
  }
  return (
    <div>
      <button className='bg-blue-600 p-1 border rounded-sm px-2' onClick={handleaddproductbutton}>
        <div className='flex'>
          <FaPlus className='mt-[0.12rem]' />
          <span className='ml-1 font-bold'>Add Product</span>
        </div>
      </button>
      <InventoryManagementTable
         vendorProduct={vendorproduct}
         handleEdit={handleEdit}
         handleDelete={handleDelete}
      />

      <Modal
        title={editingItem ? 'Edit Product' : 'Edit Product'}
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size='md'
      >
        <form
          className='flex flex-col gap-4 p-2 bg-slate-50'
          
          onSubmit={handleSubmit}
        >
          <h1 className='flex justify-center text-white underline'>
            <span className='text-black underline'>{formtext}</span>
          </h1>
          <div>
            <label htmlFor='name' className='block text-sm font-medium ml-[0.65rem] text-black'>
              Name
            </label>
            <TextInput
              className='border-slate-500 mb-1'
              type='text'
              required
              value={formData.name}
              id='name'
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder='Enter name'
            />
            {formErrors.name && <p className="text-red-500">{formErrors.name}</p>}

            <label htmlFor='description' className='block text-sm font-medium ml-[0.65rem] text-black'>
              Description
            </label>
            <TextInput
              className='border-slate-500 mb-1'
              type='text'
              required
              value={formData.description}
              id='description'
              onChange={(e) => setFormData({ ...formData, description: e.target.value})}
              placeholder='Enter description'
            />
            {formErrors.description && <p className="text-red-500">{formErrors.description}</p>}

            <label htmlFor='price' className='block text-sm font-medium ml-[0.65rem] text-black'>
              Price
            </label>
            <TextInput
              className='border-slate-500 mb-1'
              type='number'
              required
              value={formData.price}
              id='price'
              onChange={(e) => setFormData({ ...formData, price: e.target.value.trim() })}
              placeholder='Enter price,minimum 35'
            />
            {formErrors.price && <p className="text-red-500">{formErrors.price}</p>}

            <div className='flex flex-col mt-2 items-start'>
                        <span className='mx-2 text-black text-sm font-medium my-1 '>Category</span>
                        <select
                            id="category"
                            value={formData.category}
                            placeholder='Select '
                            
                            onChange={(e)=>setFormData({...formData,category : e.target.value.trim()})}
                            className='shadow-md rounded-lg p-1 w-full'
                        >   <option value="">Select Category</option>
                            <option value="grocerry">Grocerry</option>
                            <option value="crockery">Crockey</option>
                            <option value="stationary">stationary</option>
                            <option value="toiletry">toiletry</option>
                            <option value="cosmetic">cosmetic</option>
                        </select>
                    </div>
                    {formErrors.category && <p className="text-red-500">{formErrors.category}</p>}
                    <div className='flex flex-col mt-2 items-start'>
                    <span className='mx-2 text-black text-sm font-medium  my-1'>Unit of Measurement</span>
                    <select
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value.trim() })}
                      className='shadow-md rounded-lg p-1 w-full'
                    >
                      <option value="">Select Unit</option>
                      {optionsUnit.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formErrors.unit && <p className="text-red-500">{formErrors.unit}</p>}
                    <label htmlFor='quantity' className='block text-sm font-medium ml-[0.65rem] text-black'>
              Quantity
            </label> 
            <TextInput
              className='border-slate-500 mb-1'
              type='number'
              required
              id='quantity'
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value.trim() })}
              placeholder='Enter quantity'
            />
            {formErrors.quantity && <p className="text-red-500">{formErrors.quantity}</p>}
            
            <label htmlFor='discount' className='block text-sm font-medium ml-[0.65rem] text-black'>
              Discount
            </label>
            <TextInput
              className='border-slate-500 mb-1'
              type='number'
              required
              id='discount'
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value.trim() })}
              placeholder='Enter discount'
            />
          </div>
          {formErrors.discount && <p className="text-red-500">{formErrors.discount}</p>}
          <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
          <FileInput
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={imageUploadProgress || imageUploaded} // Disable while uploading or when uploaded
            />
            {!imageUploaded ? (
              <Button
                type="button"
                gradientDuoTone="purpleToBlue"
                size="sm"
                outline
                onClick={handleUpdloadImage}
                disabled={imageUploadProgress||imageUploaded}
               
              >
                {imageUploadProgress ? (
                  <div className="w-16 h-16 bg-white">
                    <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress || 0}%`} />
                  </div>
                ) : (
                  'Upload Your Image'
                )}
                
              </Button>
              
            ) : (
              <>
                <button gradientDuoTone="greenToBlue" size="sm"  disabled={!change}
                 className={`transition-all duration-300 ${imageUploadProgress || imageUploaded ? 'text-gray-700 bg-slate-400 opacity-50  border rounded px-2 ' : 'p bg-white text-black'}`}>
                  Image Uploaded
                </button>
                {change &&(
                    <Button
                    gradientDuoTone="pinkToOrange"
                    size="sm"
                    onClick={handlebuttonchange} // Allow user to re-select an image
                    className='bg-red-600 text-white py-[14px]'
                  >
                    Change
                  </Button>
                )}
                
              </>
              
            )}
          </div>
          {formErrors.image&& <p className="text-red-500">{formErrors.image}</p>}
          {imageUploadError && <p className="text-red-500">{imageUploadError}</p>}

          <div className='flex justify-around'>
            <button
              type='button'
              className='bg-red-600 p-1 border rounded-md px-2'
              onClick={handlecanelbutton}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='bg-green-400 p-1 border rounded-md px-2'
            >
              {formtext}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryManagement;
