import React from 'react'
import { assets } from '../assets/frontend_assets/assets'

const Footer = () => {
  return (
      <div>
          <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
              <div>
                  <img src={assets.logo} className='mb-5 w-32' />
                  <p className='w-full md:w-2/3 text-gray-600'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia hic eos mollitia unde? Distinctio, veritatis. Sapiente distinctio, id minus nihil earum vitae iusto recusandae ut facere nobis est reiciendis magnam.</p>
              </div>

              <div>
                  <p className='text-xl font-medium mb-5'>COMPANY</p>
                  <ul className='flex flex-col gap-1 text-gray-600'>
                      <li>Home</li>
                      <li>About us</li>
                      <li>Delivery</li>
                      <li>Privacy policy</li>
                  </ul>
              </div>

              <div>
                  <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
                  <ul className='flex flex-col gap-1 text-gray-600'>
                      <li>9324023327</li>
                      <li>tanveershaikh.3101@gmail.com</li>
                  </ul>
              </div>

          </div>
          <div>
                  <hr />
                  <p className='py-5 text-sm text-center'>Copyright 2025@ Whimiscal Threads - All Rights Reserved</p>
              </div>
    </div>
  )
}

export default Footer