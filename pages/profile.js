import { useUser } from '@clerk/nextjs';
import Feed from './Profile/Feed'
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { db } from '../firebase';


function profile() {
  const { user } = useUser();
  const router = useRouter()
    const [userData, setUserData] = useState(null);
  

    useEffect(() => {
      const fetchUserData = async () => {
        if (user?.id) {
          const q = query(collection(db, 'userPosts'), where('uid', '==', user.id));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        }
      };
      fetchUserData();
    }, [user?.id]);

  useEffect(() => {
      if (!userData?.uid) {
        router.push('/'); // Instead of using signout, you can push to the signout page
      }
    }, [user, router]);
  return (
    
    <div>
        <Feed />     
    </div>
 
  )
}

export default profile
