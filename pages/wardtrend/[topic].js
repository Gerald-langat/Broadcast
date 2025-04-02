import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, where, onSnapshot, orderBy } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Head from "next/head";
import Sidebar from '../../components/National/Sidebar';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Widgets from '../../components/Ward/Widgets';
import CommentModal from '../../components/Ward/CommentModal';
import WardTrends from '../../components/Ward/WardTrends';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function TopicPostsPage() {
  const router = useRouter();
  const { topic } = router.query;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
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
    if (!userData || !userData?.ward) {
      setLoading(true);
      return;
    }
  
    const q = query(collection(db, "ward", userData.ward, "posts"), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filteredPosts = snapshot.docs
        .filter(doc => {
          const data = doc.data();
          return data.text && data.text.includes(topic);
        })
        
      setPosts(filteredPosts);
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [userData, topic]);
  
  
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    setIsWidgetsVisible(false);
  };

  const toggleWidgets = () => {
    setIsWidgetsVisible(!isWidgetsVisible);
    setIsSidebarVisible(false);
  }

  const toggleHome = () => {
    setIsWidgetsVisible(false);
    setIsSidebarVisible(false);
  }
  
  


  return (
    <div>
      <Head>
        <title>{topic ? topic : 'loading...'}</title>
        <meta name="description" content="Generated and created by redAndttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <main className="flex min-h-screen mx-auto dark:bg-gray-950 sm:w-screen min-w-[580px] flex-grow sm:px-10 md:px-24 xl:px-0">
        {/* Sidebar */}
        {isSidebarVisible && (
              <div
                className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden"
                onClick={() => setIsSidebarVisible(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
                  <Sidebar />
                </div>
              </div>
            )}
        <div className='hidden xl:inline'>
          <Sidebar />
        </div>
        {/* Feed */}
        <div className="xl:ml-[370px] 2xl:ml-[560px] xl:min-w-[576px]  sm:min-w-full flex-grow max-w-xl">
          <div className="flex items-center space-x-2  py-2 px-3 sticky top-0 bg-white border-[1px] rounded-md border-gray-300 dark:border-gray-900 dark:bg-gray-950">
            <Link href={`/ward`}>
          <Tooltip content='back' arrow={false} placement="bottom" className="p-1 flex text-xs bg-gray-500 -mt-1">
              <ArrowLeftIcon className="h-8 cursor-pointer animate-pulse" />
            </Tooltip>
            </Link>
           
            <h2 className="text-lg sm:text-xl font-bold cursor-pointer">
               {topic ? (topic):(loading && <Spinner size="sm" />)}
            </h2>
          </div>
     
          {loading ? (<Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>):(
                      <div>
              {posts.map((post) => (
               <div key={post.id} className='dark:bg-gray-950 bg-white'>
               
                 <WardTrends  key={post.id} id={post.id} post={post}/>
                   
               </div>
              ))}
            </div>
                    )}
        </div>
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-30  bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
          <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
            <Widgets />
            </div>
          </div>
        )}
        <div className='hidden xl:inline ml-2'>
          <Widgets />
       </div>
        <CommentModal />
      </main>
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
          <MenuAlt1Icon className='pl-4 h-8 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-8 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-8 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  );
}
