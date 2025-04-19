import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { postIdMembers, modalStatus } from '../../atoms/modalAtom';
import { HomeIcon, InboxInIcon, NewspaperIcon, OfficeBuildingIcon, PauseIcon, PlusIcon, UserIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import {  SignedOut, SignInButton, useUser } from '@clerk/nextjs';
import { Spinner } from 'flowbite-react';



export default function Sidebar() {
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
   const [open, setOpen] = useRecoilState(modalStatus);
  const [posts, setPosts] = useState([]);
  // const { hasFollowed, followMember, followloading } = useFollow();
  const [userPosts, setUserPosts] = useState(null);
  const { user } = useUser();


  // Fetch user posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.id) {
        // Exit early if userDetails or userDetails.uid is missing
        return;
      }
  
      try {
        setLoading(true); // Only set loading state when query starts
        const q = query(collection(db, 'userPosts'), where('uid', '==', user.id));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          setUserPosts(querySnapshot.docs[0].data());
        }
      } catch (error) {
        console.error("Error fetching user posts: ", error);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };
  
    fetchUserPosts();
  }, [user?.id]);
  

  // Fetch members' posts
  useEffect(() => {
    if (!db) return;
  
    const fetchPosts = async () => {
      const q = query(collection(db, 'userPosts'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postsData); // Set the state with the array of posts
        setLoading(false);
      });
  
      return () => unsubscribe();
    };
  
    fetchPosts();
  }, [db]);
  
  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'; // 1 million and above
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'k'; // 1 thousand and above
    } else {
      return number; // below 1 thousand
    }
  };
  

  return (
    <div className="dark:bg-gray-950 mr-1 h-screen bg-white top-0 sticky p-2 w-full">  
{loading ? (
          <Spinner aria-label="Loading spinner" size="md" />
      ) : (
        <>
        {user?.id ? (
  <>
    {userPosts && (
      <div className="flex space-x-2">
        {userPosts?.userImg ? (
          <img
            src={userPosts.userImg}
            className="sm:h-11 sm:w-11 h-20 w-20 rounded-md cursor-pointer hover:brightness-95 shadow-gray-800 shadow-sm dark:shadow-gray-600"
          />
        ) : (
          <img
            src={userPosts.imageUrl}
            className="sm:h-11 sm:w-11 h-20 w-20 rounded-md cursor-pointer hover:brightness-95 shadow-gray-800 shadow-sm dark:shadow-gray-600"
          />
        )}

        <div className="flex-1 flex-col">
          <p className="font-bold text-lg sm:text-sm dark:text-gray-300">{userPosts.name}</p>
          <p className="font-bold text-lg sm:text-sm text-gray-400">@{userPosts.nickname}</p>
        </div>

        {/* PlusIcon and Add Status */}
        <div className="flex items-center ml-auto">
          <div
            className="flex items-center bg-slate-100 dark:bg-gray-900 border-[1px] dark:border-gray-900 border-slate-100 rounded-full p-2 space-x-1"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="h-6 dark:bg-gray-900 dark:text-gray-500 bg-gray-50 rounded-full text-gray-400" />
            <p className="font-bold text-sky-400 text-lg sm:text-sm cursor-pointer lg:inline">Add status</p>
          </div>
        </div>
      </div>
    )}
  </>
) : (
  <div className="flex items-center ml-auto">
    <SignedOut>
      <button
        type="button"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
      >
        <SignInButton />
      </button>
    </SignedOut>
  </div>
)}


          <div>
          <Link href='/national'>
            <div className='flex cursor-pointer items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4'>
              <HomeIcon className='h-6'/>
              <span className='sm:text-lg'>Home</span>
            </div>
            </Link>
            <Link href='/media'>
            <div className='flex  items-center space-x-4 dark:text-gray-200 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4'>
              <PauseIcon className='h-6'/>
              <span className='text-lg'>Media</span>
            </div>
            </Link>
            <Link href='/news'>
            <div className='flex  items-center space-x-4 dark:text-gray-200 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4'>
              <NewspaperIcon className='h-6'/>
              <span className='text-lg'>News</span>
            </div>
            </Link>
            <Link href='/marketplace'>
            <div className='flex  items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4 cursor-pointer'>
              <OfficeBuildingIcon className='h-6'/>
              <span className='text-lg'>MarketPlace</span>
            </div>
            </Link>
            <Link href={'/messages'}>
            <div className='flex  items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4 cursor-pointer'>
              <InboxInIcon className='h-6'/>
              <span className='text-lg'>Message</span>
            </div>
            </Link>
            <Link href={'/profile'}>
            <div className='flex items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4 cursor-pointer'>
              <UserIcon className='h-6'/>
              <span className='text-lg'>Profile</span>
            </div>
            </Link>
          </div>
       
         
         <div className='flex justify-between w-full items-center'>
            <h2 className="font-bold  dark:text-gray-300 text-xl">Members</h2>
    <Link href={'/members'}>
            <p className='text-xs text-blue-500 cursor-pointer ' >View all Members(<span>{formatNumber(posts.length)}</span>)</p>
          </Link>
        </div>

        <div className="h-[500px] overflow-auto scrollbar-hide">

  {posts
    .filter((post) => post?.uid === user?.id) // Only the current user
    .map((post) => (
      <Link href={`/userProfile/${post?.uid}`} key={post.id}>
        <div className="flex items-center justify-between w-full  p-1">
          {/* Profile Image */}
          <div className="mr-2">
            {post?.userImg ? (
              <img
                className="h-14 w-14 sm:h-10 sm:w-10 object-cover rounded-md shadow-gray-800 shadow-sm dark:shadow-gray-600"
                src={post.userImg}
                alt="User Profile"
              />
            ) : (
              <img
                className="h-14 w-14 sm:h-10 sm:w-10 object-cover rounded-md shadow-gray-800 shadow-sm dark:shadow-gray-600"
                src={post?.imageUrl}
                alt="User Profile"
              />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex dark:text-gray-200 text-lg">
              <p className="mr-1 w-20 truncate">{post?.name}</p>
              <p className="mr-1 w-20 truncate">{post?.lastname}</p>
            </div>
            <div className="font-bold text-lg truncate w-28 sm:text-sm text-gray-500">
              @{post?.nickname}
            </div>
          </div>
        </div>
      </Link>
    ))}

  {/* Then, show other users' posts */}
  {posts
    .filter((post) => post?.uid !== user?.id) // All other users
    .map((post) => (
      <Link href={`/userProfile/${post?.uid}`} key={post.id}>
        <div className="flex items-center w-fit p-1">
          {/* Profile Image */}
          <div className="mr-2">
            {post?.userImg ? (
              <img
                className="h-14 w-14 sm:h-10 sm:w-10 object-cover rounded-md shadow-gray-800 shadow-sm dark:shadow-gray-600"
                src={post.userImg}
                alt="User Profile"
              />
            ) : (
              <img
                className="h-14 w-14 sm:h-10 sm:w-10 object-cover rounded-md shadow-gray-800 shadow-sm dark:shadow-gray-600"
                src={post?.imageUrl}
                alt="User Profile"
              />
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 w-full">
            <div className="flex dark:text-gray-200 text-lg">
              <p className="mr-1 w-20 truncate">{post?.name}</p>
              <p className="mr-1 w-20 truncate">{post?.lastname}</p>
            </div>
            <div className="font-bold text-lg truncate w-28 sm:text-sm text-gray-500">
              @{post?.nickname}
            </div>
          </div>
        </div>
      </Link>
    ))}
</div>
</>
      )}
      </div>
  );
}
