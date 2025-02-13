import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Trends from './Trends';
import { query } from 'firebase/database';
import SearchComponent from './Search';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { Button, Spinner } from 'flowbite-react';
import Link from 'next/link';


export default function Widgets() {
  const [posts, setPosts] = useState([]); 
  const [querySearch, setQuery] = useState('');
  const [trendPosts, setTrendPosts] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user)
      setUserDetails(user)

    })
  }
  useEffect(() => {
    fetchUserData();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      if (userDetails) {
        const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };

    fetchUserData();
  }, [userDetails]);

 

  // Fetch trend posts
  useEffect(() => {
    if (!userData || !userData.constituency) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      query(collection(db, "constituency", userData.constituency)),
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
      if(!trendPosts.length) return;
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
    
        // Query for matching categories
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
    <div className="dark:bg-gray-950 -z-50 xl:inline h-screen space-y-5">
     {loading ? (
        <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
          <Spinner aria-label="Loading spinner" size="md" />
          <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
        </Button>
      ) : (
      <div className=" dark:bg-gray-950  bg-white w-full xl:ml-16">
        <form className='flex justify-between px-3 dark:bg-gray-950 bg-gray-200 items-center -ml-12 dark:border-gray-900 xl:w-[335px] sm:w-[88%] w-[570px] border-b-[1px] rounded-md top-2 fixed flex-grow'>
          <SearchIcon className='sm:h-6 h-8 w-8 text-gray-500 z-40 dark:text-gray-300' />
        <input
          className="border-0 dark:bg-gray-950 bg-gray-200 w-full text-2xl sm:text-lg placeholder:text-2xl  sm:placeholder:text-lg 
          dark:placeholder:text-gray-400 dark:text-gray-100 focus:ring-0 focus:outline-none 
            border-gray-50 sm:py-2 py-6 z-50"
          type="text"
          value={querySearch}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search name/nickname..."
        />
        <div className={`p-1 bg-sky-500  rounded-full cursor-pointer hover:bg-sky-400 ${!querySearch ? 'hidden' : 'inline'}`}>
          <XIcon className='sm:h-4 h-8' onClick={clearQuery}/>
        </div>
      </form>
           
      <div className='dark:bg-gray-950 dark:shadow-gray-400 -ml-12 shadow-md shadow-gray-400 overflow-y-auto container
       bg-slate-50 md:mt-2 xl:w-[335px] sm:w-[88%] w-[570px]  fixed top-24 sm:top-[46px] z-50 fit max-h-80 rounded-lg flex flex-grow'>
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
     
      </div>
      
      <div>
      <div className='dark:bg-gray-950 bg-white space-x-2 mt-2 top-24 sm:top-12 fixed  -ml-12 p-2 w-full rounded-t-md'>
      <Link href='/home'>
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
      <div className="dark:bg-gray-950  text-gray-700  bg-slate-50 rounded-xl pt-2 mt-36 sm:mt-20 fixed -ml-12 w-full xl:w-[75%] min-h-full">
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
    </div>
)}
