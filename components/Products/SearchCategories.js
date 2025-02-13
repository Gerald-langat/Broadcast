import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Card, Carousel } from 'flowbite-react';


function SearchCategories({ data, id }) {
  const router = useRouter();



  return (
    <div
    key={data?.data()?.id}
    className="max-w-sm hover:scale-105 transition transform duration-300 dark:bg-gray-950 border-[1px] 
    dark:border-gray-800 rounded-md border-gray-300"
  
    >
   {data?.data()?.reserved}
       {data?.data()?.images?.length > 1 ? (
        <Carousel className="top-0 h-[130px] w-full">
          {data?.data()?.images.map((imageUrl, index) => (
            <img
              key={index}
              className="object-cover w-full h-full" // Use object-cover and h-full to fill the carousel
              src={imageUrl}
              alt={`image-${index}`}
            
            />
          ))}
        </Carousel>

      ) : (
        <img
              className="w-full h-[130px] object-cover rounded-t-md"  
              src={data?.data()?.images}
              alt=''
            />
      )}
 
    
    <div className='cursor-pointer' onClick={() => router.push(`/products/${id}`)}>
    <p className="font-normal text-gray-700 dark:text-gray-400 truncate p-2">
            {data?.data()?.description || 'No description available.'}
        </p>

        <p className="text-lg font-bold text-gray-900 dark:text-white w-full truncate p-2">
        Price: KES {Number(data?.data()?.cost).toLocaleString('en-KE')}
                </p>
    </div>

    </div>
  );
}

export default SearchCategories;
