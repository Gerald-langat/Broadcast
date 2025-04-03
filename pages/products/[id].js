import Head from 'next/head'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router';
import { addDoc, and, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, or, orderBy, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { ArrowLeftIcon, HeartIcon, HomeIcon, OfficeBuildingIcon, TrashIcon } from '@heroicons/react/outline';
import { deleteObject, ref } from 'firebase/storage';
import { AnimatePresence, motion } from 'framer-motion';
import { SendHorizonalIcon } from 'lucide-react';
import MessageContainer from './MessageContainer';
import Messages from './Messages';
import Message from './Message';
import { Carousel, Tooltip } from 'flowbite-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

function product() {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [userDetails, setUserDetails] = useState(null);
    const [hasLiked, setHasLiked] = useState(false);
    const [likes, setLikes] = useState([]);
    const [input, setInput] = useState('');
    const endOfMessagesRef = useRef();
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);
    const [isContactVisible, setIsContactVisible] = useState(false);
    const [posts, setPosts] = useState();
    const [userPosts, setUserPosts] = useState([]);
    const [isMessagesVisible, setIsMessagesVisible] = useState(false);
    const [userData, setUserData] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isReserved, setIsReserved] = useState(false);
    const { user } = useUser()
    const handleMessageClick = (userPost) => {
      setSelectedMessage(userPost); // Set the clicked post to display chat
     
    };
  
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

    const handleToggle = () => {
      setIsContactVisible(!isContactVisible); // Toggle visibility
    };

    const handleMessageToggle = () => {
      setIsMessagesVisible(!isMessagesVisible); // Toggle visibility
      setIsContactVisible(false);
    };



