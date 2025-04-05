
import { useUser } from '@clerk/nextjs';
import Followers from '../components/Followers/Followers'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';


function followers() {

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
          <Followers />
    </div>
    
    
  )
}

export default followers
