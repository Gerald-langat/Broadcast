import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline';
import Sidebar from '../../components/National/Sidebar';
import Widgets from '../../components/Ward/Widgets';
import CommentModal from '../../components/Ward/CommentModal';
import Head from 'next/head';
import { AnimatePresence, motion } from 'framer-motion';
import Comment from '../../components/Ward/Comment';
import Post from '../../components/Ward/Post';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import StatusModal from '../../components/National/StatusModal';
import { useUser } from '@clerk/nextjs';


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
        const q = query(collection(db, 'userPosts'), where('uid', '==', user.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
   
      }
    };
    fetchUserData();
  }, [user?.id]);


  useEffect(() => {
    if (!userData || !userData.ward || !id) return;

    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, "ward", userData.ward, "posts", id), (snapshot) => {
        setPost(snapshot);
        setLoading(false);
    });

    return () => unsubscribe();
}, [db, userData, id]);

  
useEffect(
  () =>{
    if (!id) {
      return;
    }
    onSnapshot(
      query(collection(db, "ward",  id, "comments"), orderBy("timestamp", "desc")),
      (snapshot) => {
        setComments(snapshot.docs);

      }
    ),
  [id]
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
    <div>
      <Head>
        <title>{loading ? "loading..." : post?.data()?.text ? post?.data()?.text : 'loading...'}</title>
        <meta name="description" content="Generated and created by redAndTech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <main className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
      {isSidebarVisible && (
      <div
        className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden"
        onClick={() => setIsSidebarVisible(false)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <Sidebar />
        </div>
      </div>
    )}
    <div className="hidden xl:inline">
      <Sidebar />
    </div>
        <div className="flex flex-col flex-grow max-w-full xl:max-w-2xl 2xl:max-w-6xl px-2">
          <div className="flex items-center space-x-2  py-2 px-3 sticky top-0 bg-white dark:bg-gray-950 border-[1px] rounded-md border-gray-300 dark:border-gray-900">
          <Tooltip content='back' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <div className="animate-pulse" onClick={() => router.push("/ward")}>
              <ArrowLeftIcon className="h-8 animate-pulse cursor-pointer" />
            </div>
            </Tooltip>
            <h2 className="text-lg sm:text-xl font-bold cursor-pointer">
              Posts
            </h2>
          </div>
          {loading ? (<Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>):(
                      <Post id={id} post={post} />
                    )}
          
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
        {/* Widgets */}
        {isWidgetsVisible && (
      <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
        <div onClick={(e) => e.stopPropagation()}>
          <Widgets />
        </div>
      </div>
    )}
    <div className="hidden xl:inline">
      <Widgets />
    </div>
        <CommentModal />
        <StatusModal />
      </main>
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
    <MenuAlt1Icon className="pl-4 h-8 cursor-pointer" onClick={toggleSidebar} />
    <HomeIcon className="h-8 cursor-pointer" onClick={toggleHome} />
    <SearchIcon className="pr-6 h-8 cursor-pointer" onClick={toggleWidgets} />
  </div>
  </div>
  );
};

export default WardPost;
