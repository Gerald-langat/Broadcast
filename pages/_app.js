import '../styles/globals.css';
import { ThemeProvider } from "next-themes";
import { RecoilRoot } from "recoil";
import { FollowProvider } from '../components/FollowContext';
import { ClerkProvider, useUser } from '@clerk/nextjs';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function AuthGuard({ children }) {
    const { user, isLoaded } = useUser(); // Clerk provides `isLoaded` to check if the user is loaded
    const router = useRouter();
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

        if (user?.id && isLoaded) {
            fetchUserData();
        }
    }, [user?.id, isLoaded]);

    // When user data is loaded, redirect if the user doesn't have valid data
    useEffect(() => {
        if (userData === null && isLoaded) {
            router.push('/'); // If no user data, redirect to home page or login
        }
    }, [userData, isLoaded]);

    // Wait for the user to load and data to be fetched before rendering children
    if (!isLoaded || userData === null) {
        return <div>Loading...</div>; // Display a loading state while checking user data
    }

    return children; // Render the children (page content) once the user is validated
}

export default function App({ Component, pageProps }) {
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
