import React, { useState, useEffect } from 'react';
import MediaPost from './MediaPost';
import { db } from '../../firebase';
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Button, Spinner } from 'flowbite-react';
import { AnimatePresence, motion } from 'framer-motion'; 
import { SearchIcon, ShoppingCartIcon } from '@heroicons/react/outline';
import {  XIcon } from 'lucide-react';
import { HomeIcon,  OfficeBuildingIcon, PauseIcon, UserIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router';
import SearchComponent from './SearchList';

function MediaFeed() {
  const [posts, setPosts] = useState([]);
  const [qSearch, setQuerySearch] = useState([]);
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
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setQuerySearch([]); // Clear results if no search query
          return;
        }
  
        // Query for matching names
        const q1 = query(
          collection(db, 'posts'),
          where('name', '>=', querySearch),
          where('name', '<=', querySearch + '\uf8ff')
        );
  
        // Query for matching nickname
        const q2 = query(
          collection(db, 'posts'),
          where('nickname', '>=', querySearch),
          where('nickname', '<=', querySearch + '\uf8ff')
        );
  
        // Fetch both queries concurrently
        const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  
        // Use a Set to store unique document IDs
        const seenIds = new Set();
        const uniqueDocs = [];
  
        // Process results from both snapshots
        snapshot1.forEach((doc) => {
          if (!seenIds.has(doc.name)) {
            seenIds.add(doc.name);
            uniqueDocs.push({ id: doc.id, ...doc.data() });
          }
        });
  
        snapshot2.forEach((doc) => {
          if (!seenIds.has(doc.nickname)) {
            seenIds.add(doc.nickname);
            uniqueDocs.push({ id: doc.id, ...doc.data() });
          }
        });
  
        setQuerySearch(uniqueDocs); // Update state with unique results
      } catch (error) {
        console.error('Error searching Firestore:', error);
      }
    };
  
    fetchData();
  }, [querySearch]);
  

  const clear = () => {
    setQuery('');
  };



  return (
    <div className="min-h-screen">
      {loading ? (
        <Button color="gray" className="border-0">
          <Spinner aria-label="Loading spinner" size="sm" />
          <span className="pl-3 animate-pulse">Loading...</span>
        </Button>
      ) : (
        <div className="flex md:px-8 lg:px-10">
          {/* Sidebar */}
          <div className="hidden sm:inline w-1/4 ">
          <div className='space-y-6 top-14 sticky'>
            <div
              className="flex sm:items-center mt-14 space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full"
              onClick={() => router.push('/home')}
            >
              <HomeIcon className="h-10 sm:h-8" />
              <span className="hidden md:inline font-bold text-xl">Home</span>
            </div>
            <div
              className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full"
              onClick={() => router.push('/marketplace')}
            >
              <OfficeBuildingIcon className="h-10 sm:h-8" />
              <span className="hidden md:inline font-bold text-xl truncate">MarketPlace</span>
            </div>
            <div
              className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full"
              onClick={() => router.push('/media')}
            >
              <PauseIcon className="h-10 sm:h-8" />
              <span className="hidden md:inline font-bold text-xl">Media</span>
            </div>
            <div
              className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full"
              onClick={() => router.push('/products')}
            >
              <ShoppingCartIcon className="h-10 sm:h-8" />
              <span className="hidden md:inline font-bold text-xl">Products</span>
            </div>
            <div
              className="flex sm:items-center space-x-2 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-300 p-1 w-fit rounded-full"
              onClick={() => router.push('/profile')}
            >
              <UserIcon className="h-10 sm:h-8" />
              <span className="hidden md:inline font-bold text-xl">Profile</span>
            </div>
          </div>
          </div>

          {/* Center Section */}
          <div className="flex flex-col justify-center w-full relative">
            {/* Search Bar */}
            <div className=" flex flex-col py-1 justify-center items-center space-x-4 w-full top-0 z-10  sticky space-y-2">
              <form className="flex items-center px-4 w-full py-2 sm:w-[400px] space-x-4 rounded-full">
                <div className="flex items-center border-[1px] w-full rounded-full dark:border-gray-500">
                  <SearchIcon className="h-10 sm:h-8 ml-2 text-gray-600 dark:text-gray-500" />
                  <input
                    type="text"
                    value={querySearch}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search media by user"
                    className="outline-none focus:ring-0 border-0 w-full rounded-full dark:bg-gray-950 dark:placeholder:text-gray-300 placeholder:text-2xl sm:placeholder:text-lg text-2xl sm:text-lg"
                  />
                  <XIcon
                    className={`${querySearch ? 'h-10 w-10 px-1 cursor-pointer' : 'hidden'}`}
                    onClick={clear}
                  />
                </div>
              </form>

              <div className='absolute top-14 dark:shadow-gray-400  shadow-md shadow-gray-400 overflow-y-auto container
               sm:w-[400px] z-50 fit max-h-80 rounded-lg flex flex-grow '>
              {querySearch && (            
              <div className=" dark:bg-gray-950 sm:w-[400px] ">
                {qSearch.map((post) => (
                      <>
                      <div key={post.id}>  
                        <SearchComponent 
                          key={post.id} 
                          post={post} 
                         
                          />
                    </div>
                    </>
                    ))}
              </div>
                  
                )}
              </div>
                </div>

            

            {/* Media Grid */}
            <div className="flex justify-center items-center w-full md:h-[700px] scrollbar-hide p-6 top-4 sticky">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <AnimatePresence>
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1 }}
                    >                    
                        <MediaPost key={post.id} id={post.id} post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaFeed;