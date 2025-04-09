import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { useRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { Members, modalStatus } from '../../atoms/modalAtom';
import { HomeIcon, InboxInIcon, NewspaperIcon, OfficeBuildingIcon, PauseIcon, PlusIcon, UserIcon } from '@heroicons/react/outline';
import Link from 'next/link';
import {  useUser } from '@clerk/nextjs';



export default function Sidebar() {
  
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [open, setOpen] = useRecoilState(modalStatus);
  const [posts, setPosts] = useState([]);
  // const { hasFollowed, followMember, followloading } = useFollow();
  const [userPosts, setUserPosts] = useState(null);
  const { user } = useUser();
  const [openModal, setOpenModal] = useRecoilState(Members);


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
    <div className="dark:bg-gray-950 mr-1 top-0 sticky  p-2 ">  

          {userPosts && (
            <div className="flex space-x-2">
              
              {userPosts?.userImg ? (
                <img
                  src={userPosts.userImg}
                  className="sm:h-11 sm:w-11 h-20 w-20 rounded-md cursor-pointer hover:brightness-95 shadow-gray-800 shadow-sm dark:shadow-gray-600"
                />
              ): (
                <img
                  src={userPosts.imageUrl}
                  className="sm:h-11 sm:w-11 h-20 w-20 rounded-md cursor-pointer hover:brightness-95 shadow-gray-800 shadow-sm dark:shadow-gray-600"
                />
              )}
                
               
              <div className="flex-1 flex-col">
                <p className="font-bold text-lg sm:text-sm dark:text-gray-300">{userPosts.name}</p>
                <p className="font-bold text-lg sm:text-sm text-gray-400">@{userPosts.nickname}</p>
              </div>
              
              {/* Move PlusIcon and Add Status to the end */}
              <div className="flex items-center ml-auto">
                <div
                  className="flex items-center bg-slate-100 dark:bg-gray-900 border-[1px] dark:border-gray-900 border-slate-100 rounded-full p-2 space-x-1"
                  onClick={() => setOpen(true)}
                >
                  <PlusIcon className="h-10 sm:h-8 dark:bg-gray-900 dark:text-gray-500 bg-gray-50 rounded-full text-gray-400" />
                  <p className="font-bold text-sky-400 text-xl sm:text-sm cursor-pointer lg:inline">Add status</p>
                </div>
              </div>
            </div>

          )}
          
          <div className=''>
          <Link href='/national'>
            <div className='flex cursor-pointer items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4'>
              <HomeIcon className='h-9'/>
              <span className='text-2xl sm:text-lg'>Home</span>
            </div>
            </Link>
            <Link href='/media'>
            <div className='flex  items-center space-x-4 dark:text-gray-200 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4'>
              <PauseIcon className='h-9'/>
              <span className='text-2xl sm:text-lg'>Media</span>
            </div>
            </Link>
            <Link href='/news'>
            <div className='flex  items-center space-x-4 dark:text-gray-200 cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4'>
              <NewspaperIcon className='h-9'/>
              <span className='text-2xl sm:text-lg'>News</span>
            </div>
            </Link>
            <Link href='/marketplace'>
            <div className='flex  items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4 cursor-pointer'>
              <OfficeBuildingIcon className='h-9'/>
              <span className='text-2xl sm:text-lg'>MarketPlace</span>
            </div>
            </Link>
            <Link href={'/messages'}>
            <div className='flex  items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4 cursor-pointer' onClick={() => router.push('/messages')}>
              <InboxInIcon className='h-9'/>
              <span className='text-2xl sm:text-lg'>Message</span>
            </div>
            </Link>
            <Link href={'/profile'}>
            <div className='flex items-center space-x-4 dark:text-gray-200 dark:hover:bg-gray-900 hover:bg-gray-200 rounded-full w-full px-2 sm:py-2 py-4 cursor-pointer' onClick={() => router.push('/profile')}>
              <UserIcon className='h-9'/>
              <span className='text-2xl sm:text-lg'>Profile</span>
            </div>
            </Link>
          </div>
          
          <div>
         
         <div className='flex justify-between w-full items-center'>
            <h2 className="font-bold ml-4 dark:text-gray-300 text-2xl sm:text-lg">Members</h2>
    
            <p className='text-xs text-blue-500 cursor-pointer' onClick={() => setOpenModal(true)}>View all Members(<span>{formatNumber(posts.length)}00</span>)</p>
          
        </div>

        <div className="h-[500px] w-[300px] overflow-auto scrollbar-hide">
  {posts.map((post) => (
     <Link href={`/userProfile/${post?.uid}`}>
    <div key={post.id} className="flex items-center w-fit p-1 ">
   
      {/* Profile Image or Initials */}
      <div className="m-4">
        {post?.userImg ? (
          <img
            className="h-14 w-14 sm:h-10 object-cover sm:w-10 rounded-md shadow-gray-800 shadow-sm dark:shadow-gray-600"
            src={post.userImg} 
            alt="User Profile"
            width={400}
            height={400}
            layout="intrinsic"
          />
        ) : (
          <img
            className="h-14 w-14 sm:h-10 sm:w-10 rounded-md shadow-gray-800 shadow-sm dark:shadow-gray-600"
            src={post?.imageUrl} 
            alt="User Profile"
            width={400}
            height={400}
            layout="intrinsic"
          />
        )}
      </div>

      {/* User Info */}
      <div className="flex-1 w-full">
        <div>
          <div className="flex dark:text-gray-200 text-2xl sm:text-lg">
            <p className="mr-1">{post?.name}</p>
            <p className="mr-1">{post?.lastname}</p>
          </div>
          <div className="font-bold text-lg truncate w-28 sm:text-sm text-gray-500">
            @{post?.nickname}
          </div>
        </div>
      </div>

      {/* Follow Button */}
      {/* <div className="ml-auto">
        <p
          className={`${
            userPosts?.name === post?.name ? 'hidden' : 'font-bold text-blue-500 sm:text-sm text-lg cursor-pointer'
          }`}
          onClick={() => followMember(post?.id)}
        >
          {followloading[post?.id] ? (
            <Spinner aria-label="Loading spinner" size="sm" />
          ) : hasFollowed[post?.id] ? (
            "Unfollow"
          ) : (
            "Follow"
          )}
        </p>
      </div> */}  
    </div>
    </Link>
  ))}
</div>
          </div>
    </div>
  );
}
