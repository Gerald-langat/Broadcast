'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // ✅ Correct router import
import { useSignIn, useUser } from '@clerk/nextjs';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // ✅ Ensure correct import
import Image from 'next/image';

function SignInWithGoogle() {

  const { user } = useUser();
  const [showToast, setShowToast] = useState('');
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const router = useRouter()

  // ✅ Ensure component always renders hooks in the same order
  useEffect(() => {
    if (!user || !user.primaryEmailAddress?.emailAddress) return; // ✅ Prevent running if user is undefined

    const checkUserExists = async () => {
      try {
        const userEmail = user.primaryEmailAddress.emailAddress;
        const userQuery = query(
          collection(db, 'userPosts'),
          where('email', '==', userEmail)
        );

        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          setShowToast('Login successful, redirecting to Home...');
          router.push('/home');
        } else {
          setShowToast('Login successful, please complete your profile');
          router.push('/form');
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    checkUserExists();
  }, [user, router]); // ✅ Dependencies fixed

  // ✅ Prevent returning early (keep hook calls consistent)
  if (!signIn) return <p>Loading...</p>;

  // ✅ Ensure function is always defined
  const signInWith = (strategy) => {
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/',
      })
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  };


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isLoaded) return

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.push('/form')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-full mx-auto">
    
    <div className="space-y-4 text-center py-8 px-20 w-full border max-w-2xl mx-auto rounded-lg">
    <div className='w-full justify-center flex space-x-2'>
    <p>Sign In to</p>
      <Image src={'../../images/Brodcast.jpg'} width={30} height={30}/>
    </div>
      <p
        onClick={() => signInWith('oauth_google')}
        className="border-red-400 border rounded-full p-3 dark:text-white cursor-pointer"
      >
        Sign in with Google
      </p>
      <p
        onClick={() => signInWith('oauth_facebook')}
        className="border-blue-400 border rounded-full p-3 dark:text-white cursor-pointer"
      >
        Sign in with Facebook
      </p>
      <p
        onClick={() => signInWith('oauth_apple')}
        className="dark:border-white border rounded-full p-3 dark:text-white cursor-pointer"
      >
        Sign in with Apple
      </p>
      <div className='flex items-center'>
        <hr className='w-1/2'/><span className='bg-white dark:bg-gray-950 p-2'>or</span><hr className='w-1/2'/>
      </div>
      
      <form onSubmit={(e) => handleSubmit(e)}>
        <div className='flex flex-col mb-3'>
      
          <input
            onChange={(e) => setEmail(e.target.value)}
            id="email"
            name="email"
            type="email"
            placeholder='Enter email address'
            value={email}
            className='bg-gray-950 border dark:border-white rounded-md outline-none focus:ring-0'
          />
        </div>
        <div className='flex flex-col'>
       
          <input
            onChange={(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            type="password"
            placeholder='Enter password'
            value={password}
            className='bg-gray-950 border dark:border-white rounded-md outline-none focus:ring-0'
          />
        </div>
        <button type="submit" className='dark:bg-gray-600 mt-3 w-full p-2 rounded-md cursor-pointer dark:hover:bg-gray-900'>Sign in</button>
      </form>
    {showToast && <p className="mt-4 text-green-500">{showToast}</p>}

    </div>
  
  </div>
  
  );
}

export default SignInWithGoogle;
