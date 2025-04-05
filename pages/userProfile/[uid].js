import React, { useEffect, useRef, useState } from 'react';
import { ArrowCircleRightIcon, ArrowLeftIcon, BookmarkIcon, PhotographIcon } from '@heroicons/react/outline';
import { db } from '../../firebase';
import { collection,  getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { Button, Spinner } from 'flowbite-react';
import { useRouter } from 'next/router';
import Head from 'next/head'; // Adjust the path to your script.js
import ModeButton from '../../components/ModeButton';
import Post from './post';
import Book from './Book';
import { useRecoilState } from 'recoil';
import { postIdState } from '../../atoms/modalAtom';
import Reply from './Reply';
import { useUser } from '@clerk/nextjs';


function Feed() {
  const [post, setPost] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [markPosts, setMarkPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const filePickerRef = useRef(null);
  const router = useRouter();
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [isReplyVisible, setIsReplyVisible] = useState(false);
  const [isBookVisible, setIsBookVisible] = useState(false);
  const [isPostVisible, setIsPostVisible] = useState(false);
  const [postId] = useRecoilState(postIdState);
  const [replies, setReplies] = useState([])
    const { uid } = router.query;
    const { user } = useUser();

  // following
  const getFollowingCount = () => {
    if (!user.id) return;
  
  
      const q = query(collection(db, "following"), where('followingId', '==', user.id));
  
      // Set up real-time listener
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const followingCount = snapshot.size; // Get the number of documents (i.e., following count)
        setFollowingCount(followingCount); // Update the state with the real-time following count
      });
  
      return unsubscribe; // Return unsubscribe to clean up listener later
    
  };
  
  // Set up useEffect to listen for changes in userDetails.uid and update in real-time
  useEffect(() => {
    if (user?.id) {
      const unsubscribe = getFollowingCount(user.id);
  
      // Clean up listener when the component unmounts or userDetails.uid changes
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user?.id]); 



const getFollowerCount = () => {
  if (!user.id) return;


    const q = query(collection(db, "following"), where('followerId', '==', user.id));

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const followerCount = snapshot.size; // Get number of documents in the collection
      setFollowerCount(followerCount); // Update the state with the real-time count
    });

    return unsubscribe; // Return unsubscribe to clean up listener later
 
};

// Set up useEffect to listen for changes in postId and set up real-time updates
useEffect(() => {
  if (user?.id) {
    const unsubscribe = getFollowerCount(user.id);

    // Clean up listener when userDetails.uid changes or component unmounts
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }
}, [user?.id]); 

 

  // user image and back image
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Start loading
  
      try {
        if (uid) {
          const q = query(collection(db, "userPosts"), where("uid", "==", uid));
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();  
            setPost(userData);
          } else {
            console.log("No user found with this nickname.");
            setPost(null); // Clear post state if no data is found
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Ensure loading stops in all cases
      }
    };
  
    fetchUserData();
  }, [uid]);
  

// fetching posts count && posts
  useEffect(() => {
    const fetchPost = async () => {
      if (uid) {
        const q = query(collection(db, "national"), where("uid", "==", uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
          setReplies(posts);
          setLoading(false);
        });
        return () => unsubscribe();
      }
    };

    fetchPost();
  }, [uid]);



