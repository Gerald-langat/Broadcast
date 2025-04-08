import StatusModal from '../components/National/StatusModal'
import CommentWardModal from '../components/Ward/CommentModal'
import Feed from '../components/Ward/Feed'
import Sidebar from '../components/National/Sidebar'
import Widgets from '../components/Ward/Widgets'
import { HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline'
import Head from 'next/head'
import React, { useState } from 'react'
import CommentModal from '../components/Ward/CommentModal'

function ward() {
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
        <title>Ward</title>
        <meta name="description" content="Generated and created by redAnt team" />
        <link rel="icon"  href="../../images/Brodcast.jpg" />
      </Head>
     
          <div className="flex max-w-7xl mx-auto">
            {/* Sidebar */}
            {isSidebarVisible && (
              <div className="fixed inset-0 z-30 xl:hidden w-full" onClick={() => setIsSidebarVisible(false)}>
                <div onClick={(e) => e.stopPropagation()} className="relative">
                  <Sidebar />
                </div>
              </div>
            )}
            <div className="hidden xl:block w-[20%]">
              <Sidebar />
            </div>
        
            {/* Feed */}
            <div className="flex-1 min-w-0 ">
              <Feed />
            </div>
        
            {/* Widgets */}
            {isWidgetsVisible && (
              <div className="fixed inset-0 z-30 bg-white dark:bg-gray-950 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
                <div onClick={(e) => e.stopPropagation()} className="relative ml-10">
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

export default ward
