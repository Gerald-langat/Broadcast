import { db } from '../firebase';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser
} from '@clerk/nextjs';
import {
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

function Index() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
  
    const pathname = window.location.pathname;
  
    // Prevent redirect if user is already on a deep link (e.g., /national/post/123)
    const isOnHomePage = pathname === '/' || pathname === '/index';
  
    const checkUserExists = async () => {
      try {
        const userQuery = query(
          collection(db, 'userPosts'),
          where('uid', '==', user.id)
        );
        const querySnapshot = await getDocs(userQuery);
  
        if (!querySnapshot.empty && isOnHomePage) {
          router.push('/national');
        } else if (isOnHomePage) {
          router.push('/form');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUserExists();
  }, [user?.id, router]);

  return (
    <div className="flex flex-col w-full justify-center items-center h-screen">
      <div className="mb-60 flex-col space-y-4 items-center">
        <Image
          src="/images/Brodcast.jpg"
          width={100}
          height={100}
          className="rounded-md"
          alt="Broadcast"
        />

        <SignedOut>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
          >
            <SignInButton />
          </button>
        </SignedOut>

        <SignedIn>
          <div className="flex flex-row items-center space-x-2">
            <UserButton className="rounded-md" />
            <p>{user?.firstName}</p>
            <p>{user?.lastName}</p>
          </div>
        </SignedIn>
      </div>
    </div>
  );
}

export default Index;
