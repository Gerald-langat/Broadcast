import React, { useState, useEffect } from 'react';
import MediaPost from './MediaPost';
import { db } from '../../firebase';
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { Button, Spinner } from 'flowbite-react';
import { AnimatePresence, motion } from 'framer-motion'; 
import { SearchIcon } from '@heroicons/react/outline';
import {  XIcon } from 'lucide-react';
import SearchComponent from './SearchList';
import Sidebar from '../National/Sidebar';

function MediaFeed() {
  const [posts, setPosts] = useState([]);
  const [qSearch, setQuerySearch] = useState([]);
  const [loading, setLoading] = useState(true);
  const [querySearch, setQuery] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(
          collection(db, "national"), 
          orderBy("timestamp", "desc")
        );
  
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const filteredPosts = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() })) // Correct id extraction
            .filter(post => post.mediaType === "image" || post.mediaType === "video" || post.name); // Ensure correct filtering
  
          setPosts(filteredPosts);
        });
  
        return () => unsubscribe && unsubscribe();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPost();
  }, []);
  
   // Removed 'posts' as a dependency to avoid an infinite loop

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setQuerySearch([]); // Clear results if no search query
          return;
        }
  
        // Query for matching names
        const q1 = query(
          collection(db, 'userPosts'),
          where('name', '>=', querySearch),
          where('name', '<=', querySearch + '\uf8ff')
        );
  
        // Query for matching nickname
        const q2 = query(
          collection(db, 'userPosts'),
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
        <div className="flex w-4/4 ">
          {/* Sidebar */}
          <div className='hidden w-2/4 lg:inline '>
         <Sidebar />
        </div>
          {/* Center Section */}
          <div className="flex flex-col justify-center w-full relative">
            <div className=" flex flex-col justify-center items-center space-x-4 w-full top-0 z-10  sticky space-y-2">
            <div className=" dark:bg-gray-950 z-50 flex justify-center  w-full top-0 sticky border-x-0 border-b-[1px] shadow-sm ">
              <form className="flex items-center px-4 w-1/2 py-2  space-x-4 rounded-md">
                <div className="flex items-center border-[1px] w-full rounded-md dark:border-gray-500">
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
          </div>

              <div className='dark:bg-gray-950 z-50 flex justify-center w-1/2 top-0 sticky border-x-0  px-4 '>
              {querySearch && (            
              <div className=" dark:bg-gray-950 w-full mx-auto border-b-[1px] shadow-sm">
                {qSearch.map((post) => (
                      <>
                      <div key={post.id}>  
                        <SearchComponent 
                          key={post.id} 
                          post={post} 
                         id={post.id}
                        
                          />
                    </div>
                    </>
                    ))}
              </div>     
                )}
              </div>
            {/* Media Grid */}
            
              <div className="w-full  grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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