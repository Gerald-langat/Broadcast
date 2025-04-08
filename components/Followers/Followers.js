import React, { useState, useEffect } from 'react';
import {  db } from '../../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Spinner } from 'flowbite-react';
import FollowerCard from './FollowerCard';
import Head from 'next/head';
import { useUser } from '@clerk/nextjs';

function Followers() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('followers'); 
  const { user } = useUser()

  // Fetch followers & following
  useEffect(() => {
    if (!user?.id) return;

    setLoading(true);

    const followersQuery = query(
      collection(db, "following"), 
      where("followerId", "==", user.id) // Followers: Users who follow the user
    );

    const followingQuery = query(
      collection(db, "following"),
      where("followingId", "==", user.id) // Following: Users the user follows
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
  }, [user?.id]);

  return (
    <div className="relative min-w-screen min-h-screen flex flex-col justify-center items-center">
    <Head>
      <title>Followers</title>
      <meta name="description" content="Generated and created by redAnttech" />
      <link rel="icon" href="../../images/Brod.png" />
    </Head>

    {/* Tabs for Followers and Following */}
    <div className="flex space-x-6 mt-6">
      <h2
        className={`text-xl font-bold cursor-pointer ${
          activeTab === 'followers' ? 'border-b-2 border-blue-500 text-blue-500' : ''
        }`}
        onClick={() => setActiveTab('followers')}
      >
        Followers
      </h2>
      <h2
        className={`text-xl font-bold cursor-pointer ${
          activeTab === 'following' ? 'border-b-2 border-blue-500 text-blue-500' : ''
        }`}
        onClick={() => setActiveTab('following')}
      >
        Following
      </h2>
    </div>

    {/* Content */}
    {loading ? (
      <div className="mt-10">
        <Spinner className="h-6" />
      </div>
    ) : (
      <div className="p-4 min-h-screen max-w-6xl mx-auto">
        {activeTab === 'followers' &&
          followers.map((follower) => (
            <FollowerCard key={follower.id} id={follower.id} follower={follower} />
          ))}
        {activeTab === 'following' &&
          following.map((follower) => (
            <FollowerCard key={follower.id} id={follower.id} follower={follower} />
          ))}
      </div>
    )}
  </div>
  );
}

export default Followers;
