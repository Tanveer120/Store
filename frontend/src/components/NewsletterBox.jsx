import React from 'react'

const NewsletterBox = () => {

    const onSubmitHandler = (event)=>{
        event.preventDefault();
    }

  return (
      <div className='text-center'>
          <p className='text-2xl font-medium text-gray-800'>Subscribe now and get 20% Off</p>
          <p className='text-gray-400 mt-3'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea maxime inventore eos rerum minima! Ea, adipisci! Quis unde numquam tempore natus nam! Cumque ab aliquid porro? At nesciunt ipsam non.</p>
          
          <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
              <input className='w-full sm:flex-1 outline-none' type='email' placeholder='Enter your Email' required />
              <button type='submit' className='bg-black text-white text-xs px-10 py-4'>Subscribe</button>
          </form>
    </div>
  )
}

export default NewsletterBox