import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function Index() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return <div className="text-center mt-10">Loading...</div>;

    const checkUserExists = async () => {
      try {
        const userQuery = query(
          collection(db, 'userPosts'),
          where('uid', '==', user.id)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          router.push('/national');
        } else {
          router.push('/form');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUserExists();
  }, [isLoaded, user?.id, router]);
}
