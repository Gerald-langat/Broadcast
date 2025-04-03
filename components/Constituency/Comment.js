import {
  DotsHorizontalIcon,
  EyeOffIcon,
  FlagIcon,
  HeartIcon,
  ReplyIcon,
  ShareIcon,
  TrashIcon,
  UserAddIcon,
  UserRemoveIcon,
} from "@heroicons/react/outline";
import { BookmarkIcon, HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import Moment from "react-moment";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { useState, useEffect } from "react";
import { Popover, Tooltip } from "flowbite-react";
import { useRouter } from "next/router";
import { useFollow } from "../FollowContext";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Comment({ comment, commentId, originalPostId }) {
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [userData, setUserData] = useState({});
  const router = useRouter();
   const { hasFollowed, followMember } = useFollow();
    const [isHidden, setIsHidden] = useState(false);
    const [showUndo, setShowUndo] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [isReported, setIsReported] = useState({});
    const [isBookmarked, setIsBookmarked] = useState({});
  const { user } = useUser()

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "constituency", commentId, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
  }, [db, originalPostId, commentId]);

  useEffect(() => {
    setHasLiked(
      likes.findIndex((like) => like.id === user?.id) !== -1
    );
  }, [likes]);

  async function likeComment() {
    if (user?.id) {
      if (hasLiked) {
        await deleteDoc(
          doc(
            db,
            "constituency",
            commentId,
            "likes",
            user?.id
          )
        );
      } else {
        await setDoc(
          doc(
            db,
            "constituency",
            commentId,
            "likes",
            user?.id
          ),
          {
            uid: user?.id,
          }
        );
      }
    } else {
      router.replace('/signup');
    }
  }

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
  }, [user?.id])

  async function deleteComment() {
   
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteDoc(doc(db, "constituency", originalPostId, "comments", commentId));
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

  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'; // 1 million and above
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'k'; // 1 thousand and above
    } else {
      return number; // below 1 thousand
    }
  };

  // repost
     const repost = async () => {
        if(!user?.id) {
          router.replace('/signup');
        }
        if (comment) {
          const postData = comment;
          console.log('Post data:', postData);
          try {
            // Construct the new post data object
            const newPostData = {
              uid: user?.id,
              comment: postData.comment,
              userImg: userData.userImg,
              timestamp: serverTimestamp(),
              lastname: userData.lastname,
              name: userData.name,
              nickname: userData.nickname,
              from: postData.name,
              fromNickname: postData.nickname,
              citeUserImg: postData.userImg,
              // Include image  only if they are defined
             
              ...(postData.category && { fromCategory: postData.category }),
              ...(postData.image && { image: postData.image }),
            };
      
           await addDoc(collection( db, "constituency", originalPostId, "comments",
            ), newPostData);
            console.log('Comment reposted successfully!');
          } catch (error) {
            console.error('Error reposting the post:', error);
          }
        } else {
          console.log('No post data available to repost.');
        }
      };
  
      
    // delete Repost
    const deleteRepost = async () => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        if (window.confirm("Are you sure you want to delete this post?")) {
          if (originalPostId || commentId) {
            try {
              const likesCollectionRef = collection(db, "constituency", commentId, "likes");
              const likesSnapshot = await getDocs(likesCollectionRef);
        
              const deleteLikesPromises = likesSnapshot.docs.map((likeDoc) =>
                deleteDoc(likeDoc.ref)
              );
              await Promise.all(deleteLikesPromises);
              await deleteDoc(doc(db, "constituency",  originalPostId, "comments", commentId));
              console.log('Post deleted successfully');
            } catch (error) {
              console.error('Error deleting the post:', error);
            }
          } else {
            console.log('No post document reference available to delete.');
          }
        }
      }
    };

    // deleteComment
    async function deleteComment() {
      if (window.confirm("Are you sure you want to delete this post?")) {
        if (originalPostId || commentId) {
          try {
            const likesCollectionRef = collection(db, "constituency",  commentId, "likes");
            const likesSnapshot = await getDocs(likesCollectionRef);
      
            const deleteLikesPromises = likesSnapshot.docs.map((likeDoc) =>
              deleteDoc(likeDoc.ref)
            );
            await Promise.all(deleteLikesPromises);
            await deleteDoc(doc(db, "constituency", originalPostId, "comments", commentId));
            console.log('Post deleted successfully');
          } catch (error) {
            console.error('Error deleting the post:', error);
          }
        } else {
          console.log('No post document reference available to delete.');
        }
      }
    }
    // Check if the post is already bookmarked
    const userId = user?.id;
    const pstId = commentId;
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
          const image = comment?.image || null;
          
          // Add new document to the collection
          const bookmarkData = { pstId, timestamp: Date.now() };
          if (image) bookmarkData.image = image;
        
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

    const handleNotInterested = () => {
      setIsHidden(true);
      setShowUndo(true);
      // Optionally, save this preference to local storage or backend if needed
    };
  
    const handleUndo = () => {
      setIsHidden(false);
      setShowUndo(false);
    };
  
    const handleCancel = () => {
      setShowModal(false);
    };

    const uid = comment?.uid;

  return (
    <div>
    <div className={`w-full ${isHidden ? 'inline text-2xl sm:text-xl cursor-pointer dark:hover:bg-gray-900 hover:bg-gray-200 rounded-md p-1' : 'hidden'}`} onClick={handleUndo}>{showUndo && 'undo'}</div>
    <div className={`${isHidden ? 'hidden' : "flex p-3 cursor-pointer pl-20"}`}>
      {/* user image */}
    
<Link href={`/userProfile/${uid}`}>
      <img
        className="h-11 w-11 rounded-md mr-4"
        src={comment?.userImg}
        alt="user-img"
      />
      </Link>
      {/* right side */}
      <div className="flex-1">
        {/* Header */}

        <div className="flex items-center justify-between">
          {/* post user info */}
          <div className="flex items-center space-x-1 whitespace-nowrap">
            <h4 className="font-bold text-[15px] sm:text-[16px] hover:underline">
              {comment?.name}
            </h4>
            <span className="text-sm sm:text-[15px]">
              @{comment?.username} -{" "}
            </span>
            <span className="text-sm sm:text-[15px] hover:underline">
              <Moment fromNow>{comment?.timestamp?.toDate()}</Moment>
            </span>
          </div>

          {/* dot icon */}
          <Popover
                aria-labelledby="profile-popover"
                className="md:-ml-28 -ml-8 z-20 shadow-md rounded-lg dark:shadow-gray-400 shadow-gray-500"
                content={
                  <div className="w-64 text-xl sm:text-sm text-gray-500 dark:text-gray-300 bg-gray-300 dark:bg-gray-900 
                     py-2 space-y-3 border-none">
                     
                     { comment?.uid !== user?.id ? 
                        (
                          <>
                          <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900" onClick={handleNotInterested}>
                    <EyeOffIcon className="h-6"/>
                      <p>Not interested</p>
                    </div>
                    

                    <div className={`${userData?.name == comment?.name ? 'hidden' : 'flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900 '}`} >
                    {hasFollowed[comment?.uid] ? (
                      <UserRemoveIcon className="h-6" />

                    ) : (
                      <UserAddIcon className="h-6" />

                    )}
                   
                      <p onClick={() => followMember(comment?.uid)}>{hasFollowed[comment?.uid] ? 'Unfollow' : 'Follow'} @{comment?.nickname}</p>
                    
                    </div>
                   
                    <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-gray-900"  onClick={() => setShowModal(true)}>
                     
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
                              className="w-full p-2 rounded mb-4 dark:bg-gray-900 border-none"
                            >
                              <option>Select a reason</option>
                              <option value="Spam">Spam</option>
                              <option value="Inappropriate Content">Inappropriate Content</option>
                              <option value="Hate Speech">Hate Speech</option>
                              <option value="Other">Other</option>
                            </select>

                            {/* Buttons */}
                            <div className="flex justify-between w-full">
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 bg-gray-300 rounded dark:bg-gray-800 dark:hover:bg-gray-700 hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              
                              <button
                                onClick={submitReport}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
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
                <DotsHorizontalIcon className="dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-900 rounded-full h-10 hover:text-sky-500 p-1 sm:p-2"/>
              
             </Popover>
        </div>

        <div>
        <p className="text-gray-800 text-[20px] sm:text-[16px] mb-2 dark:text-gray-300">
          {comment?.comment}
         </p>
        {comment?.image && (
         
          <img src={comment?.image} alt="" className="h-32 w-full object-cover rounded-sm"/>
        
        )}
        
        </div>
        {comment?.from && <p>Recast from <span className="font-bold">{comment?.from}</span>{" "}<span className="text-gray-400 font-bold">@{comment?.fromNickname}</span></p>}

        {/* icons */}

        <div className="flex justify-between text-gray-500 dark:text-gray-300 p-2">
          <div className="flex items-center">
            {hasLiked ? (
          <Tooltip content='unlike' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <HeartIconFilled
                onClick={likeComment}
                className="h-9 w-9 p-2 text-red-700 hover:bg-red-100 dark:hover:bg-neutral-700 rounded-full"
              />
          </Tooltip>
            ) : (
          <Tooltip content='like' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <HeartIcon
                onClick={likeComment}
                className="h-9 w-9 p-2 hover:text-red-600 dark:hover:bg-neutral-700 hover:bg-red-100 rounded-full"
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
          {user?.id === comment?.uid && (
           
           <TrashIcon
              onClick={user?.id === comment?.uid ? deleteRepost : deleteComment}
             className="h-12 w-12 md:h-10 md:w-10 p-2 hover:text-red-600 hover:bg-red-100 rounded-full dark:hover:bg-gray-800"
           />
                     
         )}
          <Tooltip content='share' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ShareIcon className="h-9 w-9 p-2 hover:text-sky-500 hover:bg-sky-100 rounded-full dark:hover:bg-neutral-700" onClick={handleShare}/>
          </Tooltip>
          <Tooltip content='repost' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ReplyIcon className="h-9 w-9 p-2 hover:text-sky-500 hover:bg-sky-100 rounded-full dark:hover:bg-neutral-700" onClick={repost}/>
        </Tooltip>
        </div>
      </div>
    </div>
    </div>
  );
}
