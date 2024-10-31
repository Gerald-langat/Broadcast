import {
    BookmarkIcon,
    ChatIcon,
    DotsHorizontalIcon,
    EyeIcon,
    EyeOffIcon,
    HeartIcon,
    PencilAltIcon,
    ReplyIcon,
    ShareIcon,
    TrashIcon,
    UserAddIcon,
    UserRemoveIcon,  
  } from "@heroicons/react/outline";
  import Moment from "react-moment";
  import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
  } from "firebase/firestore";
  
  import { auth, db, storage } from "../../firebase";
  import { useState, useEffect } from "react";
  import { deleteObject, ref } from "firebase/storage";
  import { useRecoilState } from "recoil";
  import { modalState, postIdState } from "../../atoms/modalAtom";
  import { useRouter } from "next/router";
  import { HiClock, HiCheck } from "react-icons/hi";
  import { Badge, Button, Carousel, Popover, Spinner, Tooltip } from "flowbite-react";
  import { FlagIcon } from "@heroicons/react/solid";
  
  
  export default function News({ post, id }) {
    const router = useRouter();
    const [open, setOpen] = useRecoilState(modalState);
    const [postId, setPostId] = useRecoilState(postIdState);
    const [likes, setLikes] = useState([]);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [posts, setPost] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [userData, setUserData] = useState(null);
    const [citeInput, setCiteInput] = useState("");
    const [loading, setLoading] = useState(false);
  
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
      const fetchUserData = async () => {
        if (userDetails) {
          const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
          const querySnapshot = await getDocs(q);
          console.log(userDetails.uid)
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        }
      };
      fetchUserData();
    }, [userDetails]);
  
  
    useEffect(() => {
      if (!db || !id) {
        return;
      }
      const unsubscribe = onSnapshot(
        collection(db, "posts", id, "likes"),
        (snapshot) => setLikes(snapshot.docs)
      );
    
    }, [db]);
  
    useEffect(() => {
      if(!id) return;
      const unsubscribe = onSnapshot(
        collection(db, "posts", id, "comments"),
        (snapshot) => setComments(snapshot.docs)
      );
    }, [db]);
    
    useEffect(() => {
      if(userDetails){
      setHasLiked(
        likes.findIndex((like) => like.id === userDetails.uid) !== -1
      );
    }
    }, [likes]);
  
    async function likePost() {
      if (userDetails) {
        if (hasLiked) {
          await deleteDoc(doc(db, "posts", id, "likes", userDetails.uid));
        } else {
          await setDoc(doc(db, "posts", id, "likes", userDetails.uid), {
            username: userDetails.displayName,
          });
        }
      } else {
        router.replace('/');
      }
    }
  
  
    // delete Repost
    const deleteRepost = async () => {
      if (window.confirm("Are you sure you want to delete this post?")) {
        if (id) {
          try {
            await deleteDoc(doc(db, "posts", id));
            console.log('Post deleted successfully');
            router.push("/home");
          } catch (error) {
            console.error('Error deleting the post:', error);
          }
        } else {
          console.log('No post document reference available to delete.');
        }
      }
    };
  
    //delete post
    async function deletePost() {
        if (window.confirm("Are you sure you want to delete this post?")) {
          deleteDoc(doc(db, "posts", id));
          if (post?.data()?.image) {
            deleteObject(ref(storage, `posts/${id}/image`));
          }
          if (post?.data()?.video) {
            deleteObject(ref(storage, `posts/${id}/video`));
          }
          router.push("/home");
      }
    }
    
  // share
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
  
    // views
    useEffect(() => {
      if(!id) return;
      const fetchPost = async () => {
        const postRef = doc(db, 'posts', id);
        const docSnap = await getDoc(postRef);
  
        if (docSnap.exists()) {
          const postData = docSnap.data();
          setPost(postData);
          // Increment view count
          await updateDoc(postRef, { views: (postData.views || 0) + 1 });
        } else {
          console.log('No such document!');
        }
      };
  
      fetchPost();
    }, [id]);
  
  
    // Repost the posts 
    const repost = async () => {
      if(!userDetails?.uid) {
        router.replace('/');
      }
      if (post) {
        const postData = post.data();
        console.log('Post data:', postData);
        try {
          // Construct the new post data object
          const newPostData = {
            id: userDetails.uid,
            text: postData.text,
            userImg: userData.userImg,
            timestamp: serverTimestamp(),
            lastname: userData.lastname,
            name: userData.name,
            nickname: userData.nickname,
            from: postData.name,
            fromNickname: postData.nickname,
            views: postData.views,
            citeUserImg: postData.userImg,
            // Include image and video only if they are defined
           
            ...(postData.category && { fromCategory: postData.category }),
            ...(postData.image && { image: postData.image }),
            ...(postData.video && { video: postData.video }),
          };
    
          await addDoc(collection(db, 'posts'), newPostData);
          console.log('Post reposted successfully!');
        } catch (error) {
          console.error('Error reposting the post:', error);
        }
      } else {
        console.log('No post data available to repost.');
      }
    };
  
    // cite
  
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
        if (postData && typeof postData.text === 'string' && typeof citeInput === 'string') {
          try {
            await addDoc(collection(db, 'posts'), {
              id: userDetails.uid,
              text: postData.text,
              citeInput: citeInput,
              userImg: userData.userImg,
              lastname: userData.lastname,
              timestamp:serverTimestamp(),
              citetimestamp: postData.timestamp.toDate(),
              name: userData.name,
              fromUser:postData.name,
              nickname: userData.nickname,
              fromNickname: postData.nickname,
              fromlastname: postData.lastname,
              views: postData.views,
              citeUserImg: postData.userImg,
              // Include image and video only if they are defined
            
              
              ...(postData.category && { fromCategory: postData.category }),
              ...(postData.image && { image: postData.image }),
              ...(postData.video && { video: postData.video }),
          });
          } catch (error) {
            console.error('Error reposting the post:', error);
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
     
      <div className="flex p-3 cursor-pointer border-b border-gray-200 dark:border-gray-700
       dark:text-gray-300 z-40 flex-grow min-w-full h-full flex-1 py-2">
     {loading ? (
          <Button color="gray" className="border-0 ">
            <Spinner aria-label="Loading spinner" size="sm" />
            <span className="pl-3 animate-pulse">Loading...</span>
          </Button>
        ) : (
          <>
        {post?.data()?.userImg && (
          <img
          className="sm:h-12 sm:w-12 h-14 w-14 rounded-md mr-4 object-fit"
          src={post?.data()?.userImg}
          alt="user-img"
        />
        )}
  
        <div className="flex-1">
          <div className="flex items-center justify-between">
            {/* post user info */}
            <div className="sm:flex sm:space-x-8">
            <div className="flex items-center space-x-1 whitespace-nowrap dark:text-gray-300 ">
              <HiCheck className="sm:h-4 h-6 sm:w-4 w-6 bg-green-800 rounded-full text-white"/>
              <h4 className=" dark:text-gray-300 font-bold text-xl sm:text-[15px] hover:underline ">
                {post?.data()?.name}
              </h4>
              <h4 className="font-bold text-xl sm:text-[15px] ml-2 mr-3 dark:text-gray-300"> {post?.data()?.lastname}</h4>
           <h4 className="mr-4 w-24 truncate flex-1 text-xl sm:text-[15px]  dark:text-gray-300">@{post?.data()?.nickname}</h4>
             <Badge className="text-[16px] hover:underline sm:-ml-28 dark:text-gray-300 md:text-sm py-0" color="gray"  icon={HiClock}>
                <Moment fromNow>{post?.data()?.timestamp?.toDate()}</Moment>
              </Badge>
             
            </div>
            
            </div>
            <div className="flex">
            <Tooltip content='Delete' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            
            {userDetails?.uid === post?.data()?.id && (
             
              <TrashIcon
                 onClick={userDetails?.uid === post?.data()?.id ? deleteRepost : deletePost}
                className="h-12 w-12 md:h-10 md:w-10 p-2 hover:text-red-600 hover:bg-red-100 rounded-full dark:hover:bg-neutral-700"
              />
                        
            )}
            
            </Tooltip>
            {/* dot icon */}
            <Tooltip content='more' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
               <Popover
                  aria-labelledby="default-popover"
                  className="-ml-28 z-20 shadow-md rounded-lg dark:shadow-gray-400 shadow-gray-500 "
                  content={
                    <div className="w-64 text-sm text-gray-500 dark:text-gray-300 bg-gray-300 dark:bg-neutral-800 
                       p-2 space-y-3">
                      <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-md">
                      <EyeOffIcon className="h-6"/>
                        <p>Not interested</p>
                      </div>
                      <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-md">
                      <BookmarkIcon className="h-6" />
                        <p>save</p>
                      </div>
                      <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-md">
                      <UserRemoveIcon className="h-6" />
                        <p>Unfollow</p>
                      </div>
                      <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-md" onClick={() => followMember(post.id)}>
                      <UserAddIcon className="h-6" />
                   <span>Followed</span> 
                      </div>
                      <div className="flex gap-3 items-center font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-neutral-700 rounded-md">
                      <FlagIcon className="h-6" />
                        <p>Report post</p>
                      </div>
                    </div>
                  }
                  arrow={false}
                >
                  <DotsHorizontalIcon className="dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-neutral-700 rounded-full h-10 hover:text-sky-500 p-1 sm:p-2"/>
                
               </Popover>
               </Tooltip>
               </div>
          </div>
          
          {/* display cite */}
          {post?.data()?.citeInput ? (<div><p onClick={() => router.push(`/posts(id)/${id}`)}></p>{post?.data()?.citeInput}
          <div className="border-[1px] rounded-md dark:border-gray-700 dark:hover:bg-neutral-700 border-gray-200 hover:bg-neutral-300"  onClick={() => router.push(`/posts(id)/${id}`)}>
          <div className="flex p-1">
          {post?.data()?.citeUserImg && (
            <>
          <img
          className="h-8 w-8 rounded-md mr-4"
          src={post?.data()?.citeUserImg}
          alt="user-img"
        />
        <p className="flex space-x-2 items-center">{post?.data()?.fromUser}{" "}{post?.data()?.fromlastname}{" "}@{post?.data()?.fromNickname}{" "} 
        <Badge className="py-0" color="gray" icon={HiClock}>
            <Moment fromNow>{post?.data()?.citetimestamp?.toDate().toLocaleString()}</Moment>
          </Badge>
        </p>
        </>
        )}
          </div>
          <p className="ml-14" onClick={() => router.push(`/posts(id)/${id}`)}>{post?.data()?.text}</p>
          {post?.data()?.image && (
            <img
            onClick={() => router.push(`/posts(id)/${id}`)}
            className="rounded-md mr-2 h-[300px] w-[500px] sm:w-full sm:h-[600px] xl:h-[250px] object-cover"
            src={post?.data()?.image}
            alt=""
          />
          )}
          
          {post?.data()?.video && (
            <video autoPlay
            onClick={(e) => { 
              e.stopPropagation(); // Prevent the click event from bubbling up
              e.preventDefault(); // Prevent the default action (navigation)
              e.currentTarget.pause();
            }}
            className="rounded-md h-[300px] w-[500px] sm:w-full sm:h-[600px] xl:h-[250px] mr-2 object-cover"
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
              onClick={() => router.push(`/posts(id)/${id}`)}
              className="text-gray-800 w-96 sm:w-[490px] text-[20px] sm:text-[16px] mb-2 dark:text-gray-300 line-clamp-3 break-words cursor-pointer"
            >
              {post?.data()?.text}
          </p>
  
         
        {post?.data()?.images?.length > 1 ? (
          <Carousel className={`${!post?.data()?.images ? 'hidden' : "rounded-2xl mr-2 h-[300px] w-[500px] sm:w-full xl:h-[250px] sm:h-[600px] "}`}>
          
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
            className="rounded-2xl h-[300px] w-[500px] sm:w-full xl:h-[250px] sm:h-[600px] mr-2 object-cover"
            src={post?.data()?.video}
            alt=""
            controls
          />
          )}
          </>
        )}
          
          {post?.data()?.from && <p>Recast from <span className="font-bold">{post?.data()?.from}</span>{" "}<span className="text-gray-400 font-bold">@{post?.data()?.fromNickname}</span></p>}
  
          <div className="flex justify-between dark:text-gray-300 text-gray-500 p-2">
          <Tooltip content='reply' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <div className="flex items-center select-none z-50">
              <ChatIcon
                onClick={() => {
                  if (!userDetails) {
                    router.replace('/');
                  } else {
                    setPostId(id);
                    setOpen(!open);
                  }
                }}
                className="h-12 w-12 sm:h-10 sm:w-10 p-2 hover:text-sky-500 hover:bg-blue-100 rounded-full cursor-pointer  dark:hover:bg-neutral-700"
              />
              {comments.length > 0 && (
                <span className="text-[20px] sm:text-sm">{formatNumber(comments.length)}</span>
              )}
            </div>
            </Tooltip>
            <Tooltip content='recast' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <ReplyIcon className="h-12 w-12 sm:h-10 sm:w-10 p-2 hover:text-sky-500 hover:bg-blue-100 rounded-full dark:hover:bg-neutral-700" onClick={repost} />
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
         <PencilAltIcon className="h-12 w-12 sm:h-10 sm:w-10 p-2"/>
        </Popover>
          
          </Tooltip>
            <div className="flex items-center">
              {hasLiked ? (
              <Tooltip content='unlike' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                <HeartIcon fill="red"
                  onClick={likePost}
                  className="h-12 w-12 sm:h-10 sm:w-10 p-2 text-red-600 dark:hover:bg-red-900 hover:bg-red-300 rounded-full"
                />
                </Tooltip>
              ) : (
            <Tooltip content='like' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                <HeartIcon
                  onClick={likePost}
                  className="h-12 w-12 sm:h-10 sm:w-10 p-2 hover:text-red-600 hover:bg-red-300 rounded-full dark:hover:bg-red-900"
                />
                </Tooltip>
              )}
              {likes.length > 0 && (
                <span
                  className={`${hasLiked && "text-red-600"} text-[20px] sm:text-sm select-none`}
                >
                  {" "}
                  {formatNumber(likes.length)}
                </span>
              )}
             
            </div>
            <Tooltip content='view' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <div className="flex items-center">
                  <EyeIcon className="h-12 w-12 sm:h-10 sm:w-10 p-2 hover:text-sky-500 hover:bg-blue-100 rounded-full dark:hover:bg-neutral-700"/>
                  <span className="text-[20px] sm:text-sm">{formatNumber(post?.data()?.views)}</span> 
              </div>
              </Tooltip>
           
          <Tooltip content='share' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <ShareIcon className="h-12 w-12 sm:h-10 sm:w-10 p-2 hover:text-sky-500 hover:bg-blue-100 rounded-full dark:hover:bg-neutral-700" onClick={handleShare}/>
          </Tooltip>
          
         
          </div>
        </div>
        </>
        )}
      </div>
    );
  }
  