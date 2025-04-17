import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where, getDocs } from 'firebase/firestore';
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

    try{
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
    } catch (error) {
      console.log("the error occured is:", error)
    }
    
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

  <main className="flex flex-1 min-h-screen sm:min-w-[768px] xl:max-w-7xl mx-auto mb-12">
    {/* Sidebar for mobile */}
    {isSidebarVisible && (
      <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsSidebarVisible(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          <Sidebar />
        </div>
      </div>
    )}

    {/* Sidebar for desktop */}
    <div className="hidden xl:inline-flex w-[20%] ">
      <Sidebar />
    </div>

    {/* Feed */}
    <div className="flex-col w-full sm:min-w-[500px] mx-auto">
      <div className="flex items-center space-x-2 py-3 w-full px-4 sticky top-0 bg-white dark:bg-gray-950 border-b dark:border-gray-800 border-gray-200">
        <Tooltip content="back" arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <Link href={`/national`}>
            <ArrowLeftIcon className="h-8 sm:h-8 cursor-pointer animate-pulse" />
          </Link>
        </Tooltip>
        <h2 className="text-lg sm:text-xl font-bold">
          {topic ? <span>{topic}</span> : 'Loading...'}
        </h2>
      </div>

      {loading ? (
        <Button color="gray" className="border-0">
          <Spinner aria-label="Loading..." size="sm" />
          <span className="pl-3">Loading...</span>
        </Button>
      ) : (
        <div>
          {posts.map((post) => (
            <NationTrends key={post.id} id={post.id} post={post} />
          ))}
        </div>
      )}
    </div>

    {/* Widgets */}
    {isWidgetsVisible && (
      <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
        <div onClick={(e) => e.stopPropagation()} >
          <Widgets />
        </div>
      </div>
    )}

    <div className="hidden xl:inline-flex w-[30%]">
      <Widgets />
    </div>

    <CommentModal />
    <StatusModal />
  </main>

  {/* Bottom Navigation for Mobile */}
<div className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50  dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4">
          <MenuAlt1Icon className="pl-4 h-8 cursor-pointer" onClick={toggleSidebar} />
          <HomeIcon className="h-8 cursor-pointer" onClick={toggleHome} />
          <SearchIcon className="pr-6 h-8 cursor-pointer" onClick={toggleWidgets} />
        </div>
</div>

  );
}
