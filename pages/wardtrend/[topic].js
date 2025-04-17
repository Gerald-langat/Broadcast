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
import StatusModal from '../../components/National/StatusModal';

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
    <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>{topic ? topic : 'loading...'}</title>
        <meta name="description" content="Generated and created by redAndttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
        <main className="flex max-w-7xl mx-auto">
                      {/* Sidebar for mobile */}
                      {isSidebarVisible && (
                        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsSidebarVisible(false)}>
                          <div onClick={(e) => e.stopPropagation()}>
                            <Sidebar />
                          </div>
                        </div>
                      )}
                  
                      {/* Sidebar for desktop */}
                      <div className="hidden xl:inline-flex  ">
                        <Sidebar />
                      </div>
                  
                      {/* Feed */}
                      <div className="flex-1 min-w-0 sm:min-w-[400px] mx-auto">
                        <div className="flex items-center space-x-2 py-3 w-full px-4 sticky top-0 bg-white dark:bg-gray-950 border-b dark:border-gray-800 border-gray-200">
                          <Tooltip content="back" arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                            <Link href={`/ward`}>
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
                              <WardTrends key={post.id} id={post.id} post={post} />
                            ))}
                          </div>
                        )}
                      </div>
                  
                      {/* Widgets */}
                      {isWidgetsVisible && (
                        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
                          <div onClick={(e) => e.stopPropagation()} className="ml-8">
                            <Widgets />
                          </div>
                        </div>
                      )}
                  
                      <div className="hidden xl:inline-flex w-[320px]">
                        <Widgets />
                      </div>
                  
                      <CommentModal />
                      <StatusModal />
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
