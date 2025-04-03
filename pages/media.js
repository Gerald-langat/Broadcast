import React, { useState } from 'react'
import MediaFeed from '../components/Media/MediaFeed'
import { HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline'
import Widgets from '../components/National/Widgets';
import Sidebar from '../components/National/Sidebar';


function media() {

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
    <div className="flex flex-col min-h-screen justify-between w-full">
   
   <div className='min-w-[580px] sm:w-full'>
   <MediaFeed />
   </div>
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
  
 
      {isSidebarVisible && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsSidebarVisible(false)}>
          <div onClick={(e) => e.stopPropagation()}>
            <Sidebar />
          </div>
        </div>
      )}

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
  )
}  

export default media
