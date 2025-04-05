import { HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import {  useState } from "react";
import Sidebar from "../components/National/Sidebar"
import Widgets from "../components/National/Widgets"
import CommentModal from "../components/National/CommentModal"
import StatusModal from "../components/National/StatusModal"
import Feed from "../components/News/NewsFeed";


function News() {
  
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
    <div className="flex flex-col min-h-screen ">
      <Head>
        <title>home</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
     
      <div className="flex min-h-screen w-full  ">  
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
        <div className="w-2/4">
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

export default News;
