import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../firebase';
import Trends from './Trends';
import { query } from 'firebase/database';
import SearchComponent from './Search';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { Button, Spinner } from 'flowbite-react';
import Link from 'next/link';
// import LiveStream from '../../pages/liveStream/livestream';


export default function Widgets() {
  const [posts, setPosts] = useState([]); 
  const [querySearch, setQuery] = useState('');
  const [trends, setTrendPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unsubscribe = onSnapshot(collection(db, 'national'), (snapshot) => {
          setTrendPosts(snapshot.docs.map((doc) => doc.data()));
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchData();
  }, []);;

  useEffect(() => {
    // Find trending topics
    const findTrendingTopics = () => {
      if (!trends.length) return;
      const commonWords = new Set(['what', 'how', 'why', 'my', 'when', 'who', 'from', 'where', 'is',
         'are', 'that', 'a', 'in', 'and', 'okay' ]); 
      const allWords = trends.flatMap((post) => {
        if (typeof post.text === 'string') {
          return post.text.toLowerCase().split(/\b/).filter(word => {
            const trimmedWord = word.trim();
            return trimmedWord.length > 0 && !commonWords.has(trimmedWord); // Exclude common words
          });
        } else {
          return [];
        }
      });
  
      const wordFrequency = {}; 

      allWords.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
  
      // Convert word frequency object to array of objects with { topic, postCount } structure
      const trendingTopics = Object.entries(wordFrequency)
        .map(([topic, postCount]) => ({ topic, postCount }));
  
      // Sort trending topics by postCount in descending order
      trendingTopics.sort((a, b) => b.postCount - a.postCount);
  
      // Get top 5 trending topics
      const topTrendingTopics = trendingTopics.slice(0, 5);
  
      setTrendingTopics(topTrendingTopics);
      setLoading(false);
    };
  
    setLoading(true);
    findTrendingTopics();
  }, [trends]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setPosts([]); // Clear results if no search query
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
    
        
        // Fetch both queries separately
        const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
        const docs = []; 
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
  setQuery('');
}



  return (
    <>
     {loading ? (
        <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
          <Spinner aria-label="Loading spinner" size="md" />
          <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
        </Button>
      ) : (
      <div className='dark:bg-gray-950  h-screen p-2'>
        <form className='flex items-center bg-gray-200 rounded-full mb-2'>
          <SearchIcon className='sm:h-6 h-8 w-8 text-gray-500 z-40 dark:text-gray-300' />
        <input
          className="border-0 dark:bg-gray-950 bg-gray-200 w-full text-2xl sm:text-lg placeholder:text-2xl  sm:placeholder:text-lg 
          dark:placeholder:text-gray-400 dark:text-gray-100 focus:ring-0 focus:outline-none 
            border-gray-50 sm:py-2 py-6 z-50 rounded-full"
          type="text"
          value={querySearch}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name/nickname..."
        />
        <div className={`p-1 bg-sky-500  rounded-full cursor-pointer hover:bg-sky-400 ${!querySearch ? 'hidden' : 'inline'}`}>
          <XIcon className='sm:h-4 h-8' onClick={clearQuery}/>
        </div>
      </form>
           
      <>
      <div className=" dark:bg-gray-950 w-full ">
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
      
      <div>
      <div className='flex space-x-2'>
          <Link href='/national'>
          <button className='border-gray-200 bg-green-700 p-2 rounded-full hover:bg-gray-400 text-white font-semibold hover:text-white text-xl sm:text-sm'>All
          </button>
          </Link>
          <Link href='/county'>
          <button className='dark:hover:bg-gray-900 dark:border-gray-900 dark:bg-gray-950 border-[1px] dark:text-gray-200 border-gray-200 bg-gray-200 text-xl sm:text-sm
           p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
          >myCounty</button>
          </Link>
          <Link href='/constituency'>
          <button className='dark:hover:bg-gray-900 dark:border-gray-900 dark:bg-gray-950 dark:text-gray-200 border-[1px] border-gray-200 bg-gray-200 text-xl sm:text-sm
           p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
          >myConstituency</button>
          </Link>
          <Link href='/ward'>
          <button className='dark:hover:bg-gray-900 dark:border-gray-900 dark:bg-gray-950 border-[1px] border-gray-200 bg-gray-200 text-xl sm:text-sm
          p-2 rounded-full hover:bg-gray-400 text-gray-500
           dark:text-gray-200 font-semibold hover:text-white'
          >myWard</button>
          </Link>
      </div>
      <br></br>
      <div className="">
      <h4 className="font-bold text-3xl sm:text-xl px-4 text-black dark:text-gray-300">Trends for you</h4>
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
          
      {/* <div className=" z-50 right-0 bottom-6 fixed">
        <LiveStream />
      </div> */}
    </>
)}
