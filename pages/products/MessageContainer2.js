import React, { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { auth, db } from '../../firebase';
import { DotsHorizontalIcon, TrashIcon } from '@heroicons/react/outline';
import { Popover } from 'flowbite-react';
import { ReactionBarSelector } from '@charkour/react-reactions';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

const emojiMap = {
  happy: "😊",
  sad: "😢",
  love: "❤️",
  satisfaction: "👍",
  angry: "😡",
  surprise: "😮",
};

function MessageContainer2({ message, originalId }) {
  const [userDetails, setUserDetails] = useState(null);

  const fetchUseData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user)
      setUserDetails(user)
    })
  }
  useEffect(() => {
    fetchUseData();
  }, []);
  
  const handleReactionSelect = async (reaction) => {
    try {
      // Query for the document with the matching message text
      const q = query(collection(db, 'marketplace', originalId, "messages"), where('messagetext', '==', message.messagetext));
      
      const querySnapshot = await getDocs(q);
      
      // Assuming you only get one matching document
      querySnapshot.forEach(async (docSnapshot) => {
        // Get the document reference
        const docRef = doc(db, 'marketplace', originalId, 'messages', docSnapshot.id);
        
        // Update the document with the selected emoji
        await updateDoc(docRef, {
          emoji: emojiMap[reaction] || reaction // Set the emoji
        });
      });

    
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  async function deleteMessage() {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        // Query the document where messagetext matches
        const q = query(collection(db, 'marketplace', originalId, 'messages'), where("messagetext", "==", message?.messagetext));
        
        // Get the matching documents
        const querySnapshot = await getDocs(q);
        
        // Loop through the documents and delete each one (assuming multiple matches)
        querySnapshot.forEach(async (docSnapshot) => {
          // Get the document reference and delete it
          await deleteDoc(doc(db, 'marketplace', originalId, 'messages', docSnapshot.id));
        });
  
        console.log("Message deleted successfully");
        
      } catch (error) {
        console.error("Error deleting message: ", error);
      }
    }
  }

const userId = userDetails?.uid;
 
 
  return (
<div className='relative flex flex-col pt-2'>

  {message.recipientId === userId ? (
    <div className='flex items-center w-full'>
      {/* Message bubble */}
      <div className='bg-slate-800 p-2 rounded-md mb-8 w-fit relative text-white'>
        <p className='break-words line-clamp-6 max-w-[300px] md:max-w-[250px]'>{message.messagetext}</p>
        <p className="text-xs">
          <Moment fromNow>{message.timestamp?.toDate()}</Moment>
        </p>

        {/* Other user's avatar */}
        <img
          src={message.userImg}
          alt="User avatar"
          className="h-6 w-6 rounded-full absolute left-0"
        />
        
          <div className="absolute right-0 w-full flex justify-end  p-1">
          {message.buyerEmoji && (
            <span className="text-lg">{message.buyerEmoji} </span>
          )}
          {message.emoji && (
            <span className="text-lg">{message.emoji} </span>
          )}
          </div>
        
      </div>
      <Popover
            aria-labelledby="default-popover"
            className="rounded-full z-50"
            placement='left'
            content={
              
                 <ReactionBarSelector iconSize={16}  onSelect={(reaction) => handleReactionSelect(reaction)} />
             
            }>
          <DotsHorizontalIcon className='h-5  w-5 mr-2 cursor-pointer' />
      </Popover>
    </div>

  ) : (

// Message from the user (aligned to the right)
<div className='flex justify-end items-center w-full'>
      {/* Dots Icon */}
      <TrashIcon className='h-5 cursor-pointer hover:text-red-600' onClick={deleteMessage} />
      <Popover
            aria-labelledby="default-popover"
            className="rounded-full z-50"
            placement='left'
            content={
              <div className="w-62 flex flex-col items-center">
                 <ReactionBarSelector iconSize={16}  onSelect={(reaction) => handleReactionSelect(reaction)} />
             </div>
            }>
          <DotsHorizontalIcon className='h-5  w-5 mr-2 cursor-pointer' />
      </Popover>

      {/* Message bubble */}
      <div className='bg-slate-600 pt-1 p-2 mb-8 rounded-md w-fit relative text-white'>
        <p className='break-words line-clamp-6 max-w-[300px] md:max-w-[250px]'>{message.messagetext}</p>
        <p className="text-xs">
          <Moment fromNow>{message.timestamp?.toDate()}</Moment>
        </p>

        
          <div className="absolute  left-0 w-full flex justify-start p-1">
          {message.buyerEmoji && (
            <span className="text-lg">{message.buyerEmoji} </span>
          )}
          {message.emoji && (
            <span className="text-lg">{message.emoji} </span>
          )}
          </div>
      
        {/* User avatar */}
        <img
          src={message.userImg}
          alt="User avatar"
          className="h-6 w-6 rounded-full absolute right-0"
        />
      </div>
    </div>

    
  )}

</div>



  );
}

export default MessageContainer2;
