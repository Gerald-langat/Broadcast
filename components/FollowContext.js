import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, getDocs, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from '../firebase';

const FollowContext = createContext();

export const useFollow = () => useContext(FollowContext);

export const FollowProvider = ({ children }) => {
  const [hasFollowed, setHasFollowed] = useState({});
  const [userPosts, setUserPosts] = useState(null);
  const userDetails = auth.currentUser; 
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user posts only once when userDetails is available
  useEffect(() => {
    const fetchUserPosts = async () => {
       // Assuming you use auth to get the current user
      if (userDetails) {
        const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserPosts(querySnapshot.docs[0].data());
        }
      }
    };
    fetchUserPosts();
  }, []);

  useEffect(() => {
    if (!db) return;
  
    const fetchPosts = async () => {
      const q = query(collection(db, 'userPosts'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData); // Set the state with the array of posts
        setLoading(false);
      });
  
      return () => unsubscribe();
    };
  
    fetchPosts();
  }, [db]);

    useEffect(() => {
    const fetchFollowStatus = async () => {
      if (!userDetails?.uid || posts?.length === 0) return;
  
      const followStatuses = {};
      const promises = [];
  
      posts.forEach((post) => {
        const postId = post?.id;
      
        // Add each follow status query as a promise
        const followStatusPromise = getDocs(
          query(
            collection(db, 'following'),
            where('followingId', '==', userDetails.uid),
            where('followerId', '==', postId)
          )
        ).then((followDoc) => {
          followStatuses[postId] = !followDoc.empty;
        });
  
        promises.push(followStatusPromise);
      });
  
      // Wait for all follow status queries to complete
      await Promise.all(promises);
  
      setHasFollowed(followStatuses); // Update follow statuses after all asynchronous calls are complete
    };
  
    fetchFollowStatus();
  }, [posts, userDetails]);

  const followMember = async (postId, userDetails) => {
    if (!userDetails?.uid || !postId) return;

    const isFollowing = hasFollowed[postId];
    
    try {
      if (isFollowing) {
        // Unfollow
        const followQuery = query(
          collection(db, "following"),
          where("followingId", "==", userDetails.uid),
          where("followerId", "==", postId)
        );

        const followSnapshot = await getDocs(followQuery);
        followSnapshot.forEach(async (docSnapshot) => {
          await deleteDoc(doc(db, "following", docSnapshot.id));
        });
      } else {
        // Follow
        await addDoc(collection(db, "following"), {
          followingId: userDetails.uid,
          followerId: postId,
          name: userPosts?.name,
          nickname: userPosts?.nickname,
          userImg: userPosts?.userImg,
          timeStamp: new Date(),
        });
      }

      // Update follow state in all components
      setHasFollowed((prev) => ({
        ...prev,
        [postId]: !isFollowing
      }));
    } catch (error) {
      console.error("Error following/unfollowing: ", error);
    }
  };

  return (
    <FollowContext.Provider value={{ hasFollowed, followMember }}>
      {children}
    </FollowContext.Provider>
  );
};
