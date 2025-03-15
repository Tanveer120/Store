import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';

const Update = ({ token }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');

  // Existing product states
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState({
    image1: null,
    image2: null,
    image3: null,
    image4: null
  });

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
          const response = await axios.post(backendUrl + '/api/product/single', { productId }, { headers: { token } });
        if (response.data.success) {
          const product = response.data.product;
          setName(product.name);
          setDescription(product.description);
          setRate(product.rate);
          setPrice(product.price);
          setCategory(product.category);
          setSubCategory(product.subCategory);
          setBestseller(product.bestseller);
          setSizes(product.sizes);
          setExistingImages(product.image);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to fetch product data');
      }
    };
    fetchProduct();
  }, [productId, token]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('name', name);
      formData.append('description', description);
      formData.append('rate', rate);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));

      // Append new images if they exist
      if (newImages.image1) formData.append('image1', newImages.image1);
      if (newImages.image2) formData.append('image2', newImages.image2);
      if (newImages.image3) formData.append('image3', newImages.image3);
      if (newImages.image4) formData.append('image4', newImages.image4);

      console.log(formData);

      const response = await axios.post(backendUrl+'/api/product/update', formData,{headers: {'Content-Type': 'multipart/form-data',token: token}});
      if (response.data.success) {
        toast.success(response.data.message);

        setTimeout(() => {
          navigate('/list');
        }, 1000);
        
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

    return (
      
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          {existingImages.map((image, index) => (
            <label key={index} htmlFor={`image${index + 1}`}>
              <img className='w-20 cursor-pointer' src={newImages[`image${index + 1}`] ? URL.createObjectURL(newImages[`image${index + 1}`]) : image} alt='' />
              <input onChange={(e) => setNewImages(prev => ({ ...prev, [`image${index + 1}`]: e.target.files[0] }))} type='file' id={`image${index + 1}`} hidden />
            </label>
          ))}
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Name</p>
        <input onChange={(e) => setName(e.target.value)} value={name} className='w-full max-w-[600px] px-3 py-2' type='text' placeholder='Product name' required />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Description</p>
        <textarea onChange={(e) => setDescription(e.target.value)} value={description} className='w-full max-w-[600px] px-3 py-2' placeholder='Write description here...' required />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Product Category</p>
          <select onChange={(e) => setCategory(e.target.value)} value={category} className='w-full px-3 py-2'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub Category</p>
          <select onChange={(e) => setSubCategory(e.target.value)} value={subCategory} className='w-full px-3 py-2'>
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        
        </div>

        <div>
          <p className='mb-2'>Product Rate</p>
          <input onChange={(e) => setRate(e.target.value)} value={rate} className='w-full px-3 py-2 sm:w-[120px]' type='number' placeholder='25' />
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input onChange={(e) => setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type='number' placeholder='25' />
        </div>
      </div>

      <div>
        <p className='mb-2'>Product Size</p>
        <div className='flex gap-3'>
          {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
            <div key={size} onClick={() => setSizes(prev => prev.includes(size) ? prev.filter(item => item !== size) : [...prev, size])}>
              <p className={`${sizes.includes(size) ? "bg-pink-300" : "bg-slate-200"} px-3 py-1 cursor-pointer`}>{size}</p>
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={() => setBestseller(prev => !prev)} checked={bestseller} type='checkbox' id='bestseller' />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to Bestseller</label>
      </div>

      <button type='submit' className='w-28 py-3 mt-4 bg-black text-white'>UPDATE</button>
        </form >
        
  );
}

export default Update;