import React, { useEffect, useRef, useState } from 'react';
import { auth, db } from '../../firebase';
import { SendHorizonalIcon } from 'lucide-react';
import { addDoc, collection, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from 'firebase/firestore';
import MessageContainer2 from './MessageContainer2';
import { motion } from 'framer-motion';
import { Spinner } from 'flowbite-react';


function Message({ post, id, originalId }) {
    const [userDetails, setUserDetails] = useState(null);
    const [input, setInput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [messages, setMessages] = useState([]);
    const endOfMessagesRef = useRef();


    const fetchUseData = async () => {
      auth.onAuthStateChanged(async (user) => {
        console.log(user)
        setUserDetails(user)
      })
    }
    useEffect(() => {
      fetchUseData();
    }, []);



  useEffect(() => {
    const fetchUserData = async () => {
      if (userDetails) {
        const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
        const querySnapshot = await getDocs(q);
        console.log(userDetails.uid)
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };
    fetchUserData();
  }, [userDetails]);


  const sendPost = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);

    try {
      // Ensure that userDetails and id (post or product ID) are defined before proceeding
      if (!userDetails?.uid || !id || !post?.id) {
        throw new Error("Missing required data (userDetails, post ID, or recipient ID).");
      }
  
      await addDoc(collection(db, "marketplace", originalId, "messages"), {
        id: userDetails.uid,   // The ID of the user sending the message          // The product or post ID
        name: userData.name,
        lastname: userData.lastname,
        nickname: userData.nickname,
        userImg: userData.userImg,
        recipientId: post.id, // The ID of the recipient (seller)
        messagetext: input,
        timestamp: serverTimestamp(),
      });
  
      setInput(''); // Reset the input field
      setLoading(false);
      ScrollToBottom();
    } catch (error) {
      console.error("Error sending message: ", error.message);
      setError("Error sending message: " + error.message);
      setLoading(false);
    }
  };
  
  const ScrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }



  useEffect(() => {
  
    if (!id || !originalId || !userDetails?.uid) {
setLoading(true)
    } else {
      
      const q = query(
        collection(db, "marketplace", originalId, "messages"),
        where('id', 'in', [userDetails.uid, id]),       // Messages sent by you or the recipient
        where('recipientId', 'in', [userDetails.uid, id]) // Messages received by you or the recipient
      );
  
      const unsub = onSnapshot(q, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => doc.data());
        const sortedMessages = allMessages.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
        setMessages(sortedMessages);
        setLoading(false);
      });
  
      return () => unsub();
    }
  }, [id, originalId, userDetails]);


  
 
 
  return (
<div className='w-full  border h-96 p-2 rounded-md flex flex-col border-l-[1px] border-r-[1px] border-b-[1px] sm:border-t-[1px] border-t-0 sm:border-l-0 dark:border-gray-600'>
  <div className='flex-grow max-h-[400px] overflow-scroll scrollbar-hide w-full'>
  {loading ? <Spinner className='h-6'/> : (
    <>
  {messages.length === 0 ? (
      <p>No messages available.</p>
    ) : (
      messages.map((messageDoc) => (
        <motion.div
          key={messageDoc.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <MessageContainer2 id={messageDoc.id} message={messageDoc} originalId={originalId} />
        </motion.div>
      ))
    )}
      <div ref={endOfMessagesRef} />
      </>
    )}
      </div>
   


  {/* Message Input Form */}
  <form onSubmit={sendPost} className="rounded-full sticky bottom-0 flex items-center border-[1px] dark:border-gray-500 px-4 py-2 bg-white dark:bg-gray-950">     
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={`chat with ${post.name}`}
      className="dark:bg-gray-950 dark:text-gray-300 rounded-full text-gray-900 focus:ring-0 outline-none border-0 w-full"
    />
    <button>
      <SendHorizonalIcon className={`${!input ? 'cursor-not-allowed' : 'text-gray-900 dark:text-gray-400' } text-gray-600 h-9`} />
    </button>
  </form>
</div>
  )
}

export default Message;
