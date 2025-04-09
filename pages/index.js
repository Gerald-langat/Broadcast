import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

function Index() {
  const { user } = useUser(); // Get the current user
  const router = useRouter(); // Handle routing

  useEffect(() => {
    // Redirect to '/form' if the user is logged in
    if (user?.id) {
      router.push('/form');
    }
  }, [user, router]); // Dependency array to avoid infinite loop

  return (
    <div className="flex w-full justify-center items-center h-screen ">
      <SignedOut>
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
        >
          <SignInButton /> {/* SignIn button for signed-out users */}
        </button>
      </SignedOut>

      <SignedIn>
        {/* If the user is signed in, you could display a user button or something else */}
        <UserButton />
      </SignedIn>
    </div>
  );
}

export default Index;
