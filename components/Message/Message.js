import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import { auth, db, storage } from '../../firebase';
import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import Moment from 'react-moment';
import { SendHorizonalIcon } from 'lucide-react';
import MessageContainer from './MessageContainer';
import {  motion } from "framer-motion";
import { EmojiHappyIcon, MenuAlt1Icon, PhotographIcon, SearchIcon, XIcon } from '@heroicons/react/outline';
import EmojiPicker from 'emoji-picker-react';
import { Spinner } from 'flowbite-react';


function Message({ post, id }) {
  const [input, setInput] = useState('');  // Initialize input with empty string
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState("");
  const filePickerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const endOfMessagesRef = useRef();


  // Fetch user details on component mount
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


  useEffect(() => {
    fetchUserData();
  
    if ( !id || !userDetails?.uid) {
    setLoading(true);
    } else {
      const q = query(
        collection(db, 'DMs'),
        where('id', 'in', [userDetails.uid, id]),       // Messages sent by you or the recipient
        where('recipientId', 'in', [userDetails.uid, id]), // Messages received by you or the recipient
       
      );
  
      const unsub = onSnapshot(q, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => doc.data());
       const sortedMessages = allMessages.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
        setMessages(sortedMessages);
        setLoading(false);
      });
  
      return () => unsub();
    }
  }, [id, userDetails]);
  
  
  
  // Send a new message
  const sendPost = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
  
    try {
      if (userDetails || post) {
        const messageData = {
          id: userDetails.uid,      
          recipientId: id,
          messagetext: input,
          userImg: userData.userImg || '', // Assuming userDetails contains the image
          timestamp: serverTimestamp(),
          name: userDetails.displayName || '',
        };
  
        // Add message to Firestore under the 'DMs' collection and get the reference to the newly created document
        const messageRef = await addDoc(collection(db, 'DMs'), messageData);
  
        // Reference for the image in storage
        const imageRef = ref(storage, `DMs/${messageRef.id}/image`);
  
        // If a file is selected, upload the image and update the document with the image URL
        if (selectedFile) {
          await uploadString(imageRef, selectedFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(imageRef);
            // Update the message document with the image URL
            await updateDoc(doc(db, "DMs", messageRef.id), {
              image: downloadURL,
            });
          });
        }
  
        setInput(''); // Reset the input field
        setSelectedFile(null);
        setLoading(false);
        ScrollToBottom();
        
      }
      
    } catch (error) {
      console.error("Error sending message: ", error);
      setError("Error sending message: " + error.message);
      setLoading(false);
    }
    setShowEmojiPicker(false);
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  const ScrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
  
  return (
    <div className='h-screen flex flex-col'>
    <Head>
      <title>{post?.name && post?.lastname ? `${post.name} ${post.lastname}` : 'Loading...'}</title>
      <meta name="description" content="Generated and created by redAnttech" />
      <link rel="icon" href="../../images/Brod.png" />
    </Head>
  
    {/* Chat Header */}
    {post && (
      <div className="flex items-center p-4 border-b dark:border-gray-700">
       
        <div className="flex items-center">
          <img
            className="sm:h-9 sm:w-9 h-12 w-12 rounded-full mb-1 ml-1 mt-1 mr-1"
            src={post.userImg}
            alt="user-img"
          />
        </div>
        <div className="flex space-x-2 text-2xl sm:text-sm">
          <p>{post.name}</p>
          <p>{post.lastname}</p>
          <p className="text-gray-400">@{post.nickname}</p>
        </div>
      </div>
    )}
  
    {/* Chat Messages */}
    {loading ? <Spinner className='h-6'/> : (

    <div className="flex-1 overflow-y-auto scrollbar-hide" onClick={() => setShowEmojiPicker(false)}>
  {messages.map((messageDoc) => (
        
        <motion.div
          key={messageDoc.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <MessageContainer key={messageDoc.id} id={messageDoc.id} message={messageDoc} />
        </motion.div>
      ))}

      
      
  <div ref={endOfMessagesRef} />
       
    </div>

  )}

    {/* Input Form */}
    <form onSubmit={sendPost} className="relative mb-2 bottom-0  rounded-full flex items-center border-[1px] dark:border-gray-500 px-4 py-2">
    
    {selectedFile && (
              <div className="relative ml-8">
                <XIcon
                  onClick={() => setSelectedFile(null)}
                  className="border h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full"
                />
                <img
                  src={selectedFile}
                  className={`${loading && "animate-pulse"} h-[100px] w-[200px] object-cover rounded-md `}
                  alt="image"
                />
              </div>
            )}
      <div className='space-x-4 flex'>
        <EmojiHappyIcon className='h-6 sm:h-8 text-gray-500 cursor-pointer hidden lg:inline' onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
        <PhotographIcon className='h-6 sm:h-8 text-gray-500 cursor-pointer' onClick={() => filePickerRef.current.click()}/>
        <input
          type="file"
          hidden
          accept="image/*"
          ref={filePickerRef}
          onChange={addImageToPost}
        />
      </div>
      
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onClick={() => setShowEmojiPicker(false)}
        placeholder={`Start a new chat with ${post.name}`}
        className="dark:bg-gray-950 dark:text-gray-300 rounded-full text-gray-900 focus:ring-0 outline-none border-0 w-full"
      />
      <button>
        <SendHorizonalIcon className={`${!input ? 'cursor-not-allowed' : 'text-gray-900 dark:text-gray-400' } text-gray-600 h-9`} />
      </button>
    </form>
  
    {/* Emoji Picker */}
    <div className='absolute bottom-16'>
      {emoji.emoji}
      {emoji && <a href={emoji.getImageUrl()}></a>}
      {showEmojiPicker && (
        <EmojiPicker
          className="dark:bg-gray-950"
          height={400}
          width={300}
          emojiStyle="twitter"
          onEmojiClick={(e) => {
            setInput(input + e.emoji)
          }}
        />
      )}
    </div>
  
    {error && <p className="text-red-500">{error}</p>}
  </div>
  
  );
}

export default Message;
