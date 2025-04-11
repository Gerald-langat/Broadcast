import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

function Index() {
  const { user } = useUser(); // Get the current user
  const router = useRouter(); // Handle routing

  useEffect(() => {
    // Redirect to '/form' if the user is logged in
    if (user?.id) {
      // router.push('/form');
    }
  }, [user, router]); // Dependency array to avoid infinite loop

  return (
    <div className="flex flex-col w-full justify-center items-center h-screen ">
    <div className="mb-60 flex-col space-y-4 items-center">
    <Image 
      src='../../images/Brodcast.jpg'
      width={100}
      height={100}
      className='rounded-md'
    />
      <SignedOut>
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          <SignInButton /> {/* SignIn button for signed-out users */}
        </button>
      </SignedOut>

      <SignedIn>
  <div className="flex flex-row items-center space-x-2">
  <UserButton className="rounded-md"/>
    <p>{user?.firstName}</p>
    <p>{user?.lastName}</p>
    
  </div>
</SignedIn>

    </div>
    </div>
  );
}

export default Index;
