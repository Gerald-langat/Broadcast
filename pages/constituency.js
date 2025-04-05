import Widgets from '../components/Constituency/Widgets'
import Feed from '../components/Constituency/Feed'
import Sidebar from '../components/National/Sidebar'
import Head from 'next/head'
import React, { useState } from 'react'
import CommentModal from '../components/Constituency/CommentModal'
import { HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline'
import StatusModal from '../components/National/StatusModal'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'


function constituency() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
  const { user } = useUser();
  const router = useRouter()
    const [userData, setUserData] = useState(null);
  

    useEffect(() => {
      const fetchUserData = async () => {
        if (user?.id) {
          const q = query(collection(db, 'userPosts'), where('uid', '==', user.id));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        }
      };
      fetchUserData();
    }, [user?.id]);

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

  useEffect(() => {
      if (!userData?.uid) {
        router.push('/'); // Instead of using signout, you can push to the signout page
      }
    }, [userData?.uid, router]);

  return (
    <div className='dark:bg-gray-950'>
      <Head>
        <title>constituency</title>
        <meta name="description" content="Generated and created by redAndtech" />
        <link rel="icon"  href="../../images/Brodcast.jpg" />
      </Head>

      <div className="flex min-h-screen dark:bg-gray-950">
        {/* Sidebar */}
        {isSidebarVisible && (
              <div
                className="fixed inset-0 z-30 xl:hidden"
                onClick={() => setIsSidebarVisible(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
                  <Sidebar />
                </div>
              </div>
            )}
        <div className="hidden xl:block">
          <Sidebar />
        </div>
        {/* Feed */}
        <div>
        <Feed />
        </div>
        {/* Widgets */}
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-30 ml-4 bg-white dark:bg-gray-950 min-h-screen bg-opacity-50 xl:hidden" 
          onClick={() => setIsWidgetsVisible(false)}>
          <div className="ml-10"
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
            <Widgets />
            </div>
          </div>
        )}
        <div className="hidden xl:ml-0 lg:ml-32 lg:block w-1/4">
          <Widgets />
        </div>
        {/* Modal */}
        <CommentModal />
        <StatusModal />
      </div>
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
          <MenuAlt1Icon className='pl-4 h-8 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-8 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-8 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  )
}

export default constituency
