import { db, storage } from '../../firebase';
import { BookmarkIcon, ChatIcon, DotsHorizontalIcon, EyeIcon, EyeOffIcon, HeartIcon, PencilAltIcon, ReplyIcon, ShareIcon, TrashIcon, UserAddIcon, UserRemoveIcon } from '@heroicons/react/outline';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import Moment from 'react-moment';
import { Alert, Badge, Button, Carousel, Popover, Spinner, Tooltip } from 'flowbite-react';
import { HiClock } from "react-icons/hi";
import { modalCountyState, postIdCounty } from '../../atoms/modalAtom';
import { useRecoilState } from 'recoil';
import { deleteObject } from 'firebase/storage';
import { useFollow } from '../FollowContext';
import { FlagIcon } from '@heroicons/react/solid';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

function SearchPost({post, id}) {

  const[loading, setLoading] = useState(false);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [userpost, setUserData] = useState({});
  const router = useRouter();
  const [postId , setPostId] = useRecoilState(postIdCounty);
  const [open, setOpen] = useRecoilState(modalCountyState);
  const [citeInput, setCiteInput] = useState("");
  const { hasFollowed, followMember } = useFollow();
  const [showModal, setShowModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [isReported, setIsReported] = useState({});
  const [isBookmarked, setIsBookmarked] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);
    const [showAlert, setShowAlert] = useState(false);
const { user } = useUser()

   useEffect(() => {
     if(!id) return;
     const unsubscribe = onSnapshot(
       collection(db, "county",  id, "likes"),
       (snapshot) => setLikes(snapshot.docs)
     );
     return () => unsubscribe(); 
   }, [id]);

useEffect(() => {
  const fetchUserData = async () => {
    if (user?.id) {
      const q = query(collection(db, 'userPosts'), where('uid', '==', user?.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUserData(querySnapshot.docs[0].data());
      }
 
    }
  };
  fetchUserData();
}, [user?.id]);

useEffect(
  () =>{
    if (!id) {
      setLoading(false);
      return;
    }
    onSnapshot(
      query(collection(db, "county",  id, "comments")),
      (snapshot) => {
        setComments(snapshot.docs);
        setLoading(false);
      }
    ),
  []
});

  async function deletePost() {
    if (window.confirm("Are you sure you want to delete this post?")) {
      if (id || userpost) {
        try {
          const likesCollectionRef = collection(db, "county",  id, "likes");
          const likesSnapshot = await getDocs(likesCollectionRef);
    
          const deleteLikesPromises = likesSnapshot.docs.map((likeDoc) =>
            deleteDoc(likeDoc.ref)
          );
          await Promise.all(deleteLikesPromises);
        await deleteDoc(doc(db, "county",  id));  
        // Delete all images associated with the post
        const imageUrls = post?.data()?.images; // Assuming 'images' is an array of image URLs
        if (imageUrls && imageUrls.length > 0) {
          console.log(`Deleting ${imageUrls.length} images...`);
          const deleteImagePromises = imageUrls.map((url, index) => {
            const imageRef = ref(storage, `county/${id}/image-${index}`);
            return deleteObject(imageRef).then(() => {
              console.log(`Image ${index} deleted successfully.`);
            });
          });
          
          // Wait for all the delete operations to complete
          await Promise.all(deleteImagePromises);
        }
  
        // Delete the video if it exists
        if (post?.data()?.video) {
          console.log("Deleting video...");
          await deleteObject(ref(storage, `county/${id}/video`));
          console.log("Video deleted successfully.");
        }
  
        // Redirect after deletion
        console.log("Redirecting to home page...");
        router.push("/county");
      } catch (error) {
        console.error("An error occurred during deletion:", error);
      }
    } else {
      console.log('No post data available to post.');
    }
  }
}

  const deleteRepost = async () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      if (id || userpost?.county) {
        try {
          const likesCollectionRef = collection(db, "county", id, "likes");
          const likesSnapshot = await getDocs(likesCollectionRef);
    
          const deleteLikesPromises = likesSnapshot.docs.map((likeDoc) =>
            deleteDoc(likeDoc.ref)
          );
          await Promise.all(deleteLikesPromises);

          await deleteDoc(doc(db, "county", userpost.county, "posts", id));
        } catch (error) {
          console.error('Error deleting the post:', error);
        }
      } else {
        console.log('No post document reference available to delete.');
      }
    }
  };
  
  useEffect(() => {
    setHasLiked(
      likes.some((like) => like.id === user?.id)
    );
  }, [likes, user?.id]);

  async function likePost() {
    if (user?.id || id) {
      if (hasLiked) {
        await deleteDoc(doc(db, "county",  id, "likes", user?.id));
      } else {
        await setDoc(doc(db, "county",  id, "likes", user?.id), {
          uid: user?.id,
        });
      }
    } else {
      router.replace('/signup');
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
      } catch (error) {
        console.error('Error sharing content:', error);
      }
    } else {
      // Fallback for browsers that do not support the Web Share API
      alert('Web Share API is not supported in your browser.');
    }
  };

   // repost
   const repost = async () => {
    if (post) {
      // Get the post data, excluding unsupported fields
      const postData = post.data();
      try {
        await addDoc(collection(db, 'county', userpost.county, "posts"), {
            uid: user?.id,
            text: postData.text,
            userImg: userpost.userImg,
            timestamp: serverTimestamp(),
            lastname: userpost.lastname,
            name:userpost.name,
            nickname:userpost.nickname,
            from: postData.name,
            fromNickname: postData.nickname,

            ...(postData.category && {category:postData.category,}),
            ...(postData.images && {image:postData.images,}),
            ...(postData.video && {video:postData.video,})
          // Add any other fields from postData you need, excluding unsupported fields
        });
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 1000);

        setAlertMessage("Cast recasted successfully!");
        
      } catch (error) {
        console.error('Error recasting the cast:', error);
        setAlertMessage("Failed to cite Cast. Please try again.");

      }
    } else {
      console.log('No cast data available to recast.');
      setAlertMessage("Invalid input. Please check your text.");

    }
  };


  // cite
  const cite = async () => {
    if (!user?.id) { 
      router.replace('/signup');
    }
    setLoading(true);
  
    if (post) {
      const postData = post.data();
      // Check if postData and properties are defined and of correct type
       if (postData && typeof postData.text === 'string' && typeof citeInput === 'string' ) {
        const collectionName = userpost.county;
        try {
          await addDoc(collection(db, 'county', collectionName, "posts"), {
            uid: user?.id,
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
            citeUserImg: postData.userImg,
            // Include image and video only if they are defined
          
            ...(postData.name && { fromUser:postData.name,}),
            ...(postData.category && { category: postData.category }),
            ...(postData.images && { images: postData.images }),
            ...(postData.video && { video: postData.video }),
        });
        setShowAlert(true);
        setTimeout(() => {
          setShowAlert(false);
        }, 1000);

        setAlertMessage("Cast cited successfully!");

        } catch (error) {
          console.error('Error reposting the cast:', error);
          setAlertMessage("Failed to cite Cast. Please try again.");
        }
      } else {
        console.error('Invalid data detected. postData.text or citeInput is not a string.');
        setAlertMessage("Invalid input. Please check your text.");
      }
  
      setLoading(false);
      setCiteInput("");
    } else {
      console.log('No post data available to cast.');
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

  const handleNotInterested = () => {
    setIsHidden(true);
    setShowUndo(true);
    // Optionally, save this preference to local storage or backend if needed
  };
  
  const handleUndo = () => {
    setIsHidden(false);
    setShowUndo(false);
  };
  
   // Check if the post is already bookmarked
   const userId = user?.id;
   const pstId = post?.id;
   // Toggle bookmark
   const checkBookmark = async () => {
     if (!userId || !pstId) return;
     try {
       const docRef = doc(db, `bookmarks/${userId}/bookmarks`, pstId);
       const docSnap = await getDoc(docRef);
       setIsBookmarked((prev) => ({
         ...prev,
         [pstId]: docSnap.exists(),
       }));
     } catch (error) {
       console.error("Error checking bookmark status:", error);
     }
   };
  
   // Toggle bookmark
   const toggleBookmark = async () => {
     if (!userId || !pstId) return;
     try {
       const collectionRef = collection(db, `bookmarks/${userId}/bookmarks`);
       const docRef = doc(collectionRef, pstId);
  
       if (isBookmarked[pstId]) {
         // Remove bookmark
         await deleteDoc(docRef);
         setIsBookmarked((prev) => ({
           ...prev,
           [pstId]: false,
         }));
       } else {
         // Add bookmark
         const images = post?.data()?.images || [];
         const video = post?.data()?.video || null;
  
         // Add new document to the collection
         const bookmarkData = { pstId, timestamp: Date.now() };
         if (images.length) bookmarkData.images = images;
         if (video) bookmarkData.video = video;
  
         await setDoc(docRef, bookmarkData); // Use setDoc to ensure consistent doc IDs
         setIsBookmarked((prev) => ({
           ...prev,
           [pstId]: true,
         }));
       }
     } catch (error) {
       console.error("Error toggling bookmark:", error);
     }
   };
  
   useEffect(() => {
     checkBookmark();
   }, [pstId, userId]);
  
   const checkSubmitReport = async () => {
    if (!userId || !pstId) return;
    try {
      const docRef = doc(db, `reports/${userId}/reports`, pstId);
      const docSnap = await getDoc(docRef);
      setIsReported((prev) => ({
        ...prev,
        [pstId]: docSnap.exists(),
      }));
    } catch (error) {
      console.error("Error checking bookmark status:", error);
    }
  };
  
  useEffect(() => {
    checkSubmitReport();
  }, [pstId, userId]);
   
   // report post
   const submitReport = async () => {
     if (!userId || !pstId) return;
     try {
       const collectionRef = collection(db, `reports/${userId}/reports`); // Path specific to the user
       const docRef = doc(collectionRef, pstId);
   
       if (isReported[pstId]) {
         // Remove report
         await deleteDoc(docRef);
         setIsReported((prev) => ({
           ...prev,
           [pstId]: false,
         }));
         alert("Report removed.");
       } else {
         // Validate the report reason
         if (!reportReason) {
           alert("Please select a reason for reporting.");
           return;
         }
   
         // Add report
         const reportData = {
           pstId,
           userId,
           reportReason,
           timestamp: Date.now(),
         };
   
         await setDoc(docRef, reportData); // Use setDoc for consistent doc IDs
         setIsReported((prev) => ({
           ...prev,
           [pstId]: true,
         }));
         alert("Your report has been submitted. Thank you!");
       }
     } catch (error) {
       console.error("Error toggling report:", error);
       alert("Failed to toggle report. Please try again later.");
     }
     setShowModal(false)
   };

    useEffect(() => {
      if (!id || !user?.id || !userpost?.county) return;
    
      const fetchPost = async () => {
        const postRef = doc(db, "county", userpost?.county, "posts", id);
        const docSnap = await getDoc(postRef);
    
        if (docSnap.exists()) {
          const postData = docSnap.data();
          const currentViews = postData.views || [];
    
          if (!Array.isArray(currentViews)) {
            console.error("⚠️ Error: views is not an array!", currentViews);
            return;
          }
    
          if (!currentViews.includes(user.id)) {
            await updateDoc(postRef, {
              views: [...currentViews, user.id], // Add nickname to views array
            });
            console.log("✅ Updated views successfully!");
          } else {
            console.log("Nickname already exists in views:", currentViews);
          }
        } else {
          console.log("No such document!");
        }
      };
    
      fetchPost();
    }, [id, user?.id, userpost?.county]);
    
      
    const viewCount = Array.isArray(post?.data()?.views) ? post.data().views.length : 0;
   
   const uid = post?.data()?.uid

  return (
    <div>
    {showAlert && (
              <Alert color="success">
                <span className="font-medium">{alertMessage}</span>
              </Alert>
            )}
    <div className={`w-full ${isHidden ? 'inline text-2xl sm:text-xl cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded-md p-1' : 'hidden'}`} onClick={handleUndo}>{showUndo && 'undo'}</div>
    <div className={`${isHidden ? 'hidden' : ' border-[1px] dark:border-gray-900 border-gray-200 p-3 min-w-full rounded-md mt-1'}`}>
    {loading ? (
        <Button color="gray" className="border-0">
          <Spinner aria-label="Loading spinner" size="sm" />
          <span className="pl-3 animate-pulse">Loading...</span>
        </Button>
      ) : (
        <>
      <div className='flex items-center w-full'>
      <div className='flex items-center flex-1 space-x-2'>
      <Link href={`/userProfile/${uid}`}>
      <img
        className="h-11 w-11 rounded-full"
        src={post?.data()?.userImg}
        alt="user-img"
      />

      </Link>
       <h4 className=" dark:text-gray-300 font-bold text-xl sm:text-[15px] max-w-20 hover:underline truncate">
              {post?.data()?.name}
            </h4>
            <h4 className="font-bold text-xl sm:text-[15px] max-w-20 dark:text-gray-300 truncate"> {post?.data()?.lastname}</h4>
         <h4 className="truncate flex-1 text-xl sm:text-[15px] max-w-20  dark:text-gray-300">@{post?.data()?.nickname}</h4>
        <Badge className="text-sm sm:text-[15px] hover:underline -ml-28 dark:text-gray-300" color="gray"  icon={HiClock}>
              <Moment fromNow>{post?.data()?.timestamp?.toDate()}</Moment>
            </Badge>
            </div>
          {/* dot icon */}
          <div className='flex'>

          {user?.id === post?.data()?.uid && (
          
          <TrashIcon
             onClick={user?.id === post?.data()?.uid ? deleteRepost : deletePost}
            className="h-12 w-12 md:h-10 md:w-10 p-2 hover:text-red-600 hover:bg-red-100 rounded-full dark:hover:bg-neutral-700"
          />
                    
        )}

          <Popover
                aria-labelledby="profile-popover"
                className="md:-ml-28 -ml-8 z-20 shadow-md rounded-lg dark:shadow-gray-400 shadow-gray-500"
                content={
                  <div className="w-64 text-xl sm:text-sm text-gray-500 dark:text-gray-300 bg-gray-300 dark:bg-neutral-800 
                     py-2 space-y-3 border-none">
                     { post?.data()?.uid !== user?.id ? 
                        (
                          <>
                          <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900" onClick={handleNotInterested}>
                    <EyeOffIcon className="h-6"/>
                      <p>Not interested</p>
                    </div>
                    

                    <div className={`${userpost?.name == post?.data()?.name ? 'hidden' : 'flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900 '}`} >
                    {hasFollowed[post?.data()?.uid] ? (
                      <UserRemoveIcon className="h-6" />

                    ) : (
                      <UserAddIcon className="h-6" />

                    )}
                   
                      <p onClick={() => followMember(post?.data()?.uid )}>{hasFollowed[post?.data()?.uid] ? 'Unfollow' : 'Follow'} @{post?.data()?.nickname}</p>
                    
                    </div>
                   
                    <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900"  onClick={() => setShowModal(!showModal)}
                     disabled={isReported}>
                     
                     {isReported[pstId] ? (
                              <FlagIcon className="h-6 w-6 text-blue-700" />
                            ) : (
                              <FlagIcon className="h-6 w-6 text-gray-500" />
                            )}
                    
                      <p> {isReported[pstId]  ? "Reported" : "Report Post"}</p>
                      </div>
                      {showModal && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-md w-80">
            <h2 className="text-lg font-semibold mb-4">Report Post</h2>
            <p className="text-sm mb-4">Why are you reporting this post?</p>

            {/* Dropdown for report reasons */}
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 rounded mb-4 dark:bg-gray-900"
            >
              <option value="">Select a reason</option>
              <option value="Spam">Spam</option>
              <option value="Inappropriate Content">Inappropriate Content</option>
              <option value="Hate Speech">Hate Speech</option>
              <option value="Other">Other</option>
            </select>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-800 rounded"
              >
                Cancel
              </button>
              <button
                onClick={submitReport}
                className="px-4 py-2 bg-red-500 text-white rounded"
              >
                 {isReported[pstId]  ? "unSubmit" : "Submit"} 
              </button>
            </div>
          </div>
        </div>
      )}
                  
        </>
          ):(
            <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900" onClick={toggleBookmark}>
            {isBookmarked[pstId] ? (
                <BookmarkIcon fill="blue" className="h-6 w-6 text-blue-700" />
              ) : (
                <BookmarkIcon className="h-6 w-6 text-gray-500" />
              )}
        <p>{isBookmarked[pstId] ? "Remove Bookmark" : "Add Bookmark"}</p>
        </div>
      )}
                    
                  </div>
                }
                arrow={false}
              >
                <DotsHorizontalIcon className="cursor-pointer dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-900 rounded-full h-10 hover:text-sky-500 p-1 sm:p-2"/>
              
             </Popover>
          </div>
      </div>

       <div className='ml-14'>
      {post?.data()?.citeInput ? (
        <div><p onClick={() => router.push(`/countyposts(id)/${id}`)}>{post?.data()?.citeInput}</p>
        <div className="border rounded-md border-gray-200 dark:border-gray-900 hover:bg-gray-300 dark:hover:bg-gray-900 cursor-pointer"  onClick={() => router.push(`/countyposts(id)/${id}`)}>
        <div className="flex p-1">
        {post?.data()?.citeUserImg && (
          <>
        <img
        className="sm:h-8 sm:w-8 h-20 w-20 rounded-md mr-4"
        src={post?.data()?.citeUserImg}
        alt="user-img"
      />
      <p className="flex space-x-2 mr-4">{post?.data()?.fromUser}{" "}{post?.data()?.fromlastname}{" "}@{post?.data()?.fromNickname}{" "} 
      <Badge color="gray" icon={HiClock}>
          <Moment fromNow>{post?.data()?.citetimestamp?.toDate().toLocaleString()}</Moment>
        </Badge>
      </p>
      </>
      )}
        </div>
        <p className="ml-14" onClick={() => router.push(`/countyposts(id)/${id}`)}>{post?.data()?.text}</p>
        {post?.data()?.images?.length  > 1 ? (
            <Carousel className={`${!post?.data()?.images ? 'hidden' : "rounded-2xl mr-2 h-[300px] w-[500px] sm:w-full xl:h-[250px] sm:h-[600px]"}`}>
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
                  className={`${!post?.data()?.images ? 'hidden' : "rounded-md h-[300px] w-[500px] sm:w-full sm:h-[600px] xl:h-[250px] mr-2 object-cover"}`}
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
          className={`${!post?.data()?.video ? 'hidden' : "rounded-md h-[600px] w-[500px] sm:h-[300px] mr-2 object-cover"}`}
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
            onClick={() => router.push(`/countyposts(id)/${id}`)}
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
          className={`${!post?.data()?.video ? 'hidden' : "rounded-2xl h-[600px] w-[500px] sm:h-[300px] mr-2 object-cover"}`}
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

            <ChatIcon  className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 hover:bg-sky-100 rounded-full cursor-pointer dark:hover:bg-neutral-700"
                 onClick={() => {
                if (!user?.id) {
                  router.push('/signup');
                } else {
                  setPostId(id);
                  setOpen(!open);
                }
              }}
            />
            </Tooltip>
            {comments.length > 0 && (
              <span className="text-[20px] sm:text-sm select-none">{formatNumber(comments.length)}</span>
            )}
          </div>
          <Tooltip content='repost' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ReplyIcon className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 cursor-pointer hover:bg-sky-100 rounded-full dark:hover:bg-neutral-700" onClick={repost}/>
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
       <PencilAltIcon className="h-9 w-9 md:h-10 md:w-10 p-2 cursor-pointe"/>
      </Popover>
      </Tooltip>
          <div className="flex items-center ">
          {hasLiked ? (
            <Tooltip content='unlike' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <HeartIcon fill="red"
                onClick={likePost}
                className="h-9 w-9 md:h-10 md:w-10 p-2 text-red-700 cursor-pointer dark:hover:bg-red-900 hover:bg-red-300 rounded-full"
              />
              </Tooltip>
            ) : (
          <Tooltip content='like' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <HeartIcon
                onClick={likePost}
                className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-red-600 cursor-pointer hover:bg-red-300 rounded-full dark:hover:bg-red-900"
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
                         <EyeIcon className="h-12 w-12 sm:h-10 sm:w-10 p-2 hover:text-sky-500 hover:bg-blue-100 rounded-full dark:hover:bg-neutral-700"/>
                         <span className="text-[20px] sm:text-sm">{formatNumber(viewCount)}</span> 
                     </div>
                     </Tooltip>
          <Tooltip content='share' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ShareIcon className="h-9 w-9 md:h-10 md:w-10 p-2 hover:text-sky-500 cursor-pointer hover:bg-sky-100 rounded-full dark:hover:bg-neutral-700" onClick={handleShare}/>
          </Tooltip>
          
        </div>
          </>
      )}
    </div>
      
      </div>
  )
}

export default SearchPost
