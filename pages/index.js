import { HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import { useEffect, useState } from "react";
import Sidebar from "../components/National/Sidebar";
import Widgets from "../components/National/Widgets";
import CommentModal from "../components/National/CommentModal";
import StatusModal from "../components/National/StatusModal";
import Feed from "../components/National/Feed";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";





function Home() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser()
  const router = useRouter();

  
  
  useEffect(() => {
    if (!user || !user?.id) return;
 
    const checkUserExists = async () => {
      try {
        const userQuery = query(
          collection(db, 'userPosts'),
          where('uid', '==', user.id)
        );
        const querySnapshot = await getDocs(userQuery);
  
        if (querySnapshot.empty) {
          
            router.push('/form'); // ✅ Only push after alert is hidden
          }
       
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
  
    checkUserExists();
  }, [user?.id]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // loader will be visible for 1 second

    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        {/* Replace this div with your custom loader if you have one */}
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
      <div className="flex flex-col min-h-screen w-full">
        <Head>
          <title>National</title>
          <meta name="description" content="Generated and created by redAnttech" />
          <link rel="icon" href="../../images/Brodcast.jpg" />
        </Head>
      
        {/* Main Content */}
        <div className="flex flex-1 min-h-screen sm:min-w-[768px] xl:max-w-7xl mx-auto mb-12">
          {/* Sidebar */}
          {isSidebarVisible && (
            <div className="fixed inset-0 z-30 xl:hidden min-h-screen w-full" onClick={() => setIsSidebarVisible(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <Sidebar />
              </div>
            </div>
          )}
          <div className="hidden xl:block w-[20%] ">
            <Sidebar />
          </div>
      
          {/* Feed */}
          <div className="flex-1 min-w-0 sm:min-w-[400px] mx-auto">
            <Feed />
          </div>
      
          {/* Widgets */}
          {isWidgetsVisible && (
            <div className="fixed inset-0 z-30 bg-white dark:bg-gray-950 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
              <div onClick={(e) => e.stopPropagation()}>
                <Widgets />
              </div>
            </div>
          )}
          <div className="hidden xl:block w-[30%]">
            <Widgets />
          </div>
      
          {/* Modals */}
          <CommentModal />
          <StatusModal />
        </div>
      
        {/* Bottom Menu */}
        <div className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50  dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4">
          <MenuAlt1Icon className="pl-4 h-8 cursor-pointer" onClick={toggleSidebar} />
          <HomeIcon className="h-8 cursor-pointer" onClick={toggleHome} />
          <SearchIcon className="pr-6 h-8 cursor-pointer" onClick={toggleWidgets} />
        </div>
      </div>
  );
}

export default Home;



