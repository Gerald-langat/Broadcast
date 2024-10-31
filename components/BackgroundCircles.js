import React from 'react'

function BackgroundCircles() {
  return (
    <div className='relative flex justify-center items-center'>
      <div className='transition transform duration-2000 scale-110 border-[1px] absolute animate-ping rounded-full border-gray-50 h-[80px] w-[80px]  hidden md:inline'/>
      <div className='transition transform duration-2000 scale-110 border-[1px] absolute animate-ping rounded-full border-gray-600 h-[70px] w-[70px]   hidden md:inline'/>
      <div className='transition transform duration-2000 scale-110 border-[1px] absolute animate-ping rounded-full border-green-300 h-[60px] w-[60px]   hidden md:inline'/>
      <div className='transition transform duration-2000 scale-110 border-[1px] absolute animate-ping rounded-full border-red-300 h-[50px] w-[50px]   '/>
    <div/>
      <div/>
    </div>
  )
}

export default BackgroundCircles
