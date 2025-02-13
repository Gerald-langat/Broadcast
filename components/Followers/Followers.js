import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Spinner } from 'flowbite-react';
import FollowerCard from './FollowerCard';
import Head from 'next/head';

function Followers() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // Fetch user details
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDetails(user);
      } else {
        setUserDetails(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch followers & following
  useEffect(() => {
    if (!userDetails || !userDetails.uid) return;

    setLoading(true);

    const followersQuery = query(
      collection(db, "following"), 
      where("followerId", "==", userDetails.uid) // Followers: Users who follow the user
    );

    const followingQuery = query(
      collection(db, "following"),
      where("followingId", "==", userDetails.uid) // Following: Users the user follows
    );

    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      const followersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFollowers(followersList);
      setLoading(false);
    });

    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      const followingList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFollowing(followingList);
      setLoading(false);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [userDetails]);

  return (
    <div className="relative min-w-screen min-h-screen flex flex-col justify-center items-center">
      <Head>
        <title>Followers</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>

      {/* Followers Section */}
      <h2 className="text-xl font-bold mt-4">Followers</h2>
      {loading ? (<Spinner className='h-6' />) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6 w-full min-h-screen p-10'>
          {followers.map(follower => (
            <FollowerCard key={follower.id} id={follower.id} follower={follower} />
          ))}
        </div>
      )}

   
      <h2 className="text-xl font-bold mt-4">Following</h2>
      {loading ? (<Spinner className='h-6' />) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6 w-full min-h-screen p-10'>
          {following.map(follower => (
            <FollowerCard key={follower.id} id={follower.id} follower={follower} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Followers;
