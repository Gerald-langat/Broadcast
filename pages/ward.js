import StatusModal from '../components/National/StatusModal'
import CommentWardModal from '../components/Ward/CommentModal'
import Feed from '../components/Ward/Feed'
import Sidebar from '../components/National/Sidebar'
import Widgets from '../components/Ward/Widgets'
import { HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline'
import Head from 'next/head'
import React, { useState } from 'react'

function ward() {
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
    <div className='dark:bg-gray-950'>
            <Head>
        <title>Ward</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>
       <div className="flex min-h-screen dark:bg-gray-950">
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
        <div className="hidden xl:block">
          <Sidebar />
        </div>
        {/* Feed */}
        <div>
        <Feed />
        </div>
        {/* Widgets */}
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-50  bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
          <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
            <Widgets />
            </div>
          </div>
        )}
        <div className="hidden xl:block">
          <Widgets />
        </div>
        {/* Modal */}
        <CommentWardModal />
        <StatusModal />
      </div>
      <div className='xl:hidden justify-between bottom-0 z-40 sticky bg-slate-50
       dark:bg-neutral-700 sm:w-screen min-w-[580px] flex p-2  sm:px-10 md:px-24 px-4'>
          <MenuAlt1Icon className='pl-4 h-8 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-8 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-8 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  )
}

export default ward
