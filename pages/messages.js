
import Head from 'next/head'
import MessagesFeed from '../components/Message/MessagesFeed'
import Sidebar from '../components/National/Sidebar';
import { HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline';
import { useEffect, useState } from 'react';
import StatusModal from '../components/National/StatusModal';



function messages() {
const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

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
  return (
    
    <div className="flex flex-col min-h-screen w-full">
        <Head>
          <title>Messages</title>
          <meta name="description" content="Generated and created by redAnttech" />
          <link rel="icon" href="../../images/Brodcast.jpg" />
        </Head>
      
        {/* Main Content */}
        <div className="flex flex-1 min-h-screen sm:min-w-[768px] xl:max-w-7xl mx-auto mb-12">
          {/* Sidebar */}
          {isSidebarVisible && (
            <div className="fixed inset-0 z-30 xl:hidden w-full" onClick={() => setIsSidebarVisible(false)}>
              <div onClick={(e) => e.stopPropagation()} className="relative">
                <Sidebar />
              </div>
            </div>
          )}
          <div className="hidden xl:block w-[20%] ">
            <Sidebar />
          </div>
      
          {/* Feed */}
          <div className="flex-1 min-w-0 sm:min-w-[500px] mx-auto">
            <MessagesFeed />
          </div>
          <StatusModal />
        </div>
      
        {/* Bottom Menu */}
        <div className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50  dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4">
          <MenuAlt1Icon className="pl-4 h-8 cursor-pointer" onClick={toggleSidebar} />
          <HomeIcon className="h-8 cursor-pointer" onClick={toggleHome} />
          <SearchIcon className="pr-6 h-8 cursor-pointer" onClick={toggleWidgets} />
        </div>
      </div>

 
  )
}

export default messages
