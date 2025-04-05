import React, { useEffect } from 'react'
import ProductsFeed from '../components/Products/ProductsFeed'
import Head from 'next/head'
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';
import { useUser } from '@clerk/nextjs';

function products() {
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
    <div>
    <Head>
        <title>product</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <ProductsFeed />
    </div>
  )
}

export default products
