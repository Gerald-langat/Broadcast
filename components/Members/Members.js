import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Spinner } from 'flowbite-react';
import { useUser } from '@clerk/nextjs';
import { useFollow } from '../FollowContext';


function MembersFeed() {
const [memberPost, setMemberPosts] = useState()
const [loading, setLoading] = useState(true);
const { hasFollowed, followMember, followloading } = useFollow();
const { user } = useUser()



useEffect(() => {
  const q = query(collection(db, "userPosts"), orderBy("timestamp", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setMemberPosts(posts); // Clean data ready to use
    setLoading(false);
  });

  return () => unsubscribe(); // Proper cleanup
}, []);

const formatNumber = (number) => {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'; // 1 million and above
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k'; // 1 thousand and above
  } else {
    return number; // below 1 thousand
  }
};

  return (
    <div className='mt-6'>
    {loading ? (
      <Spinner aria-label="Loading spinner" size="sm" />
    ) : (
      <>
        <h1 className='w-full underline justify-center flex p-2'>
          Members ({formatNumber(memberPost?.length)})
        </h1>
        <AnimatePresence>
          {memberPost
            .filter((post) => post?.uid === user?.id) // Only current user
            .map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <div className='flex justify-between items-center w-full space-y-3'>
                  <div className="flex items-center space-x-3 mt-3">
                    <img
                      src={post?.userImg || post?.imageUrl}
                      className='h-10 w-10 rounded-full object-cover'
                    />
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">
                      {post?.name}
                    </h5>
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">
                      {post?.lastname}
                    </h5>
                    <span className="text-sm w-20 truncate text-gray-500 dark:text-gray-400">
                      @{post?.nickname}
                    </span>
                    <p>you</p>
                  </div>
                </div>
              </motion.div>
            ))}
  
          {memberPost
            .filter((post) => post?.uid !== user?.id) // Other members
            .map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <div className='flex justify-between items-center w-full space-y-3'>
                  <div className="flex items-center space-x-3 mt-3">
                    <img
                      src={post?.userImg || post?.imageUrl}
                      className='h-10 w-10 rounded-full object-cover'
                    />
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">
                      {post?.name}
                    </h5>
                    <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">
                      {post?.lastname}
                    </h5>
                    <span className="text-sm w-20 truncate text-gray-500 dark:text-gray-400">
                      @{post?.nickname}
                    </span>
                    <p  
                className='font-bold text-blue-500 sm:text-sm text-2xl cursor-pointer space-y-2'
      
                onClick={() => {
                  followMember(post?.uid);
                }}
              >
              {followloading[post?.uid] ? (
                  <Spinner aria-label="Loading spinner" size="sm" />
                ) : hasFollowed[post?.uid] ? (
                  <p className='text-sm w-20 truncate text-red-500'>Unfollow</p>
                ) : (
                  <p className='text-sm w-20 truncate'>Follow</p>
                )}
              </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </>
    )}
  </div>
  )}

export default MembersFeed
