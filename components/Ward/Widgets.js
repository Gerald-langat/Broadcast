'use client'
import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase';
import Trends from './Trends';
import { query } from 'firebase/database';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { Button, Spinner } from 'flowbite-react';
import SearchComponent from './Search';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';


export default function Widgets() {
  const [posts, setPosts] = useState([]); 
  const [querySearch, setQuery] = useState('');
  const [trendPosts, setTrendPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useUser()

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const q = query(collection(db, 'userPosts'), where('uid', '==', user?.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };

    fetchUserData();
  }, [user?.id]);
  
  // Fetch trend posts
  useEffect(() => {
    if (!userData || !userData.ward) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, "ward", userData.ward, "posts")),
      (snapshot) => {
        setTrendPosts(snapshot.docs.map(doc => doc.data()));
        setLoading(false);
      }
    );
    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [userData]);

  // Find trending topics
  useEffect(() => {
    const findTrendingTopics = () => {
      if (!trendPosts.length) return;
      const commonWords = new Set(['what', 'how', 'why', 'my', 'when', 'who', 'is', 'are', 'that', 'a', 'in', 'and', 'okay']);
      const allWords = trendPosts.flatMap((post) => {
        if (typeof post.text === 'string') {
          return post.text.toLowerCase().split(/\b/).filter(word => {
            const trimmedWord = word.trim();
            return trimmedWord.length > 0 && !commonWords.has(trimmedWord);
          });
        } else {
          return [];
        }
      });

      const wordFrequency = {};

      allWords.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });

      const trendingTopics = Object.entries(wordFrequency)
        .map(([topic, postCount]) => ({ topic, postCount }));

      trendingTopics.sort((a, b) => b.postCount - a.postCount);

      const topTrendingTopics = trendingTopics.slice(0, 5);

      setTrendingTopics(topTrendingTopics);
      setLoading(false);
    };

    setLoading(true);
    findTrendingTopics();
  }, [trendPosts]);

  // search
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setPosts([]); // Clear results if no search query
          return;
        }
    
        // Query for matching name
        const q1 = query(
          collection(db, 'userPosts'),
          where('name', '>=', querySearch),
          where('name', '<=', querySearch + '\uf8ff')
        );
    
        // Query for matching nicknames
        const q2 = query(
          collection(db, 'userPosts'),
          where('nickname', '>=', querySearch),
          where('nickname', '<=', querySearch + '\uf8ff')
        );
    
        // Fetch both queries separately
        const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
        const docs = []; 
        // Process first query results (products)
        snapshot1.forEach((doc) => docs.push(doc));
        // Process second query results (categories)
        snapshot2.forEach((doc) => docs.push(doc));
    
        setPosts(docs); // Update your state with combined results
  
      } catch (error) {
        console.error('Error searching Firestore:', error);
      } 
    };
  
    fetchData();
    
  }, [querySearch]);


 
  const clearQuery = () => {
    setQuery("");
  }

  return (
    <div className='dark:bg-gray-950 top-0 sticky h-screen sm:ml-1 items-start'>
                <form className='flex items-center rounded-full  dark:bg-gray-950 bg-gray-200 px-3 mb-2 border-[1px] mt-2 dark:border-gray-700'>
                  <SearchIcon className='h-6 text-gray-500 z-40 dark:text-gray-300' />
                <input
                  className="border-0 dark:bg-gray-950 bg-gray-200 w-full text-2xl sm:text-lg placeholder:text-lg 
                  dark:placeholder:text-gray-400 dark:text-gray-100 focus:ring-0 focus:outline-none 
                    border-gray-50 sm:py-2 py-6 z-50 rounded-full"
                  type="text"
                  value={querySearch}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search name/nickname..."
                />
                <div className={`p-1 bg-sky-500  rounded-full cursor-pointer hover:bg-sky-400 ${!querySearch ? 'hidden' : 'inline'}`}>
                  <XIcon className='h-4 ' onClick={clearQuery}/>
                </div>
              </form>
                   
              <>
              <div className=" dark:bg-gray-950 shadow-sm shadow-gray-700 dark:shadow-gray-50 rounded-md z-50 absolute bg-gray-200 w-full ">
                {posts.map((post) => (
                  <>
                  <div key={post.id}>  
                    <SearchComponent 
                      key={post.id} 
                      post={post} 
                      name={querySearch} 
                      nickname={querySearch} 
                      />
                </div>
                </>
            ))}
              </div>
             
              </>
              
              <div className='top-10 sticky '>
              <div className='flex space-x-2 p-2 justify-between'>
                  <Link href='/national'>
                  <button className='border-gray-200 bg-green-700 p-2 rounded-full hover:bg-gray-400 text-white font-semibold hover:text-white text-sm'>All
                  </button>
                  </Link>
                  <Link href='/county'>
                  <button className='dark:hover:bg-gray-900 dark:border-gray-900 dark:bg-gray-950 border-[1px] dark:text-gray-200 border-gray-200 bg-gray-200 text-sm
                   p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
                  >myCounty</button>
                  </Link>
                  <Link href='/constituency'>
                  <button className='dark:hover:bg-gray-900 dark:border-gray-900 dark:bg-gray-950 dark:text-gray-200 border-[1px] border-gray-200 bg-gray-200 text-sm
                   p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
                  >myConstituency</button>
                  </Link>
                  <Link href='/ward'>
                  <button className='dark:hover:bg-gray-900 dark:border-gray-900 dark:bg-gray-950 border-[1px] border-gray-200 bg-gray-200 text-sm
                  p-2 rounded-full hover:bg-gray-400 text-gray-500
                   dark:text-gray-200 font-semibold hover:text-white'
                  >myWard</button>
                  </Link>
              </div>
              <br></br>
              <div className="">
              <h4 className="font-bold text-xl px-4 text-black dark:text-gray-300">Trends </h4>
              {loading ? (
                    <Button color="gray" className="border-0">
                      <Spinner aria-label="Loading spinner" size="sm" />
                      <span className="pl-3 animate-pulse">Loading...</span>
                    </Button>
                  ): (
                    <div>
                    <div className="items-center justify-center  -mt-2 ">
                    
                    {trendingTopics.map((topic) => (
                      <>
                        <div key={topic.topic}>
                          <Trends topic={topic} postCount={topic.postCount}/> 
                        </div>
                      </>
                ))}          
                    </div>
                    
                  </div>
                  )}  
            </div>
            </div>
            </div>
)}
