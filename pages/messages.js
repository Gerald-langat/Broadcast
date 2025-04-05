import { useRouter } from 'next/router';
import MessagesFeed from '../components/Message/MessagesFeed'
import { useUser } from '@clerk/nextjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';


function messages() {
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
    }, [userData?.uid, router]);
  return (
    
    <div className='flex min-h-screen w-4/4 dark:bg-gray-950'>
        {/* Sidebar */}
        

        <div className='w-full xl:w-3/4 '> 
          <MessagesFeed />
        </div>
    </div>

 
  )
}

export default messages