useEffect(() => {
    if (!db || !id) {
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, "marketplace", id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
  return unsubscribe;
  }, [db]);

  async function deleteProduct() {
    if (window.confirm("Are you sure you want to delete this post?")) {
      if (id) {
        try {      
          const likesCollectionRef = collection(db, "marketplace", id, "likes");
              const likesSnapshot = await getDocs(likesCollectionRef);
        
              const deleteLikesPromises = likesSnapshot.docs.map((likeDoc) =>
                deleteDoc(likeDoc.ref)
              );
              await Promise.all(deleteLikesPromises);
        await deleteDoc(doc(db, "marketplace", id));
        console.log("Firestore document deleted successfully.");
  
        // Delete all images associated with the post
        const imageUrls = post?.data()?.images; // Assuming 'images' is an array of image URLs
        if (imageUrls && imageUrls.length > 0) {
          const deleteImagePromises = imageUrls.map((url, index) => {
            const imageRef = ref(storage, `marketplace/${id}/image-${index}`);
            return deleteObject(imageRef).then(() => {
              console.log(`Image ${index} deleted successfully.`);
            });
          });
          // Wait for all the delete operations to complete
          await Promise.all(deleteImagePromises);
          console.log("All images deleted successfully.");
        }
      } catch (error) {
        console.error("An error occurred during deletion:", error);
      }
    }
  }
}

  async function likeProduct() {
    if (user?.id || id) {
      if (hasLiked) {
        await deleteDoc(doc(db, "marketplace", id, "likes", user?.id));
      } else {
        await setDoc(doc(db, "marketplace", id, "likes", user?.id), {
          uid: user?.id,
        });
      }
    } else {
      router.replace('/signup');
    }
  }

  useEffect(() => {
    const checkReservationStatus = async () => {
      if (!user?.id || !id) return;

      const docRef = doc(db, "marketplace", id, "reserve", user.id);
      const docSnap = await getDoc(docRef);

      // If the document exists, it means the user has reserved the item
      if (docSnap.exists()) {
        setIsReserved(true);
      } else {
        setIsReserved(false);
      }
      setLoading(false);  // Stop loading when the status is determined
    };

    checkReservationStatus();
  }, [id, user?.id]);

  
  const reserve = async () => {
    if (!user?.id) return;
  
    try {
      const docRef = doc(db, "marketplace", id);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const currentReservedStatus = docSnap.data().reserved;
  
        if (currentReservedStatus) {
          // Unreserve the item (update the document)
          await setDoc(docRef, { reserved: false }, { merge: true });
          setIsReserved(false);
          console.log("Reservation cancelled");
        } else {
          // Reserve the item (update the document)
          await setDoc(docRef, { reserved: true, username: userData.name }, { merge: true });
          setIsReserved(true);
          console.log("Item reserved");
        }
      }
    } catch (error) {
      console.error("Error reserving item:", error);
    }
  };
    

  useEffect(() => {
    if(user?.id){
    setHasLiked(
      likes.findIndex((like) => like.id === user.id) !== -1
    );
  }
  }, [likes]);


  const sendPost = async (e) => {
    e.preventDefault();
    if (!input) return;
    setLoading(true);
  
    try {
      // Ensure that userDetails and id (post or product ID) are defined before proceeding
      if (!user?.id || !id ) {
        throw new Error("Missing required data (userDetails, post ID, or recipient ID).");
      }
  
      await addDoc(collection(db, "marketplace", id, "messages"), {
        uid: user?.id,   // The ID of the user sending the message           // The product or post ID
        name: userData.name,
        productId: id,
        lastname: userData.lastname,
        userImg:userData.userImg,
        nickname: userData.nickname,
        recipientId: posts.data().uid, // The ID of the recipient (seller)
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
  
    if(!id) return;
      const q = query(
        collection(db, "marketplace", id, "messages")
      );
  
      const unsub = onSnapshot(q, (snapshot) => {
        const allMessages = snapshot.docs.map((doc) => doc.data());
        const sortedMessages = allMessages.sort((a, b) => a.timestamp?.seconds - b.timestamp?.seconds);
        setMessages(sortedMessages);
      });
  
      return () => unsub();
    });


    useEffect(() => {
      if(!id) return;
      setLoading(true);
      const unsubscribe = onSnapshot(doc(db, "marketplace", id), (snapshot) => {
        setPosts(snapshot)
      setLoading(false)
    });
    return () => unsubscribe();
  },  [db, id]) 
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;
      const q = query(collection(db, "marketplace", id, "messages"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
  
        const userId = user?.id;
        // Remove duplicates based on 'id'
        const uniquePosts = posts.filter((post, index, self) =>
          index === self.findIndex((p) => p.uid === post.uid) && post.uid !== userId
        );
  
        setUserPosts(uniquePosts);
        setLoading(false);
      });
  
      return () => unsubscribe();
    };
  
    fetchPost();
  }, [id, user?.id]);
  
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'; // 1 million and above
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'k'; // 1 thousand and above
    } else {
      return number; // below 1 thousand
    }
  };

  return (
    <div>
      <Head>
        <title>{posts?.data()?.product ? posts?.data()?.product : 'loading...'}</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <div className='border-b-[1px] shadow-md p-6 dark:border-gray-600'>
        <div className='flex items-center justify-between w-full'>
            <div>
            <Link href={`/products`}>
                <ArrowLeftIcon className='h-8  text-gray-600 cursor-pointer hover:text-gray-950 dark:text-gray-300'/>
            </Link>
            </div>
            <div className='items-center space-x-3 flex text-gray-600 dark:text-gray-300'>
            <Link href={`/marketplace`}>
                <OfficeBuildingIcon className=' h-8 cursor-pointer hover:text-gray-950 dark:hover:text-gray-500' />
              </Link>
              <Link href={`/national`}>
                <HomeIcon className=' h-8 cursor-pointer hover:text-gray-950 dark:hover:text-gray-500' />
            </Link>
            </div>
        </div>
      </div>

<div className='w-full flex justify-center'>
      <div className='grid grid-cols-1 sm:grid-cols-2  lg:grid-cols-4 justify-items-center p-4 gap-4 w-full'>

{/* Product Image */}
{Array.isArray(posts?.data()?.images) && posts?.data()?.images.length > 1 ? (
  <Carousel className="rounded-md h-96 w-full ">
    {posts?.data()?.images.map((imageUrl, index) => (
      <img
        key={index}
        className="object-cover w-full h-full rounded-md" 
        src={imageUrl}
        alt={`image-${index}`}
    
      />
    ))}
  </Carousel>
) : (
  <img
    className="rounded-md h-96 w-full object-cover" 
    src={posts?.data()?.images}
    alt='Product image'

  />
)}

{/* Product Info */}
<div className='border-l-[1px] border-r-[1px] border-b-[1px] sm:border-t-[1px] border-t-0 sm:border-l-0 w-full h-96 rounded-md flex flex-col dark:border-gray-600'>
  
  {/* Product Name */}
  <div className='flex justify-between pr-4 py-2 border-b-[1px] dark:border-gray-600 items-center'>
    <p className='font-bold'>{posts?.data()?.product}</p>
    <Tooltip content={posts?.data()?.name} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
      <img src={posts?.data()?.userImg} className='h-6 w-6 rounded-md' />
    </Tooltip>
  </div>

  {/* Description */}
  <p className='break-words border-b-[1px] text-lg dark:border-gray-600 flex-grow my-2'>
    {posts?.data()?.description}
  </p>

  {/* Price */}
  <p className='font-bold mb-2'>
    Price: KES {Number(posts?.data()?.cost).toLocaleString('en-KE')}
  </p>

  {/* Buttons */}
  <div className='flex w-full justify-between items-center'>
    
    {/* Like Button */}
    <div className="flex items-center">
      {hasLiked ? (
        <HeartIcon
          fill="red"
          onClick={likeProduct}
          className="h-9 w-9 md:h-10 md:w-10 p-2 text-red-600 dark:hover:bg-red-900 hover:bg-red-300 rounded-full cursor-pointer"
        />
      ) : (
        <HeartIcon
          onClick={likeProduct}
          className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-red-600 hover:bg-red-300 rounded-full dark:hover:bg-red-900 cursor-pointer"
        />
      )}
      {likes.length > 0 && (
        <span className={`${hasLiked && "text-red-600"} text-sm select-none`}>
          {formatNumber(likes.length)}
        </span>
      )}
    </div>

    {/* Contact and View Message buttons */}
    <div className={`${user?.id === posts?.data()?.uid ? 'hidden' : 'bg-green-600 text-white p-1 rounded-md cursor-pointer'}`} onClick={handleToggle}>
      Contact seller
    </div>

    <div className={`${user?.id !== posts?.data()?.uid ? 'hidden' : 'bg-green-600 text-white p-1 rounded-md cursor-pointer'}`} onClick={handleMessageToggle}>
      View message
    </div>

    {/* Delete or Reserve button */}
    {user?.id === posts?.data()?.uid ? (
      <TrashIcon className='h-10 p-2 hover:text-red-600 hover:bg-red-300 rounded-full dark:hover:bg-red-900 cursor-pointer' onClick={deleteProduct} />
    ) : (
      <div className={`bg-${isReserved ? 'gray' : 'red'}-600 p-1 rounded-md font-bold text-white mr-3 cursor-pointer`}
          onClick={reserve}>{isReserved ? 'Reserved' : 'Reserve'}</div>
    )}
  </div>
</div>

{/* Messages Section */}
{isMessagesVisible && (
  <>
    <div className='w-full lg:w-full border h-96 overflow-y-scroll scrollbar-hide p-2 rounded-md flex flex-col border-l-[1px] border-r-[1px] border-b-[1px] sm:border-t-[1px] border-t-0 sm:border-l-0 dark:border-gray-600'>
      {userPosts.map((messagePost) => (
        <div key={messagePost.id} onClick={() => handleMessageClick(messagePost)}>
          <Messages id={messagePost.id} post={messagePost} />
        </div>
      ))}
    </div>

    {selectedMessage && (
      <Message post={selectedMessage} id={selectedMessage.id} originalId={id} />
    )}
  </>
)}

{/* Contact Visible Section */}
{isContactVisible && (
  <div className={`${user?.id === posts?.data()?.id ? 'hidden' : 'w-full border h-96 p-2 rounded-md flex flex-col border-l-[1px] border-r-[1px] border-b-[1px] sm:border-t-[1px] border-t-0 sm:border-l-0 dark:border-gray-600'}`}>
    <div className='flex-grow overflow-y-auto scrollbar-hide'>
      {messages.map((messageDoc) => (
        <motion.div
          key={messageDoc.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <MessageContainer id={messageDoc.id} message={messageDoc} originalId={id}/>
        </motion.div>
      ))}
      <div ref={endOfMessagesRef} />
    </div>

    {/* Message Input Form */}
    <form onSubmit={sendPost} className="rounded-full sticky bottom-0 flex items-center border-[1px] dark:border-gray-500 px-4 py-2 bg-white dark:bg-gray-950">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message"
        className="dark:bg-gray-950 dark:text-gray-300 rounded-full text-gray-900 focus:ring-0 outline-none border-0 w-full"
      />
      <button>
        <SendHorizonalIcon className={`${!input ? 'cursor-not-allowed' : 'text-gray-900 dark:text-gray-400'} text-gray-600 h-9`} />
      </button>
    </form>
  </div>
)}
      </div>
</div>
     
<div>
  
</div>
        </div>
            

  )
}

export default product
