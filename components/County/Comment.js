import {
  
  DotsHorizontalIcon,
  HeartIcon,
  ReplyIcon,
  ShareIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { HeartIcon as HeartIconFilled } from "@heroicons/react/solid";
import Moment from "react-moment";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { useState, useEffect } from "react";
import { Tooltip } from "flowbite-react";
import { useRouter } from "next/router";


export default function Comment({ comment, commentId, originalPostId }) {
  const [likes, setLikes] = useState([]);
  const [hasLiked, setHasLiked] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [userData, setUserData] = useState({});
  const router = useRouter();

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
      collection(db, "county", originalPostId, "comments", commentId, "likes"),
      (snapshot) => setLikes(snapshot.docs)
    );
  }, [db, originalPostId, commentId]);

  useEffect(() => {
    setHasLiked(
      likes.findIndex((like) => like.id === userDetails.uid) !== -1
    );
  }, [likes]);

  async function likeComment() {
    if (userDetails) {
      if (hasLiked) {
        await deleteDoc(
          doc(
            db,
            "county",
            originalPostId,
            "comments",
            commentId,
            "likes",
            userDetails?.uid
          )
        );
      } else {
        await setDoc(
          doc(
            db,
            "county",
            originalPostId,
            "comments",
            commentId,
            "likes",
            userDetails?.uid
          ),
          {
            email: userDetails.email,
          }
        );
      }
    } else {
      router.replace('/')
    }
  }

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
  }, [userDetails])

  async function deleteComment() {
   
    if (window.confirm("Are you sure you want to delete this post?")) {
      deleteDoc(doc(db, "county", userData.county, originalPostId, "comments", commentId));
    }
    console.log("Comment deleted successfully");
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

  return (
    <div className="flex p-3 cursor-pointer dark:border-gray-600 pl-20">
      {/* user image */}
      <img
        className="h-11 w-11 rounded-full mr-4"
        src={comment?.userImg}
        alt="user-img"
      />
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
              @{comment?.nickname} -{" "}
            </span>
            <span className="text-sm sm:text-[15px] hover:underline">
              <Moment fromNow>{comment?.timestamp?.toDate()}</Moment>
            </span>
          </div>

          {/* dot icon */}
          <DotsHorizontalIcon className="h-10 rounded-full w-10 hover:bg-sky-100 hover:text-sky-500 p-2 dark:hover:bg-neutral-700" />
        </div>

        {/* post text */}

        <p className="text-gray-800 text-[15px sm:text-[16px] mb-2 dark:text-gray-100">
          {comment?.comment}
        </p>

        {/* icons */}

        <div className="flex justify-between text-gray-500 dark:text-gray-300 p-2">
          
         
          <div className="flex items-center">
            {hasLiked ? (
          <Tooltip content='unlike' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">

              <HeartIconFilled
                onClick={likeComment}
                className="h-9 w-9 rounded-full p-2 text-red-700 hover:bg-blue-100 dark:hover:bg-neutral-700"
              />
          </Tooltip>
            ) : (
          <Tooltip content='like' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">

              <HeartIcon
                onClick={likeComment}
                className="h-9 w-9 rounded-full p-2 hover:text-red-600 hover:bg-blue-100 dark:hover:bg-neutral-700"
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
          {userDetails?.uid === comment?.userId && (
          <Tooltip content='delete' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <TrashIcon
              onClick={deleteComment}
              className="h-9 w-9 rounded-full p-2 hover:text-red-600 hover:bg-red-100 dark:hover:bg-neutral-700"
            />
          </Tooltip>
          )}
          <Tooltip content='share' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ShareIcon className="h-9 w-9 rounded-full p-2 hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" onClick={handleShare}/>
          </Tooltip>
          <Tooltip content='repost' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
          <ReplyIcon className="h-9 w-9 rounded-full p-2 hover:text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
        </Tooltip>
        </div>
      </div>
    </div>
  );
}
