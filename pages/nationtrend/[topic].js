import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import Head from "next/head";
import Sidebar from '../../components/National/Sidebar';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Widgets from '../../components/National/Widgets';
import CommentModal from '../../components/National/CommentModal';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import NationTrends from '../../components/National/NationTrends';
import StatusModal from '../../components/National/StatusModal';
import Link from 'next/link';

export default function TopicPostsPage() {
  const router = useRouter();
  const { topic } = router.query;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
  

  useEffect(() => {
    if (!loading) {
      setLoading(true);
    }

    const q = query(collection(db, "national"), orderBy('timestamp', 'desc'));
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
  }, [topic]);
  

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
        <meta name="description" content="Generated and created by redAndtech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <main className="flex min-h-screen mx-auto dark:bg-gray-950 sm:w-screen min-w-[580px] flex-grow sm:px-10 md:px-24 xl:px-0 flex-1">
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
        <div className="xl:ml-[350px] 2xl:mr-[150px] 2xl:ml-[560px] xl:min-w-[576px] 2xl:min-w-[700px]  sm:min-w-full flex-grow max-w-xl">
          <div className="flex items-center space-x-2  py-2 px-3 sticky top-0 dark:bg-gray-950 bg-white border-[1px] rounded-md dark:border-gray-900
             border-gray-200">
          <Tooltip content='back' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <Link href={`/national`}>
            <div className="animate-pulse">
              <ArrowLeftIcon className="h-10 sm:h-8 cursor-pointer animate-pulse" />
            </div>
            </Link>
          </Tooltip>
            <h2 className="text-lg sm:text-xl font-bold cursor-pointer">
            {topic && (
              <span className='text-2xl sm:text-lg'>{topic}</span>
              )}
            </h2>
          </div>
          
          {loading ? (<Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>):(
                      <div>
              {posts.map((post) => (
               <div key={post.id}>
               
                 <NationTrends  key={post.id} id={post.id} post={post}/>
                 
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
    <div className='hidden xl:inline ml-6'>
          <Widgets />
       </div>
        <CommentModal />
        <StatusModal />
      </main>
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
          <MenuAlt1Icon className='pl-4 h-10 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-10 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-10 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  );
}
