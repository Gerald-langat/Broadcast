import { MoonIcon, SunIcon } from '@heroicons/react/outline';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react'

function ModeButton() {

    const [mounted, setMounted] = useState(false);
    const { systemTheme, theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    },[])

    if (!mounted) {
        return null;
    }

    const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div className='z-50'>
   
      {currentTheme === "dark" && (
        <p
        className='flex gap-1 items-center px-4 p-1 rounded-full cursor-pointer dark:bg-gray-900 text-gray-100 border-gray-50
         border-[1px] dark:border-gray-900 dark:text-gray-200 '
        onClick={() => setTheme("light")}> 
        <span>Light</span>
        <SunIcon className='h-4 text-yellow-400'/>
        </p>
      )}
      
     
      {currentTheme === "light" && (
        <p
            className='flex gap-1 items-center px-4 p-1  rounded-full cursor-pointer dark:bg-neutral-800 border-gray-400
         border-[1px] dark:text-gray-200 text-gray-800 '
            onClick={() => setTheme("dark")}>
            <span>Dark</span>
            <MoonIcon className='h-4' />
        </p>
      )}
      
      
    </div>
  )
}

export default ModeButton
