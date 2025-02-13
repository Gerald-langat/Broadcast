import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from '../firebase';

const FollowContext = createContext();

export const useFollow = () => useContext(FollowContext);

export const FollowProvider = ({ children }) => {
  const [hasFollowed, setHasFollowed] = useState({});
  const userDetails = auth.currentUser;
  const [posts, setPosts] = useState([]);
  const [followloading, setFollowLoading] = useState({});

  // Fetch posts in real-time
  useEffect(() => {
    const q = query(collection(db, 'userPosts'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, []);

  // Fetch follow status for all posts
  useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!userDetails?.uid || posts.length === 0) return;
  
      const followStatuses = {};
      const promises = posts.map((post) => {
        const postId = post?.id;
        return getDocs(
          query(
            collection(db, "following"),
            where("followerId", "==", userDetails.uid),
            where("followingId", "==", postId)
          )
        ).then((followDoc) => {
          followStatuses[postId] = !followDoc.empty;
        });
      });
  
      await Promise.all(promises);
      setHasFollowed(followStatuses);
    };
  
    fetchFollowStatus();
  }, [posts, userDetails]); // Runs when posts or user changes
  

  // Follow or Unfollow function
  // Follow or Unfollow function
  const followMember = async (postId) => {
    if (!userDetails?.uid || !postId) return;
    setFollowLoading((prev) => ({ ...prev, [postId]: true }));  
    setHasFollowed((prev) => ({
      ...prev,
      [postId]: !prev[postId], // Toggle UI instantly
    }));
  
    try {
      if (hasFollowed[postId]) {
        // Unfollow Logic
        const followingQuery = query(
          collection(db, "following"),
          where("followerId", "==", userDetails.uid),
          where("followingId", "==", postId)
        );

        const followerQuery = query(
          collection(db, "following"),
          where("followerId", "==", postId),
          where("followingId", "==", userDetails.uid)
        );
  
        const followingSnapshot = await getDocs(followingQuery, followerQuery);
        const batchDeletes = followingSnapshot.docs.map(docSnapshot =>
          deleteDoc(doc(db, "following", docSnapshot.id))
        );
  
        await Promise.all(batchDeletes);
      } else {
        // Follow Logic
        const followedUserQuery = query(collection(db, "userPosts"), where("id", "==", userDetails.uid));
        const followedUserSnapshot = await getDocs(followedUserQuery);
  
        if (!followedUserSnapshot.empty) {
          const followedUserData = followedUserSnapshot.docs[0].data();
  
          await addDoc(collection(db, "following"), {
            followerId: postId,
            id:userDetails.uid,
            name: followedUserData.name,
            nickname: followedUserData.nickname,
            userImg: followedUserData.userImg,
            timeStamp: new Date(),
          });
        }

        const followingUserQuery = query(collection(db, "userPosts"), where("id", "==", postId));
        const followingUserSnapshot = await getDocs(followingUserQuery);
  
        if (!followingUserSnapshot.empty) {
          const followingUserData = followingUserSnapshot.docs[0].data();
  
          await addDoc(collection(db, "following"), {
            followingId: userDetails.uid,
            id:postId,
            name: followingUserData.name,
            nickname: followingUserData.nickname,
            userImg: followingUserData.userImg,
            timeStamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error("Error following/unfollowing: ", error);
    }
    setFollowLoading((prev) => ({ ...prev, [postId]: false }));
  };
  


  return (
    <FollowContext.Provider value={{ hasFollowed, followMember, followloading }}>
      {children}
    </FollowContext.Provider>
  );
};
