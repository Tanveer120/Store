import React from 'react'
import Title from '../components/Title'
import { assets } from '../assets/frontend_assets/assets'
import NewsletterBox from '../components/NewsletterBox'

const About = () => {
  return (
    <div>
      <div className='text-2xl text-center pt-8 border-t'>
        <Title text1={'ABOUT '} text2={'US'}/>
      </div>

      <div className='my-10 flex flex-col md:flex-row gap-16'>
        <img className='w-full md:max-w-[450px]' src={assets.about_img} />
        <div className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600'>
          <p>At Whimsical Threads, we transform wardrobes into canvases of creativity, blending bold designs with effortless charm. Born from bold self-expression and a love for life’s playful moments, our collections celebrate individuality—for dreamers, adventurers, and anyone who believes fashion should spark joy, not blend in.</p>
          <b>Our Mission</b>
          <p>We craft clothing that empowers you to shine while honoring the planet. From ethically sourced fabrics to sustainable practices, every piece is designed to inspire confidence without compromise. Whimsical Threads isn’t just a brand—it’s a movement to dress boldly, live lightly, and embrace the magic of being unapologetically you.</p>
          {/* <p>We’re passionate about curating styles that blend quality with whimsy. Every garment is handpicked or designed in-house, prioritizing sustainable fabrics and ethical practices because looking good should never come at the cost of our planet. Our mission? To empower you to embrace your unique flair while leaving a lighter footprint.</p>
          <p>Dive into our collections—we promise there’s a little magic in every thread.</p> */}
        </div>
      </div>

      <div className='text-xl py-4'>
          <Title text1={'WHY '} text2={'CHOOSE US'}/>
      </div>

      <div className='flex flex-col md:flex-row text-sm mb-20'>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Quality Assurance:</b>
          <p className='text-gray-600'>Every thread is quality-checked and ethically crafted—because you deserve style that lasts.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Convenience:</b>
          <p className='text-gray-600'>Effortless style, delivered—shop seamlessly from anywhere, anytime.</p>
        </div>
        <div className='border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5'>
          <b>Exceptional Customer Service:</b>
          <p className='text-gray-600'>Your happiness is our thread—dedicated support, always a click away.</p>
        </div>
      </div>

      <NewsletterBox/>
      
    </div>
  )
}

export default About