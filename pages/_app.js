import '../styles/globals.css';
import { ThemeProvider } from "next-themes";
import { RecoilRoot } from "recoil";
import { FollowProvider } from '../components/FollowContext';
import { ClerkProvider, useUser} from '@clerk/nextjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';

function AuthGuard({ children }) {
    const { user } = useUser();
    const router = useRouter()
    const [loading, setLoading] = useState(true); 
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
      setLoading(false); // Set loading to false after everything
    };

    fetchUserData();
  }, [user?.id]);

  useEffect(() => {
    // 🔒 Only redirect AFTER loading is done
    if (!loading && user && !userData) {
      <div className="w-full h-screen flex items-center justify-center">
      <Image src="/images/Broadcast.jpg" width={400} height={400} alt="Loading..." />
    
    </div>
    }
  }, [loading, userData, user, router]);

  // 🌀 Show loading screen while data is being fetched

  return children;
}

// const uid = user?.id;

export default function App({
  Component,
  pageProps: { ...pageProps },
}) {
  return (
    <ClerkProvider>
      <ThemeProvider enableSystem={true} attribute="class">
        <RecoilRoot>
          <FollowProvider>
            <AuthGuard>
              <Component {...pageProps} />
            </AuthGuard>
          </FollowProvider>
        </RecoilRoot>
      </ThemeProvider>

  </ClerkProvider>
  );
}
