import React, { useState, useEffect } from 'react';
import {  db } from '../../firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { Spinner } from 'flowbite-react';
import FollowerCard from './FollowerCard';
import Head from 'next/head';
import {  useFollow } from '../FollowContext';


function Followers() {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('followers'); 
  const { userDetails } = useFollow();

  // Fetch followers & following
  useEffect(() => {
    if (!userDetails?.uid) return;

    setLoading(true);

    const followersQuery = query(
      collection(db, "following"), 
      where("followingId", "==", userDetails?.uid) // Followers: userDetailss who follow the userDetails
    );

    const followingQuery = query(
      collection(db, "following"),
      where("followerId", "==", userDetails?.uid) // Following: Users the user follows
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
  }, [userDetails?.uid]);

   // Fetch members when following/followers update
   useEffect(() => {
    if (!following.length && !followers.length) return;
  
    const fetchMembers = (values, setter) => {
      if (!values || !values.length) return;
  
      const q = query(collection(db, "userPosts"), where("uid", "in", values));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const membersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setter(membersData);
      });
  
      return unsubscribe;
    };
  
    const unsubFollowing = fetchMembers(
      following.map((u) => u.followingId).filter((id) => id !== undefined && id !== null),
      setFollowing
    );
    const unsubFollowers = fetchMembers(
      followers.map((u) => u.followerId).filter((id) => id !== undefined && id !== null),
      setFollowers
    );
  
    return () => {
      unsubFollowing?.();
      unsubFollowers?.();
    };
  }, [following, followers]);
  




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
