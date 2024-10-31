import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase'; // Ensure correct Firestore import
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Spinner } from 'flowbite-react';
import FollowerCard from './FollowerCard';
import Head from 'next/head';

function Followers() {
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user)
      setUserDetails(user)
    })
  }
  useEffect(() => {
    fetchUserData();
  }, []);

  
  useEffect(() => {
    if (!userDetails || !userDetails.uid) {
      setLoading(true);
      return; // Exit the effect early if userDetails or uid is missing
    }
  
    const fetchPost = async () => {
      const q = query(collection(db, "following"), where('followerId', '==', userDetails.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setFollowers(snapshot.docs);
        setLoading(false);
      });
  
      return () => unsubscribe();
    };
  
    fetchPost();
  
  }, [userDetails]);
  

  return (
    <div>
       <Head>
        <title>home</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>
    {loading ? (<Spinner className='h-6'/>):(
      <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6 m-4'>
      {followers.map(follower => (
        <FollowerCard key={follower.id} id={follower.id} follower={follower} />
      ))}
      </div>
    )}
    </div>
  );
}

export default Followers;