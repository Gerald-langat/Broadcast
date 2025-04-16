import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Sidebar from '../../components/National/Sidebar';
import Widgets from '../../components/County/Widgets';
import CommentModal from '../../components/County/CommentModal';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import Comment from '../../components/County/Comment';
import Post from '../../components/County/Post';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import StatusModal from '../../components/National/StatusModal';



const WardPost = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [userData, setUserData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
  const { user } = useUser()


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
      if (!userData || !userData?.county || !id) 
        return;
      setLoading(true);
       const unsubscribe = onSnapshot(doc(db, "county", userData.county, "posts", id), (snapshot) => {
        setPost(snapshot),
        setLoading(false);
    });
  return () => unsubscribe()
    
}, [db, userData, id]);

  
useEffect(
  () =>{
    if (!userData || !userData?.county) {
      return;
    }
    onSnapshot(
      query(collection(db, "county", id, "comments"), orderBy("timestamp", 'desc')),
      (snapshot) => {
        setComments(snapshot.docs);
      }
    ),
  []
});

const toggleSidebar = () => {
  setIsSidebarVisible(!isSidebarVisible);
  setIsWidgetsVisible(false);
};

const toggleWidgets = () => {
  setIsWidgetsVisible(!isWidgetsVisible);
  setIsSidebarVisible(false);
}

const toggleHome = () => {
  setIsWidgetsVisible(false);
  setIsSidebarVisible(false);
}


 
  return (
      <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>{post?.data()?.text || 'loading...'}</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
    
      <div className="flex flex-1 w-full max-w-7xl mx-auto px-2 sm:px-4">
    
        {/* Sidebar */}
        {isSidebarVisible && (
          <div
            className="fixed inset-0 z-30 xl:hidden bg-black/50"
            onClick={() => setIsSidebarVisible(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative bg-white dark:bg-gray-950 w-64 h-full"
            >
              <Sidebar />
            </div>
          </div>
        )}
        <div className="hidden xl:block xl:w-1/4">
          <Sidebar />
        </div>
    
        {/* Post content */}
        <div className="flex-col flex-1 min-h-screen sm:min-w-[768px] xl:max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 rounded-md">
            <Tooltip content="Back" arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500">
              <Link href={`/national`}>
                <ArrowLeftIcon className="h-8 sm:h-6 cursor-pointer" />
              </Link>
            </Tooltip>
            <h2 className="text-lg sm:text-xl font-bold max-w-96 truncate">
              {post?.data()?.text && (
                <span className="text-2xl sm:text-lg">{post?.data()?.text}</span>
              )}
            </h2>
          </div>
    
          {loading ? (
            <Button color="gray" className="border-0 mt-4">
              <Spinner aria-label="Loading" size="sm" />
              <span className="pl-3">Loading...</span>
            </Button>
          ) : (
            <Post id={id} post={post} />
          )}
    
          {/* Comments */}
          {comments.length > 0 && (
            <>
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  commentId={comment.id}
                  originalPostId={id}
                  comment={comment.data()}
                />
              ))}
      </>
          )}
        </div>
    
        {/* Widgets */}
        {isWidgetsVisible && (
          <div
            className="fixed inset-0 z-30 bg-white dark:bg-gray-950 xl:hidden"
            onClick={() => setIsWidgetsVisible(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative  h-full"
            >
              <Widgets />
            </div>
          </div>
        )}
        <div className="hidden xl:block xl:w-1/4">
          <Widgets />
        </div>
    
      </div>
    
      {/* Modals */}
      <CommentModal />
      <StatusModal />
    
      {/* Bottom Navigation for Mobile */}
      <div className="xl:hidden fixed bottom-0 left-0 w-full z-40 bg-slate-50 dark:bg-gray-900 flex justify-around items-center py-3 border-t border-gray-200 dark:border-gray-800">
        <MenuAlt1Icon className="h-8 w-8 cursor-pointer" onClick={toggleSidebar} />
        <HomeIcon className="h-8 w-8 cursor-pointer" onClick={toggleHome} />
        <SearchIcon className="h-8 w-8 cursor-pointer" onClick={toggleWidgets} />
      </div>
    </div>
  );
};

export default WardPost;
