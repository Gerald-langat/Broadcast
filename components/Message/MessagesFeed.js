import React, { useEffect, useState } from 'react';
import Messages from './Messages';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Message from './Message';
import Head from 'next/head';
import { MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline';
import { useUser } from '@clerk/nextjs';
import Sidebar from '../National/Sidebar';
import StatusModal from '../National/StatusModal';


function MessagesFeed() {
  const [querySearch, setQuery] = useState('');
  const [posts, setPosts] = useState([]); 
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { user } = useUser()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setPosts([]); // Clear results if no search query
          return;
        }

        // Query for matching names
        const q1 = query(
          collection(db, 'userPosts'),
          where('name', '>=', querySearch),
          where('name', '<=', querySearch + '\uf8ff')
        );

        // Query for matching nickname
        const q2 = query(
          collection(db, 'userPosts'),
          where('nickname', '>=', querySearch),
          where('nickname', '<=', querySearch + '\uf8ff')
        );

        // Fetch both queries
        const [snapshot1, snapshot2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        // Combine results
        const userId = user?.id;
        const docs = [
          ...snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() })),
          ...snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        ].filter(post => post.uid !== userId); 

        setPosts(docs); // Update state with combined results

      } catch (error) {
        console.error('Error searching Firestore:', error);
      } 
    };

    fetchData();
  }, [querySearch]);

  const handleMessageClick = (post) => {
    setSelectedMessage(post); // Set the clicked post to display chat
    setPosts([])
    setQuery('')
  };



  return (
    <>
      <Head>
        <title>messages</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>
    
    <div className="flex relative sm:px-8 md:px-20 xl:px-2 xl:w-4/4 ">
    <div className='hidden xl:inline w-2/5 '> 
          <Sidebar />
          <StatusModal />
    </div>
      
      <div className='border-x-[1px] h-screen px-4 w-1/5'>
        <div className=" flex p-2 justify-between lg:justify-center sticky top-0  dark:bg-gray-950">
        <MenuAlt1Icon className='lg:hidden h-10 cursor-pointer dark:text-gray-400 text-gray-800'  />  
          <form className="flex items-center border-[1px] dark:border-gray-500 min-w-3xl px-2 rounded-full">
            <SearchIcon className="h-6 dark:text-gray-400 text-gray-800" />
            <input 
              type="text" 
              value={querySearch}
              onChange={(e) => setQuery(e.target.value)}
              className="dark:bg-gray-950 dark:text-gray-300 rounded-full text-gray-900 focus:ring-0 outline-none border-0 placeholder:search user dark:placeholder:text-gray-400"
            />
          </form>
        <SearchIcon className='lg:hidden h-10 cursor-pointer dark:text-gray-400 text-gray-800' />
        <div className="xl:hidden flex-1 px-2 w-1/5 ">
          {selectedMessage ? (
                    <Message post={selectedMessage} uid={selectedMessage.uid}/>
                  ) : (
                    <div className="text-center mt-20">
                      <p>Search user to start a conversation </p>
                    </div>
                  )}
          </div>
        </div>
        
        {/* List of Messages */}
        <div className="absolute z-40 w-full justify-center sm:w-2/3 xl:w-1/5 px-2">
          {posts.map((post) => (
            <div key={post.id} onClick={() => handleMessageClick(post)}>
              <Messages 
                id={post.id}
                post={post} 
                name={post.name} 
                nickname={post.nickname} 
              />
            </div>
          ))}
        </div>
</div>
          
       <div className="min-h-screen w-2/5 border-r-[1px] px-2 border-gray-300 dark:border-gray-600 hidden xl:inline">
        {selectedMessage ? (
          <Message post={selectedMessage} uid={selectedMessage.uid}/>
        ) : (
          <div className="text-center mt-20">
            <p>Search user to start a conversation</p>
          </div>
        )}
        
      </div>   
      </div>
    </>
    
  );
}

export default MessagesFeed;
