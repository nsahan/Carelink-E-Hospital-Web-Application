import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40  text-sm'>
        <div>
            <img className='mb-5 w-40' src={assets.logo1} alt="" />
            <p className='w-full md:w-2/3 text-gray-500 leading-6'> Your all-in-one healthcare companion - bringing medical services, emergency care, 
            AI assistance, and pharmacy needs directly to your fingertips. </p>
        </div>
        <div>
            <p className='text-xl font-medium mb-5'>Company</p>
            <ul className='flex flex-col gap-2 text-gray-500'>
                <li>Home</li>
                <li>About Us</li>
                <li>Contact us</li>
                <li>Privacy Policy</li>
            </ul>
        </div>

        <div>
             <p className='text-xl font-medium mb-5'>Get in Touch</p>
            <ul className='flex flex-col gap-2 text-gray-500'>
                <li>+94769034458</li>
                <li>carelink@gmail.com</li>
            </ul>
        </div>
      </div>
      <div>
        <hr />
        <p className='py-5 text-sm text-center'>Copyright @2025  Care Link - All Rights Reserved.</p>
      </div>
    </div>
  )
}

export default Footer
