import React, { useState } from 'react';
import { assets } from '../assets/assets';
import axios from 'axios';
import {backendUrl} from '../App';
import {toast} from 'react-toastify';

const Add = ({token}) => {

  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rate, setRate] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Men');
  const [subCategory, setSubCategory] = useState('Topwear');
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState([]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {

      const formData = new FormData();

      formData.append('name', name);
      formData.append('description', description);
      formData.append('rate', rate);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('bestseller', bestseller);
      formData.append('sizes', JSON.stringify(sizes));

      image1 && formData.append('image1', image1);
      image2 && formData.append('image2', image2);
      image3 && formData.append('image3', image3);
      image4 && formData.append('image4', image4);
      
      const response = await axios.post(backendUrl + '/api/product/add', formData,{headers:{token}})
      
      if (response.data.success) {
        toast.success(response.data.message)
        setImage1(false);
        setImage2(false);
        setImage3(false);
        setImage4(false);
        setName('');
        setDescription('');
        setRate('');
        setPrice('');
        setCategory('Men');
        setSubCategory('Topwear');
        setBestseller(false);
        setSizes([]);
      }
      else {
        toast.error(response.data.message);
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <div>
        <p className='mb-2'>Upload Image</p>
        <div className='flex gap-2'>
          <label htmlFor='image1'>
            <img className='w-20 cursor-pointer' src={!image1 ? assets.upload_area : URL.createObjectURL(image1)} alt='' />
            <input onChange={(e)=>setImage1(e.target.files[0])} type='file' id='image1' hidden />
          </label>

          <label htmlFor='image2'>
            <img className='w-20 cursor-pointer' src={!image2 ? assets.upload_area : URL.createObjectURL(image2)} alt='' />
            <input onChange={(e)=>setImage2(e.target.files[0])} type='file' id='image2' hidden />
          </label>

          <label htmlFor='image3'>
            <img className='w-20 cursor-pointer' src={!image3 ? assets.upload_area : URL.createObjectURL(image3)} alt='' />
            <input onChange={(e)=>setImage3(e.target.files[0])} type='file' id='image3' hidden />
          </label>

          <label htmlFor='image4'>
            <img className='w-20 cursor-pointer' src={!image4 ? assets.upload_area : URL.createObjectURL(image4)} alt='' />
            <input onChange={(e)=>setImage4(e.target.files[0])} type='file' id='image4' hidden />
          </label>
        </div>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Name</p>
        <input onChange={(e)=>setName(e.target.value)} value={name} className='w-full max-w-[600px] px-3 py-2' type='text' placeholder='Product name' required/>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Product Description</p>
        <textarea onChange={(e)=>setDescription(e.target.value)} value={description} className='w-full max-w-[600px] px-3 py-2' type='text' placeholder='Write description here...' required/>
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>

        <div>
          <p className='mb-2'>Product Category</p>
          <select onChange={(e)=>setCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Kids">Kids</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Sub Category</p>
          <select onChange={(e)=>setSubCategory(e.target.value)} className='w-full px-3 py-2'>
            <option value="Topwear">Topwear</option>
            <option value="Bottomwear">Bottomwear</option>
            <option value="Winterwear">Winterwear</option>
          </select>
        </div>

        <div>
          <p className='mb-2'>Product Rate</p>
          <input onChange={(e)=>setRate(e.target.value)} value={rate} className='w-full px-3 py-2 sm:w-[120px]' type='number' placeholder='25'/>
        </div>

        <div>
          <p className='mb-2'>Product Price</p>
          <input onChange={(e)=>setPrice(e.target.value)} value={price} className='w-full px-3 py-2 sm:w-[120px]' type='number' placeholder='25'/>
        </div>

      </div>

      <div>
        <p className='mb-2'>Product Size</p>
        <div className='flex gap-3'>
          
          <div onClick={()=>setSizes(prev=>prev.includes("S-38")?prev.filter(item=>item!=="S-38"):[...prev,"S-38"])}>
            <p className={`${sizes.includes("S-38")?"bg-pink-300":"bg-slate-200"} px-3 py-1 cursor-pointer`}>S-38</p>
          </div> 

          <div onClick={()=>setSizes(prev=>prev.includes("M-40")?prev.filter(item=>item!=="M-40"):[...prev,"M-40"])}>
            <p className={`${sizes.includes("M-40")?"bg-pink-300":"bg-slate-200"} px-3 py-1 cursor-pointer`}>M-40</p>
          </div>

          <div onClick={()=>setSizes(prev=>prev.includes("L-42")?prev.filter(item=>item!=="L-42"):[...prev,"L-42"])}>
            <p className={`${sizes.includes("L-42")?"bg-pink-300":"bg-slate-200"} px-3 py-1 cursor-pointer`}>L-42</p>
          </div>

          <div onClick={()=>setSizes(prev=>prev.includes("XL-44")?prev.filter(item=>item!=="XL-44"):[...prev,"XL-44"])}>
            <p className={`${sizes.includes("XL-44")?"bg-pink-300":"bg-slate-200"} px-3 py-1 cursor-pointer`}>XL-44</p>
          </div>

          <div onClick={()=>setSizes(prev=>prev.includes("XXL-46")?prev.filter(item=>item!=="XXL-46"):[...prev,"XXL-46"])}>
            <p className={`${sizes.includes("XXL-46")?"bg-pink-300":"bg-slate-200"} px-3 py-1 cursor-pointer`}>XXL-46</p>
          </div>
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input onChange={()=>setBestseller(prev=>!prev)} checked={bestseller} type='checkbox' id='bestseller' />
        <label className='cursor-pointer' htmlFor='bestseller'>Add to Bestseller</label>
      </div>

      <button type='submit' className='w-28 py-3 mt-4 bg-black text-white'>ADD</button>

    </form>
  )
}

export default Add