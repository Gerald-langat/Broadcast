import { auth, db, storage } from '../../firebase';
import { ChatIcon, DotsHorizontalIcon, EyeIcon, HeartIcon, PencilAltIcon, ReplyIcon, ShareIcon, TrashIcon } from '@heroicons/react/outline';
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { Badge, Carousel, Popover, Tooltip } from 'flowbite-react';
import React, { useEffect, useState } from 'react'
import Moment from 'react-moment';
import { HiClock } from "react-icons/hi";
import { useRouter } from 'next/router';
import Comment from './Comment';
import { AnimatePresence, motion } from 'framer-motion';
import { modalConstituencyState, postIdConstituency } from '../../atoms/modalAtom';
import { useRecoilState } from 'recoil';

function ConstituencyTrends({post, id}) {

  const[loading, setLoading] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [userpost, setUserData] = useState({});
  const router = useRouter();
  const [open, setOpen] = useRecoilState(modalConstituencyState);
  const [postId, setPostId] = useRecoilState(postIdConstituency);
  const [citeInput, setCiteInput] = useState("");



  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user)
      setUserDetails(user)

    })
  }
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "constituency", id, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
    return () => unsubscribe();
}, [db]);

useEffect(() => {
  const fetchUserData = async () => {
    if (userDetails) {
      const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUserData(querySnapshot.docs[0].data());
      }
 
    }
  };
  fetchUserData();
}, [userDetails]);

useEffect(
  () =>{
    if (!userpost || !userpost.constituency) {
      setLoading(false);
      return;
    }
    onSnapshot(
      query(collection(db, "constituency", userpost.constituency, id, "comments")),
      (snapshot) => {
        setComments(snapshot.docs);
        setLoading(false);
      }
    ),
  []
});

async function deletePost() {
  if (window.confirm("Are you sure you want to delete this post?")) {
    try {
      console.log("Starting the deletion process...");

      // Delete the Firestore document
      console.log("Deleting Firestore document...");
      await deleteDoc(doc(db, "constituency", userpost.constituency, id));
      console.log("Firestore document deleted successfully.");

      // Delete all images associated with the post
      const imageUrls = post?.data()?.images; // Assuming 'images' is an array of image URLs
      if (imageUrls && imageUrls.length > 0) {
        console.log(`Deleting ${imageUrls.length} images...`);
        const deleteImagePromises = imageUrls.map((url, index) => {
          const imageRef = ref(storage, `constituency/${userDetails.uid}/image-${index}`);
          return deleteObject(imageRef).then(() => {
            console.log(`Image ${index} deleted successfully.`);
          });
        });
        
        // Wait for all the delete operations to complete
        await Promise.all(deleteImagePromises);
        console.log("All images deleted successfully.");
      }

      // Delete the video if it exists
      if (post?.data()?.video) {
        console.log("Deleting video...");
        await deleteObject(ref(storage, `constituency/${userDetails.uid}/video`));
        console.log("Video deleted successfully.");
      }

      // Redirect after deletion
      console.log("Redirecting to home page...");
      router.push("/constituency");
    } catch (error) {
      console.error("An error occurred during deletion:", error);
    }
  }
}


  
  useEffect(() => {
    setHasLiked(
      likes.some((like) => like.id === userDetails?.uid)
    );
  }, [likes, userDetails]);

  async function likePost() {
    if (userDetails) {
      if (hasLiked) {
        await deleteDoc(doc(db, "constituency", id, "likes", userDetails?.uid));
      } else {
        await setDoc(doc(db, "constituency",  id, "likes", userDetails?.uid), {
          email: userDetails.email,
        });
      }
    } else {
      router.replace('/');
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check this out!',
          text: 'Sharing this amazing content.',
          url: window.location.href,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      alert('Web Share API is not supported in your browser.');
    }
  };

  const repost = async () => {
    if (post) {
      // Get the post data, excluding unsupported fields
      const postData = post.data();
      console.log('Post data:', postData);
      try {
        await addDoc(collection(db, 'constituency', userpost.constituency), {
          id: postData.id,
            text: postData.text,
            userImg: userpost.userImg,
            timestamp: serverTimestamp(),
            lastname: userpost.lastname,
            name:userpost.name,
            nickname:userpost.nickname,
            from: postData.name,
            fromNickname: postData.nickname,
            views: postData.views,

            ...(postData.category && {category:postData.category}),
            ...(postData.images && {images:postData.images}),
            ...(postData.video && {video:postData.video}),

          // Add any other fields from postData you need, excluding unsupported fields
        });
        console.log('Post reposted successfully!');
      } catch (error) {
        console.error('Error reposting the post:', error);
      }
    } else {
      console.log('No post data available to repost.');
    }
  };

  
