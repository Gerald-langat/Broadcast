import React from 'react'
import { useFollow } from '../FollowContext';
import { Spinner } from 'flowbite-react';
import { useUser } from '@clerk/nextjs';

function MemberPost({post}) {

  const { hasFollowed, followMember, followloading } = useFollow();
    const { user } = useUser()

  return (
    <div className='flex justify-between items-center w-full space-y-3'>
    {post?.uid === user.id ? (
      <div className="flex  items-center space-x-3 mt-3">
                    {post?.userImg ? (
                        <img src={post?.userImg} className='h-10 w-10 rounded-full object-cover' />
                    ):(
                        <img src={post?.imageUrl} className='h-10 w-10 rounded-full object-cover' />

                    )}
                        
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">{post?.name}</h5>
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">{post?.lastname}</h5>
                        <span className="text-sm w-20 truncate text-gray-500 dark:text-gray-400">@{post?.nickname}</span>
        <p>you</p>
      </div>
    
    ):(
      <>
      <div className="flex  items-center space-x-3 mt-3">
  
                    {post?.userImg ? (
                        <img src={post?.userImg} className='h-10 w-10 rounded-full object-cover' />
                    ):(
                        <img src={post?.imageUrl} className='h-10 w-10 rounded-full object-cover' />

                    )}
                        
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">{post?.name}</h5>
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">{post?.lastname}</h5>
                        <span className="text-sm w-20 truncate text-gray-500 dark:text-gray-400">@{post?.nickname}</span>
                    </div>
                  <p  
                   className='font-bold text-blue-500 sm:text-sm text-2xl cursor-pointer space-y-2'
         
                   onClick={() => {
                   
                     followMember(post?.uid);
                     
                   }}
                 >
                  {followloading[post?.uid] ? (
                     <Spinner aria-label="Loading spinner" size="sm" className='mr-8'/>
                   ) : hasFollowed[post?.uid] ? (
                     <p className='text-sm w-20 truncate text-red-500'>Unfollow</p>
                   ) : (
                     <p className='text-sm w-20 truncate'>Follow</p>
                   )}
                 </p>
              
       </>     
    )}
                    
       
                    </div>
  )
}

export default MemberPost
