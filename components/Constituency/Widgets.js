import React, { useState, useEffect } from 'react';
import { collection, getDocs, onSnapshot, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Trends from './Trends';
import { query } from 'firebase/database';
import SearchComponent from './Search';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';
import { Button, Spinner } from 'flowbite-react';


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

  const handleHomeClick = () => {
    router.replace('/home');
  };
  
  const handleCountyClick = () => {
    router.push('/county');
  };

  const handleConstituencyClick = () => {
    router.push('/constituency');
  };


  const handleWardClick = () => {
    router.push('/ward');
  };

  const clearQuery = () => {
    setQuery("");
  }

  return (
    <div className="dark:bg-gray-950 w-[800px] md:w-[600px] lg:inline ml-2 space-y-5">
      {loading ? (
        <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
          <Spinner aria-label="Loading spinner" size="md" />
          <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
        </Button>
      ) : (
        <>
    <div className="dark:bg-gray-950 sticky -mt-2 bg-white w-full ml-4">
    <div className='flex xl:ml-1 ml-24 dark:bg-gray-950 bg-gray-200 items-center dark:border-gray-900 xl:w-[335px] sm:w-[88%] w-[383px] border-b-[1px] rounded-md top-2 fixed z-50'>
    <SearchIcon className='h-8 sm:h-6 text-gray-500'/>
      <input
        className="border-0 dark:bg-gray-950 bg-gray-200 w-[600px] md:w-full text-lg
        dark:placeholder:text-gray-400 dark:text-gray-100 focus:ring-0 focus:outline-none 
          border-gray-50 py-2 z-50"
        type="text"
        value={querySearch}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search name/nickname..."
      />
       <div className={`p-1 bg-sky-500 rounded-full cursor-pointer hover:bg-sky-400 ${!querySearch ? 'hidden' : 'inline'}`}>
        <XIcon className='h-4 text-sm' onClick={clearQuery}/>
      </div>
      </div>
           
      <div className='dark:bg-gray-950 dark:shadow-gray-400 shadow-md ml-24 shadow-gray-400 overflow-y-auto container bg-slate-50 mt-1 md:mt-2 xl:w-[335px] sm:w-[88%] w-[383px]
       xl:ml-1 fixed top-12 z-50 fit max-h-80 rounded-lg flex flex-grow'>
      <div className="dark:bg-gray-950 w-full">
        {posts.map((post) => (
          <>
          <div key={post.id}>  
        <SearchComponent 
          key={post.id} 
          post={post} 
          name={querySearch} 
          nickname={querySearch} />
        </div>
        </>
    ))}
      </div>
     
      </div>
      
      <div>
      <div className='dark:bg-gray-950 bg-white space-x-2 mt-2 top-12 fixed  xl:ml-1 ml-24 p-2 w-full rounded-t-md'>
          <button className='border-gray-200 bg-green-700 p-2 rounded-full hover:bg-gray-400 text-white font-semibold hover:text-white text-sm'
          onClick={handleHomeClick}>All</button>
          <button className='dark:bg-gray-950 dark:border-gray-900 border-[1px] dark:text-gray-300 dark:hover:bg-gray-900 bg-gray-200 p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
          onClick={handleCountyClick}>myCounty</button>
          <button className='dark:bg-gray-950 dark:border-gray-900 border-[1px] dark:text-gray-300 dark:hover:bg-gray-900 bg-gray-200 p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
          onClick={handleConstituencyClick}>myConstituency</button>
          <button className='dark:bg-gray-950 dark:border-gray-900 border-[1px] dark:text-gray-300 bg-gray-200 dark:hover:bg-gray-900 p-2 rounded-full hover:bg-gray-400 text-gray-500 font-semibold hover:text-white'
          onClick={handleWardClick}>myWard</button>
      </div>
      <br></br>
      <div className="dark:bg-gray-950 xl:ml-1 ml-24 text-gray-700  bg-slate-50 rounded-xl pt-4 mt-20
       fixed w-[90%] xl:w-[75%]">
      <h4 className="font-bold text-xl px-4 text-black dark:text-gray-300">Trends for you</h4>
      {loading && (
            <Button color="gray" className="border-0">
              <Spinner aria-label="Loading spinner" size="sm" />
              <span className="pl-3 animate-pulse">Loading...</span>
            </Button>
          )}
      <div>
            <div className="items-center justify-center -space-y-5 -mt-2">
            
            {trendingTopics.map((topic) => (
              <>
                <div key={topic.topic}>
                  <Trends topic={topic} postCount={topic.postCount}/> 
                </div>
              </>
        ))}          
            </div>
            
          </div>
          
    </div>
    </div>
    </div>
    </>
      )}
    </div>
)}
