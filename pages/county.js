import Widgets from '../components/County/Widgets'
import Feed from '../components/County/Feed'
import Sidebar from '../components/National/Sidebar'
import Head from 'next/head'
import React, { useState } from 'react'
import CommentModal from '../components/County/CommentModal'
import { HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline'
import StatusModal from '../components/National/StatusModal'


function county() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);


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
    <div className=" flex flex-col min-h-screen">
      <Head>
        <title>County</title>
        <meta name="description" content="Generated and created by redAnt team" />
        <link rel="icon"  href="../../images/Brodcast.jpg" />
      </Head>
     
        <div className="flex min-h-screen ">
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
          <MenuAlt1Icon className='pl-4 h-10 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-10 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-10 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  )
}

export default county
