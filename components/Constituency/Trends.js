import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Trends({ topic, postCount }) {
  const router = useRouter();
  const [userData, setUserData ] = useState(null);
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
    <div className="dark:bg-gray-950 xl:w-[600px] ml-8 space-y-5  py-2">      
        <div className='cursor-pointer bg-slate-50 dark:bg-gray-950'>       
          <div className="w-[310px] items-center py-2 hover:bg-slate-200 dark:text-gray-100 dark:hover:bg-gray-900 hover:scale-105 transition transform duration-500">
          <div className='flex flex-col' onClick={() => router.push(`/constituencytrend/${topic.topic}`)}>
          <h6 className='text-sm'>Trending in {userData && userData.constituency}</h6>
            <span className="font-bold text-gray-950 dark:text-gray-300">{topic.topic}</span>
            <span className='text-sm'>{formatNumber(postCount)} posts</span>
            </div>
          </div>
          
        </div>   
    </div>  
  );
}
