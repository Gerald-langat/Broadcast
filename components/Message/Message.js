import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import { db, storage } from '../../firebase';
import { addDoc, collection, doc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { SendHorizonalIcon } from 'lucide-react';
import MessageContainer from './MessageContainer';
import {  motion } from "framer-motion";
import { EmojiHappyIcon, PhotographIcon, XIcon } from '@heroicons/react/outline';
import EmojiPicker from 'emoji-picker-react';
import { Spinner } from 'flowbite-react';
import { useUser } from '@clerk/nextjs';


function Message({ post, uid }) {
  const [input, setInput] = useState('');  // Initialize input with empty string
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [userData, setUserData] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emoji, setEmoji] = useState("");
  const filePickerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const endOfMessagesRef = useRef();
  const { user } = useUser()

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const q = query(collection(db, 'userPosts'), where('uid', '==', user?.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };
    fetchUserData();
  }, [user?.id]);


  useEffect(() => {
  
    if ( !uid || !user?.id) {
    setLoading(true);
    } else {
      const q = query(
        collection(db, 'DMs'),
        where('uid', 'in', [user.id, uid]),       // Messages sent by you or the recipient
        where('recipientId', 'in', [user.id, uid]), // Messages received by you or the recipient
       
      );
  
      const unsub = onSnapshot(q, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => doc.data());
       const sortedMessages = allMessages.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
        setMessages(sortedMessages);
        setLoading(false);
      });
  
      return () => unsub();
    }
  }, [uid, user?.id]);
  
  
  
  // Send a new message
  const sendPost = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
  
    try {
      if (user?.id || userData || post) {
        const messageData = {
          uid: user?.id,      
          recipientId: post?.uid,
          messagetext: input,
          userImg: userData.userImg || '', // Assuming userDetails contains the image
          timestamp: serverTimestamp(),
          name: userData.name || '',
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
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
    <Head>
      <title>{post?.name && post?.lastname ? `${post.name} ${post.lastname}` : "Loading..."}</title>
      <meta name="description" content="Generated and created by redAnttech" />
      <link rel="icon" href="../../images/Brod.png" />
    </Head>
  
    {/* Chat Header */}
    {post && (
      <div className="flex items-center p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center">
          <img
            className="h-12 w-12 sm:h-9 sm:w-9 rounded-full ml-2"
            src={post.userImg}
            alt="user-img"
          />
        </div>
        <div className="ml-3 text-lg sm:text-sm text-gray-900 dark:text-gray-200">
          <p className="font-semibold">{post.name} {post.lastname}</p>
          <p className="text-gray-500">@{post.nickname}</p>
        </div>
      </div>
    )}
  
    {/* Chat Messages */}
    <div className="flex-1 overflow-y-auto px-4 pt-4 pb-16 scrollbar-hide" onClick={() => setShowEmojiPicker(false)}>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner className="h-6" />
        </div>
      ) : (
        messages.map((messageDoc) => (
          <motion.div
            key={messageDoc.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <MessageContainer id={messageDoc.id} message={messageDoc} />
          </motion.div>
        ))
      )}
      <div ref={endOfMessagesRef} />
    </div>
  
    {/* Input Form */}
    <form onSubmit={sendPost} className="relative bottom-0 flex items-center border-t dark:border-gray-700 px-4 py-2 bg-white dark:bg-gray-800 w-full">
      {selectedFile && (
        <div className="relative ml-4">
          <XIcon
            onClick={() => setSelectedFile(null)}
            className="border h-6 text-black dark:text-white absolute cursor-pointer shadow-md border-white rounded-full"
          />
          <img
            src={selectedFile}
            className="h-[100px] w-[200px] object-cover rounded-md"
            alt="image"
          />
        </div>
      )}
  
      {/* Emoji & Image Upload Icons */}
      <div className="space-x-4 flex">
        <EmojiHappyIcon className="h-6 text-gray-500 cursor-pointer hidden lg:inline" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
        <PhotographIcon className="h-6 text-gray-500 cursor-pointer" onClick={() => filePickerRef.current.click()} />
        <input type="file" hidden accept="image/*" ref={filePickerRef} onChange={addImageToPost} />
      </div>
  
      {/* Chat Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onClick={() => setShowEmojiPicker(false)}
        placeholder={`Start a new chat with ${post.name}`}
        className="flex-1 bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-300 px-4 py-2 rounded-full focus:ring-0 outline-none border-0 w-full"
      />
  
      {/* Send Button */}
      <button type="submit" disabled={!input}>
        <SendHorizonalIcon className={`${!input ? "cursor-not-allowed opacity-50" : "text-gray-900 dark:text-gray-400"} h-8`} />
      </button>
    </form>
  
    {/* Emoji Picker */}
    {showEmojiPicker && (
      <div className="absolute bottom-16 left-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2">
        <EmojiPicker
          height={400}
          width={300}
          emojiStyle="twitter"
          onEmojiClick={(e) => setInput(input + e.emoji)}
        />
      </div>
    )}
  
    {/* Error Message */}
    {error && <p className="text-red-500 text-center mt-2">{error}</p>}
  </div>
  
  
  );
}

export default Message;