// recite post

const cite = async () => {
  if (!userDetails?.uid) { 
    router.replace('/');
  }
  setLoading(true);

  if (post) {
    const postData = post.data();
    
    // Debugging: Log postData and its properties
    console.log('postData:', postData);
    console.log('postData.text:', postData.text);
    console.log('citeInput:', citeInput);

    // Check if postData and properties are defined and of correct type
     if (postData && typeof postData.text === 'string' && typeof citeInput === 'string' ) {
      const collectionName = userpost.constituency;
      try {
        await addDoc(collection(db, 'constituency', collectionName), {
          id: userDetails.uid,
          text: postData.text,
          citeInput: citeInput,
          userImg: userpost.userImg,
          lastname: userpost.lastname,
          timestamp:serverTimestamp(),
          citetimestamp: postData.timestamp.toDate(),
          name: userpost.name,
          nickname: userpost.nickname,
          fromNickname: postData.nickname,
          fromlastname: postData.lastname,
          views: postData.views,
          citeUserImg: postData.userImg,
          // Include image and video only if they are defined
        
          ...(postData.name && { fromUser:postData.name,}),
          ...(postData.category && { category: postData.category }),
          ...(postData.images && { images: postData.images }),
          ...(postData.video && { video: postData.video }),
      });
      } catch (error) {
        console.error('Error citing the post:', error);
      }
    } else {
      console.error('Invalid data detected. postData.text or citeInput is not a string.');
    }

    setLoading(false);
    setCiteInput("");
  } else {
    console.log('No post data available to repost.');
  }
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

  return (
    <div className='m-2 border-[1px] border-gray-300 dark:border-gray-900 rounded-md mt-1 p-2'>
      <div className='flex items-center'>
      <div className='flex space-x-2 flex-1 items-center'>
      <img
        className="h-11 w-11 rounded-full "
        src={post?.data()?.userImg}
        alt="user-img"
      />
           <h4 className=" dark:text-gray-300 max-w-20 font-bold text-xl sm:text-[15px] truncate">
          {post?.data()?.name}
           </h4>
           <h4 className="font-bold text-xl sm:text-[15px] max-w-20  dark:text-gray-300 truncate"> {post?.data()?.lastname}</h4>
        <h4 className=" max-w-20 truncate flex-1 text-xl sm:text-[15px]  dark:text-gray-300">@{post?.data()?.nickname}</h4>
        
        <Badge className="text-sm sm:text-[15px] hover:underline -ml-28 dark:text-gray-300" color="gray"  icon={HiClock}>
              <Moment fromNow>{post?.data()?.timestamp?.toDate()}</Moment>
            </Badge>
      </div>
    <div className='flex text-gray-600 dark:text-gray-300'>
      {userDetails?.uid === post?.data()?.id && (
          <Tooltip content='delete' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <TrashIcon
              onClick={deletePost}
              className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-red-600 hover:bg-red-100 rounded-full cursor-pointer dark:hover:bg-neutral-700"
            />
            </Tooltip>
          )}
          <DotsHorizontalIcon className="h-10 w-10 hover:bg-sky-100 hover:text-sky-500 p-2 rounded-full cursor-pointer dark:hover:bg-neutral-700" />
          </div>
      </div>
      <div className='ml-14'>
      {post?.data()?.citeInput ? (<div><p onClick={() => router.push(`/constituencyposts(id)/${id}`)}></p>{post?.data()?.citeInput}
        <div className="border rounded-md border-gray-300 dark:border-gray-700 hover:bg-gray-300 dark:hover:bg-neutral-700"  onClick={() => router.push(`/constituencyposts(id)/${id}`)}>
        <div className="flex p-1">
        {post?.data()?.citeUserImg && (
          <>
        <img
        className="h-8 w-8 rounded-md mr-4"
        src={post?.data()?.citeUserImg}
        alt="user-img"
      />
      <p className="flex space-x-2">{post?.data()?.fromUser}{" "}{post?.data()?.fromlastname}{" "}@{post?.data()?.fromNickname}{" "} 
      <Badge color="gray" icon={HiClock}>
          <Moment fromNow>{post?.data()?.citetimestamp?.toDate().toLocaleString()}</Moment>
        </Badge>
      </p>
      </>
      )}
        </div>
        <p className="ml-14" onClick={() => router.push(`/constituencyposts(id)/${id}`)}>{post?.data()?.text}</p>
        {post?.data()?.images?.length  > 1 ? (
            <Carousel className="rounded-2xl mr-2 h-[300px] w-[500px] sm:w-full xl:h-[250px] sm:h-[600px]">
              {post?.data()?.images.map((imageUrl, index) => (
                <img
                  key={index}
                  className="object-cover"
                  src={imageUrl}
                  alt={`image-${index}`}
                />
              ))}
            </Carousel>
          ) : (
            <img
                  className=" rounded-md h-[300px] w-[500px] sm:w-full sm:h-[600px] xl:h-[250px] mr-2 object-cover"
                  src={post?.data()?.images}
                  alt=''
                />
          )}


        
        {post?.data()?.video && (
          <video autoPlay
          onClick={(e) => { 
            e.stopPropagation(); // Prevent the click event from bubbling up
            e.preventDefault(); // Prevent the default action (navigation)
            e.currentTarget.pause();
          }}
          className="rounded-md h-[600px] w-[500px] sm:h-[300px] mr-2 object-cover"
          src={post?.data()?.video}
          alt=""
          controls
        />
        )}
        </div>
        </div>
        ):(
          <>
          <p
            onClick={() => router.push(`/constituencyposts(id)/${id}`)}
            className="text-gray-800 w-96 sm:w-[490px] text-[20px] sm:text-[16px] mb-2 dark:text-gray-300 line-clamp-3 break-words cursor-pointer"
          >
            {post?.data()?.text}
        </p>

       
        {post?.data()?.images?.length > 1 ? (
            <Carousel className={`${!post?.data()?.images ? 'hidden' : "rounded-2xl mr-2 h-[300px] w-[500px] sm:w-full xl:h-[250px] sm:h-[600px]"}`}>
              {post?.data()?.images.map((imageUrl, index) => {
              console.log(imageUrl, index); // Check what images are being loaded
                return(
                <img
                  key={index}
                  className="object-cover"
                  src={imageUrl}
                  alt={`image-${index}`}
                />
              );
              })}
            </Carousel>
          ) : (
            <img
                  className={` ${!post?.data()?.images ? 'hidden' :"rounded-md h-[300px] w-[500px] sm:w-full sm:h-[600px] xl:h-[250px] mr-2 object-cover"}`}
                  src={post?.data()?.images}
                  alt=''
                />
          )}



      
         {post?.data()?.video && (
          <video autoPlay
          onClick={(e) => { 
            e.stopPropagation(); // Prevent the click event from bubbling up
            e.preventDefault(); // Prevent the default action (navigation)
            e.currentTarget.pause();
         
          }}
          className="rounded-2xl h-[600px] w-[500px] sm:h-[300px] mr-2 object-cover"
          src={post?.data()?.video}
          alt=""
          controls
        />
        )}
        </>
      )}

        {post?.data()?.from && <p>from {post?.data()?.from}{" "}<span className="text-gray-400">@{post?.data()?.fromNickname}</span></p>}
</div>

        <div className="flex justify-between text-gray-500 p-2 dark:text-gray-300 ml-16">
          <div className="flex items-center select-none">
          <Tooltip content='reply' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <ChatIcon
              onClick={() => {
                if (!userDetails) {
                  router.replace('/');
                } else {
                  setPostId(id);
                  setOpen(!open);
                }
              }}
              className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700 rounded-full cursor-pointer"
            />
            </Tooltip>
            {loading && <p>Loading...</p>}
            {comments.length > 0 && (
              <span className="text-[20px] sm:text-sm select-none">{formatNumber(comments.length)}</span>
            )}
          </div>
          <Tooltip content='repost' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ReplyIcon className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 hover:bg-sky-100 cursor-pointer rounded-full dark:hover:bg-neutral-700" onClick={repost}/>
        </Tooltip>
        <Tooltip content='cite' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
        <Popover
        aria-labelledby="profile-popover"
          trigger="click"
        content={
          <div className="w-96 p-3 shadow-md dark:shadow-white">
            <div className="flex flex-col gap-1">
              <input type='text' 
              value={citeInput}
              placeholder="cite this post....."
              onChange={(e) => setCiteInput(e.target.value)}
              className='border-x-0 border-t-0 focus:outline-none focus:ring-0 text-black bg-transparent
               dark:placeholder:text-gray-300 dark:text-white'/>
            </div>
            <div className="flex justify-end">
            <button
              type="button"
              disabled={!citeInput}
              className="rounded-lg bg-blue-700 px-3 py-1.5 mt-3 text-xs font-medium text-white hover:bg-blue-800 focus:outline-none dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            onClick={cite}
            >
              {loading ? 'citing...' : 'cite'}
            </button>
            </div>
          </div>
        }
      >
       <PencilAltIcon className="h-9 w-9 md:h-10 md:w-10 p-2 cursor-pointer"/>
      </Popover>
      </Tooltip>
          <div className="flex items-center ">
          {hasLiked ? (
            <Tooltip content='unlike' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <HeartIcon fill="red"
                onClick={likePost}
                className="h-9 w-9 md:h-10 md:w-10 p-2 cursor-pointer text-red-700 dark:hover:bg-red-900 hover:bg-red-300 rounded-full"
              />
              </Tooltip>
            ) : (
          <Tooltip content='like' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <HeartIcon
                onClick={likePost}
                className="h-9 w-9 md:h-10 md:w-10 p-2 cursor-pointer hover:text-red-600 hover:bg-red-300 rounded-full dark:hover:bg-red-900"
              />
              </Tooltip>
            )}
            {likes.length > 0 && (
              <span
                className='text-[20px] sm:text-sm select-none'
              >
                {" "}
                {formatNumber(likes.length)}
              </span>
            )}
          </div>
          <Tooltip content='view' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <div className="flex items-center">
                <EyeIcon className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 hover:bg-blue-100 rounded-full dark:hover:bg-neutral-700"/>
                <span className='text-[20px] sm:text-sm select-none'>{formatNumber(post?.data()?.views)}</span> 
            </div>
            </Tooltip>
          <Tooltip content='share' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">

          <ShareIcon className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700 cursor-pointer rounded-full" onClick={handleShare}/>
          </Tooltip>
          
        </div>
        
        {comments.length > 0 && (
            <div className="">
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  >
                    <Comment
                      key={comment.id}
                      commentId={comment.id}
                      originalPostId={id}
                      comment={comment.data()}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
    </div>
  )
}

export default ConstituencyTrends
