import { useUser } from '@clerk/nextjs';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Trends({ topic, postCount }) {
  const router = useRouter();
  const [userData, setUserData ] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
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
    <div className="dark:bg-gray-950 lg:w-[380px] 2xl:w-[400px] sm:w-[88%] w-[570px] ml-2 space-y-5  py-2">      
        <div className='cursor-pointer bg-slate-50 dark:bg-gray-950'>       
        <div className="w-full items-center py-2 px-4 hover:bg-slate-200 dark:text-gray-100 dark:hover:bg-gray-900 hover:scale-105 transition transform duration-500">
          <Link href={`/constituencytrend/${topic.topic}`}>
          <div className='flex flex-col'>
          <h6 className='text-sm'>Trending in {userData && userData.constituency}</h6>
            <span className="font-bold text-gray-950 dark:text-gray-300">{topic.topic}</span>
            <span className='text-sm'>{formatNumber(postCount)} posts</span>
            </div>
</Link>
          </div>
          
        </div>   
    </div>  
  );
}
