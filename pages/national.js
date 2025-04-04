import { HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import { useState } from "react";
import Sidebar from "../components/National/Sidebar";
import Widgets from "../components/National/Widgets";
import CommentModal from "../components/National/CommentModal";
import StatusModal from "../components/National/StatusModal";
import Feed from "../components/National/Feed";
import { useUser } from "@clerk/nextjs";
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";



function Home() {
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
    setIsSidebarVisible((prev) => !prev);
    setIsWidgetsVisible(false);
  };

  const toggleWidgets = () => {
    setIsWidgetsVisible((prev) => !prev);
    setIsSidebarVisible(false);
  };

  const toggleHome = () => {
    setIsWidgetsVisible(false);
    setIsSidebarVisible(false);
  };

  useEffect(() => {
    if (!userData?.uid) {
      router.push('/'); // Instead of using signout, you can push to the signout page
    }
  }, [user, router]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>Home</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
  
      {/* Main Content */}
      <div className="flex min-h-screen min-w-[560px] flex-1 ">
        {/* Sidebar */}
        {isSidebarVisible && (
          <div
            className="fixed inset-0 z-30 xl:hidden w-full"
            onClick={() => setIsSidebarVisible(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the sidebar
              className="relative"
            >
              <Sidebar />
            </div>
          </div>
        )}
        <div className="hidden xl:block w-1/4 ">
          <Sidebar />
        </div>

        {/* Feed */}
        <div className="sm:w-2/4 w-full">
          <Feed />
        </div>

        {/* Widgets */}
        {isWidgetsVisible && (
          <div
            className="fixed inset-0 z-30 bg-white dark:bg-gray-950 xl:hidden"
            onClick={() => setIsWidgetsVisible(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the widgets
              className="relative ml-10"
            >
              <Widgets />
            </div>
          </div>
        )}
        <div className="hidden xl:ml-0 lg:ml-32 lg:block w-1/4">
          <Widgets />
        </div>

        {/* Modals */}
        <CommentModal />
        <StatusModal />
      </div>

      {/* Bottom Menu */}
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
        <MenuAlt1Icon
          className="pl-4 h-10 cursor-pointer"
          onClick={toggleSidebar}
        />
        <HomeIcon
          className="h-10 cursor-pointer"
          onClick={toggleHome}
        />
        <SearchIcon
          className="pr-6 h-10 cursor-pointer"
          onClick={toggleWidgets}
        />
      </div>
    </div>
  );
}

export default Home;
