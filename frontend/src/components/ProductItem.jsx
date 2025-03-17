import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import { Link } from 'react-router-dom';

const ProductItem = ({ _id, image, name, price, rate }) => {
    

    const { currency } = useContext(ShopContext);

  return (
      <Link className='text-gray-700 cursor-pointer' to={`/product/${_id}`}>
          <div className='overflow-hidden'>
              <img className='hover:scale-110 transition ease-in-out' src={image[0]} alt=""></img>
          </div>
          <p className='pt-3 pb-1 text-sm'>{name}</p>
          <div className='flex gap-3'>
            <strike><p className='text-md font-medium strike'>{currency}{rate}</p></strike>
            <p className='text-md font-medium'>{currency}{price}</p>
            </div>
      </Link>
  )
}

export default ProductItem