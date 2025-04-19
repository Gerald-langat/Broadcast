import '../styles/globals.css';
import { ThemeProvider } from "next-themes";
import { RecoilRoot } from "recoil";
import { FollowProvider } from '../components/FollowContext';
import { ClerkProvider, useUser} from '@clerk/nextjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function AuthGuard({ children }) {
    const { user } = useUser();
    const router = useRouter()
 // 👈 Add a loading state
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
     router.push('/form'); 
   }
 }, [userData?.uid]);

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
