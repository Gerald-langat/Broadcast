import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';
import { auth, db } from '../firebase';
import { collection, deleteDoc, onSnapshot, orderBy, query } from 'firebase/firestore';
import Story from './Story';

function Stories() {
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
const [loading, setLoading ] = useState(false);
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

  const postsPerPage = 5;
  
  useEffect(() => {
    if (!userDetails?.uid) return;
  
    const q = query(
      collection(db, 'status'),
      orderBy('timestamp', 'asc')
    );
  
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const now = Date.now(); // Current timestamp in milliseconds
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
      // Delete old posts
      const deletionPromises = snapshot.docs.map(async (doc) => {
        const postTimestamp = doc.data()?.timestamp?.toMillis?.();
        if (postTimestamp && now - postTimestamp >= oneDay) {
          await deleteDoc(doc.ref);
        }
      });
      await Promise.all(deletionPromises);
  
      // Filter and set posts
      const newPosts = snapshot.docs
        .filter((doc) => {
          const postTimestamp = doc.data()?.timestamp?.toMillis?.();
          return postTimestamp && now - postTimestamp < oneDay;
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
  
      const uniquePosts = Array.from(
        new Map(newPosts.map((post) => [post.id, post])).values()
      );
  
      setPosts(uniquePosts);
      setLoading(false); // Set loading to false after data is fetched
    });
  
    return () => {
      unsubscribe();
    };
  }, [userDetails?.uid]);
  
  
  const handlePrevClick = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - postsPerPage : 0));
  };

  const handleNextClick = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + postsPerPage < posts.length ? prevIndex + postsPerPage : prevIndex
    );
  };

  return (
    <div className='border-[1px] border-gray-200 dark:border-gray-900 rounded-md mt-1'>
      {posts.length > 0 && (
        <>
          <div className="flex justify-between items-center absolute xl:w-[560px] w-[500px] sm:w-[600px] mt-3 dark:bg-gray-950">
            <ChevronLeftIcon
              className="h-14 text-blue-300 hover:scale-125 transition transform duration-500 cursor-pointer hover:text-blue-500 pl-4"
              onClick={handlePrevClick}
            />
            <ChevronRightIcon
              className="h-14 text-blue-300 hover:scale-125 transition transform duration-500 cursor-pointer hover:text-blue-500 pr-4"
              onClick={handleNextClick}
            />
        </div>
        
            <div className="flex space-x-2 p-2 justify-center rounded-sm items-center overflow-hidden w-full">
            {posts.slice(currentIndex, currentIndex + postsPerPage).map((post) => (
              <div key={post.id}>
              {loading && <p className='animate-pulse'>Loading...</p>}
                  <Story key={post.id} id={post.id} post={post} />
              </div>
            ))}
          </div>      
        </>
      )}
    </div>
  );
}

export default Stories;