// fetching replies
  useEffect(() => {
    const fetchPost = async () => {
      if (uid) {
        const q = query(collection(db, "national"), where("uid", "==", uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
          setUserPosts(posts);
          setLoading(false);
        });
        return () => unsubscribe();
      }
    };

    fetchPost();
  }, [uid]);

  // fetching bookmarks
  const userId = post?.uid;
  useEffect(() => {
    const fetchPost = async () => {
      if (userId) {
        const q = query(collection(db, `bookmarks/${userId}/bookmarks`));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()}));
          setMarkPosts(posts);
          setLoading(false);
        });
        return () => unsubscribe();
      }
    };

    fetchPost();
  }, [userId]);

  // Handle image upload
  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };


  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'; // 1 million and above
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'k'; // 1 thousand and above
    } else {
      return number; // below 1 thousand
    }
  };

  const toggleReply = () => {
    setIsReplyVisible(!isReplyVisible);
    setIsBookVisible(false);
    setIsPostVisible(false);
  }

  const togglePost = () => {
    setIsPostVisible(!isPostVisible);
    setIsBookVisible(false);
    setIsReplyVisible(false);
  }

  const toggleBookmark = () => {
    setIsBookVisible(!isBookVisible);
    setIsReplyVisible(false);
    setIsPostVisible(false);
  }

  useEffect(() => {
    if (!post?.uid) {
      router.push('/'); // Instead of using signout, you can push to the signout page
    }
  }, [post?.uid, router]);
  

  return (
    <div>
    <Head>
    <title>
    {loading 
  ? "Loading..." 
  : post 
    ? `${post.name || ""} ${post.lastname || ""} @${post.nickname || "loading..."}`
    : "loading..."}

</title>

      <meta name="description" content="Generated and created by redAntTech" />
      <link rel="icon" href="../../images/Brodcast.jpg" />
    </Head>
  
   {loading ? (
          <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
            <Spinner aria-label="Loading spinner" size="md" />
            <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
          </Button>
        ) : (
          <>
    <div className='flex flex-col h-screen w-screen'>
    <div className='p-2 flex space-x-1 items-center justify-center dark:text-gray-100 mt-4 z-40'>
    <ArrowLeftIcon className='sm:h-8 sm:w-8 h-10 animate-pulse cursor-pointer' onClick={()=> router.back()}/>
      <p className='sm:text-lg text-2xl'>post</p>
    </div>

    <div className='w-full px-2 sm:p-14 md:px-16 xl:px-28 justify-center flex'>
    {loading ? (
          <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
            <Spinner aria-label="Loading spinner" size="md" />
            <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
          </Button>
        ) : (
          <>
        {post?.backImg ? (
          <img
            src={post?.backImg}
            className={`${
              loading && "animate-pulse"
            } rounded-b-md h-[200px] sm:h-[320px] w-full lg:w-[900px] 2xl:w-[1000px] object-cover`}
          />
        ) : (
          <img
            src="https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg"
            className="rounded-b-md h-[400px] sm:h-[320px] lg:w-[950px] 2xl:w-[1000px] w-full object-cover"
          />  
        )}
        </>
        )}
      </div>

        <div className="ml-2">
          <div className=" w-full items-center justify-center flex">
            <input type="file" accept="image/*" hidden ref={filePickerRef} onChange={addImageToPost} />
            {post?.userImg && (
              <img
                src={post?.userImg}
                className={`${loading && "animate-pulse"} sm:h-[200px] sm:w-[200px] h-[150px] w-[150px] -mt-20 sm:-mt-40 sm:-ml-[300px] md:-ml-[400px] lg:-ml-[500px] xl:-ml-[500px] rounded-3xl object-cover`}
              />
            )}
        
          </div>
          <div className='w-16 flex items-center sm:ml-10 md:ml-16 lg:ml-28 xl:ml-48 2xl:ml-[450px] mt-2'>
            <ModeButton />
          </div>

          <div className="sm:ml-10 md:ml-16 lg:ml-28 mt-3">
      
      </div>
      <div className="sm:px-40 space-y-4 absolute md:-mt-20 mt-4 px-2">
        <div className="flex items-center justify-between space-x-4 sm:ml-[300px] md:ml-[280px] xl:ml-[600px] 2xl:ml-[700px] 2xl:w-[500px]">
          <div>
            <p className="font-bold">{post?.name} {post?.lastname} @{post?.nickname}</p>
          </div>
        </div>
        <div className="flex items-center justify-between space-x-4 sm:ml-[300px] md:ml-[280px] xl:ml-[600px] 2xl:ml-[700px] 2xl:w-[500px]">
          <div className='text-nowrap'>
            <span className="flex space-x-2">{formatNumber(userPosts.length)}{" "}posts</span>
          </div>
          <div className="cursor-pointer" onClick={() => router.push("/followers")}>
            <p className="">
              <span className="font-bold mr-1">{formatNumber(followerCount)}</span>Followers
            </p>
          </div>
          <div className="" onClick={() => router.push("/following")}>
            <p className="">
              <span className="font-bold mr-1">{formatNumber(followingCount)}</span>following
            </p>
          </div>
        </div>


        <div className="border-b-[1px] my-2 dark:border-gray-700 -mt-20 sm:-mt-0 xl:ml-[40px] 2xl:ml-72 xl:w-[950px] 2xl:w-[1000px]"></div>  
          <div className="flex justify-between items-center w-full 2xl:w-[1000px] xl:w-[900px] xl:ml-20 2xl:ml-72">
            <div className="dark:text-gray-200 sm:text-lg text-xl flex items-center cursor-pointer text-gray-600 hover:scale-105 transition transform duration-400 hover:text-gray-900" onClick={togglePost}>
              <PhotographIcon className="h-6" />
              <h2>Posts</h2>
            </div>
            <div className="dark:text-gray-200 flex sm:text-lg text-xl items-center cursor-pointer text-gray-600 hover:scale-105 transition transform duration-400 hover:text-gray-900"  onClick={toggleReply}>
              <ArrowCircleRightIcon className="h-6" />
              <h2>Replies</h2>
            </div>
            <div className="dark:text-gray-200 flex sm:text-lg text-xl items-center cursor-pointer text-gray-600 hover:scale-105 transition transform duration-400 hover:text-gray-900" onClick={toggleBookmark} >
              <BookmarkIcon className="h-6" />
              <h2>bookmarked</h2>
            </div>
          </div>

          <div className='2xl:w-[1000px] 2xl:ml-72 xl:ml-[40px] xl:w-[950px]'>
            {loading ? (
                    <Spinner className='h-10' />
                  ) : (
                    <div>
                    <div className={`${isBookVisible || isReplyVisible || isPostVisible ? 'hidden' : 'grid grid-cols-2 lg:grid-cols-4 gap-2'}`}>
                      {userPosts.map((post) => (
                        <div key={post.id}>
                        <Post key={post.id} id={post.id} post={post}/>
                        </div>
                      ))}
                    </div>

                    <div className={`${isPostVisible ? 'grid grid-cols-2 lg:grid-cols-4 gap-2' : 'hidden'}`}>
                      {userPosts.map((post) => (
                        <div key={post.id}>
                        <Post key={post.id} id={post.id} post={post}/>
                        </div>
                      ))}
                    </div>

                    <div className={`${isReplyVisible ? 'grid grid-cols-2 lg:grid-cols-4 gap-2' : 'hidden'}`}>
                      {replies.map((post) => (
                        <div key={post.id}>
                          <Reply key={post.id} id={post.id} post={post}/>
                        </div>
                      ))}
                    </div>

                    <div className={`${isBookVisible ? 'grid grid-cols-2 lg:grid-cols-4 gap-2' : 'hidden'}`}>
                    {markPosts.map((post) => (
                      <div key={post.id}>
                      <Book key={post.id} id={post.id} post={post}/>
                      </div>
                    ))}
                    </div>
                    </div>
                  )}  

          </div>

        </div>

        </div>
       
      </div>
</>
        )}
     
  
      
    </div>
  
 
  );
}

export default Feed;
