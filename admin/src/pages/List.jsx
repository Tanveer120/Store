import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + '/api/product/remove',
        { id },
        { headers: { token } }
      )

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList()
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  // Filter products by product name based on searchTerm (case-insensitive)
  const filteredList = list.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <>
      <p className='mb-2'>All Products List</p>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by product name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full"
        />
      </div>

      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1.3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border border-gray-300 bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Sub Category</b>
          <b>Rate</b>
          <b>Price</b>
          <b>Update</b>
          <b className='text-center'>Delete</b>
        </div>

        {/* Product List */}
        {filteredList.map((item, index) => (
          <div
            key={index}
            className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1.3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border border-gray-300 text-sm'
          >
            <img className='w-12' src={item.image[0]} alt='' />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>{item.subCategory}</p>
            <p>
              {currency}
              {item.rate}
            </p>
            <p>
              {currency}
              {item.price}
            </p>
            <p>
              <Link
                to={`/update?id=${item._id}`}
                className='cursor-pointer text-gray-900 hover:text-pink-600 hover:bg-pink-300 hover:underline px-3 py-2 bg-pink-200 border border-pink-300 -ml-3'
              >
                Update
              </Link>
            </p>
            <p
              onClick={() => removeProduct(item._id)}
              className='text-right md:text-center cursor-pointer text-lg hover:text-red-600'
            >
              x
            </p>
          </div>
        ))}
      </div>
    </>
  )
}

export default List
