import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Head from "next/head";
import Sidebar from '../../components/National/Sidebar';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Widgets from '../../components/Constituency/Widgets';
import CommentModal from '../../components/Constituency/CommentModal';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import ConstituencyTrends from '../../components/Constituency/ConstituencyTrends';
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
    if (!userData || !userData.constituency) {
      setLoading(true);
      return;
    }
  
    const q = query(collection(db, "constituency", userData.constituency, "posts"), orderBy('timestamp', 'desc'));
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
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <main className="flex max-w-7xl mx-auto">
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
        <div className="flex-grow max-w-full xl:max-w-2xl 2xl:max-w-3xl">
          <div className="flex items-center space-x-2  p-2 sticky top-0 bg-white border-[1px] rounded-md border-gray-300 dark:border-gray-900 dark:bg-gray-950">
          <Tooltip content='back' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <Link href={'/constituency'}>
            <div className="animate-pulse">
              <ArrowLeftIcon className="h-8 cursor-pointer animate-pulse" />
            </div>
            </Link>
          </Tooltip>
            <h2 className="text-lg  font-bold cursor-pointer">
            {topic ? (topic):(loading && <Spinner size="sm" />)}
            </h2>
          </div>
          {loading ? (<Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>):(

                      <div>
              {posts.map((post) => (
               <div key={post.id}>
               
                 <ConstituencyTrends  key={post.id} id={post.id} post={post}/>
                    
               </div>
              ))}
            </div>
                    )}
        </div>
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-30 ml-4 dark:bg-gray-950 min-h-screen bg-opacity-50 xl:hidden" 
          onClick={() => setIsWidgetsVisible(false)}>
          <div className="ml-10"
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
            <Widgets />
            </div>
          </div>
        )}
        <div className='hidden xl:inline'>
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
