import React, { useState, useEffect } from 'react';
import MediaPost from './MediaPost';
import { db } from '../../firebase';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Button, Spinner } from 'flowbite-react';
import { AnimatePresence, motion } from 'framer-motion'; 
import { SearchIcon, ShoppingCartIcon } from '@heroicons/react/outline';
import {  XIcon } from 'lucide-react';
import { HomeIcon,  OfficeBuildingIcon, PauseIcon, UserIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router';

function MediaFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [querySearch, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(
          collection(db, "posts"), 
          orderBy("timestamp", "desc")
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
          setPosts(snapshot.docs);
        });
        return () => unsubscribe && unsubscribe(); // Ensure unsubscribe exists before returning it
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []); // Removed 'posts' as a dependency to avoid an infinite loop

  useEffect(() => {
    if (!querySearch) {
      return; // Do nothing if querySearch is empty
    }

    const fetchData = async () => {
      try {
        if(!querySearch) {
          setPosts([]);
        }
        const q = query(
          collection(db, "posts"),
          where('name', '>=', querySearch),  // Corrected operator '>='
          where('name', '<=', querySearch + '\uf8ff')  // Corrected operator '<='
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const docs = [];
          snapshot.docs.forEach((doc) => {
            docs.push(doc);
          });

          setPosts(docs);
        });
        return () => unsubscribe();
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, [querySearch]); // This effect triggers only when querySearch changes

  const clear = () => {
    setQuery('');
  };



  return (
    <div className="min-h-screen ">
    {loading ? (
      <Button color="gray" className="border-0">
        <Spinner aria-label="Loading spinner" size="sm" />
        <span className="pl-3 animate-pulse">Loading...</span>
      </Button>
    ) : (
      <div className='flex md:px-8 lg:px-10'>

      <div className='hidden sm:inline w-1/4 space-y-6'>
        <div className="flex sm:items-center mt-14 space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full">
          <HomeIcon className="h-10 sm:h-8" />
          <span className="hidden md:inline font-bold text-xl" onClick={() => router.push('/home')}>Home</span>
        </div>
        
        <div className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full">
          <OfficeBuildingIcon className="h-10 sm:h-8" />
          <span className="hidden md:inline font-bold text-xl truncate" onClick={() => router.push('/marketplace')}>MarketPlace</span>
        </div>
        <div className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full">
          <PauseIcon className="h-10 sm:h-8" />
          <span className="hidden md:inline font-bold text-xl" onClick={() => router.push('/media')}>Media</span>
        </div>
        <div className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full">
          <ShoppingCartIcon className="h-10 sm:h-8" />
          <span className="hidden md:inline font-bold text-xl" onClick={() => router.push('/products')}>Products</span>
        </div>
        <div className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full">
          <UserIcon className="h-10 sm:h-8" />
          <span className="hidden md:inline font-bold text-xl" onClick={() => router.push('/profile')}>Profile</span>
        </div>
      </div>
        {/* Center the search bar */}
      <div className='flex flex-col justify-center w-full  '>  
        <div className="flex py-1 justify-center items-center space-x-4  w-full top-0 z-10 dark:bg-gray-950 bg-white sticky">
          <form className="flex items-center px-4 w-full py-2 sm:w-[400px]  space-x-4 rounded-full">
            <div className="flex items-center border-[1px] w-full rounded-full dark:border-gray-500">
              <SearchIcon className="h-10 sm:h-8 ml-2 text-gray-600 dark:text-gray-500" />
              <input
                type="text"
                value={querySearch}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search media by user"
                className="outline-none focus:ring-0 border-0 w-full rounded-full dark:bg-gray-950 dark:placeholder:text-gray-300 
                           placeholder:text-2xl sm:placeholder:text-lg text-2xl sm:text-lg "
              />
              <XIcon
                className={`${
                  querySearch ? "h-10 w-10 px-1 cursor-pointer" : "hidden"
                }`}
                onClick={clear}
              />
            </div>
          </form>
        </div>
          
        {/* Media grid layout */}
        <div className='flex justify-center items-center w-full md:h-[600px] pt-10 overflow-y-scroll  scrollbar-thin scrollbar-thumb-orange-600 '>
        <div className="grid grid-cols-1 gap-4 md:gap-2 sm:grid-cols-2 md:grid-cols-3 w-full">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              >
                <MediaPost key={post.id} id={post.id} name={querySearch} post={post} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
</div>
      </div>
      </div>
    )}
  </div>
  )
}  

export default MediaFeed;
