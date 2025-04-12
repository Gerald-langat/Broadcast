import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../../firebase';
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import MemberPost from './MemberPost';
import { Spinner } from 'flowbite-react';

function MembersFeed() {
const [memberPost, setMemberPosts] = useState()
const [loading, setLoading] = useState(true);


useEffect(() => {
  const q = query(collection(db, "userPosts"), orderBy("timestamp", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    setMemberPosts(posts); // Clean data ready to use
    setLoading(false);
  });

  return () => unsubscribe(); // Proper cleanup
}, []);


  return (
    <div className='mt-6'>
       {loading ? (
             
                <Spinner aria-label="Loading spinner" size="sm" />
           
      
            ) : (
              <AnimatePresence>
                {memberPost.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <MemberPost key={post.id} id={post.id} post={post} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
    </div>
  )
}

export default MembersFeed
