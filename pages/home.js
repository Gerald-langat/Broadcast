import { HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import {  useState } from "react";
import Sidebar from "../components/National/Sidebar"
import Widgets from "../components/National/Widgets"
import CommentModal from "../components/National/CommentModal"
import StatusModal from "../components/National/StatusModal"
import Feed from "../components/National/Feed"



function Home() {
  
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
 

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleWidgets = () => {
    setIsWidgetsVisible(!isWidgetsVisible);
  }

  const toggleHome = () => {
    setIsWidgetsVisible(false);
    setIsSidebarVisible(false);
  }


  return (
    <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>home</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>
     
      <div className="flex min-h-screen min-w-[580px]  flex-1">  
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
        <div className="hidden xl:block w-1/4">
          <Sidebar />
        </div>
        {/* Feed */}
        <div className="sm:w-2/4 w-full">
        <Feed />
        </div>
        {/* Widgets */}
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-30  bg-black bg-opacity-50 xl:hidden" 
          onClick={() => setIsWidgetsVisible(false)}>
          <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
            <Widgets />
            </div>
          </div>
        )}
        <div className="hidden xl:block ">
          <Widgets />
        </div>
        {/* Modals */}
        <CommentModal />
        <StatusModal />
      </div>
{/*bottom menu */}
<div className='xl:hidden justify-between bottom-0 z-40 sticky bg-slate-50
       dark:bg-gray-900 sm:w-screen min-w-[580px] flex p-2  sm:px-10 md:px-24 px-4 flex-grow'>
          <MenuAlt1Icon className='pl-4 h-10 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-10 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-10 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  );
}

export default Home;
