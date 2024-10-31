import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import CommentModal from "../../components/National/CommentModal";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebase";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../../components/National/Sidebar";
import Post from "../../components/National/Post";
import Widgets from "../../components/National/Widgets";
import Comment from "../../components/National/Comment";
import StatusModal from "../../components/National/StatusModal";
import { Button, Spinner, Tooltip } from "flowbite-react";


export default function PostPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState();
  const [comments, setComments] = useState([]);
  const [loading, setLoading ] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);

  // get the post data
  useEffect(() => {
    if(!id) return;
    setLoading(true);
    const unsubscribe = onSnapshot(doc(db, "posts", id), (snapshot) => {
      setPost(snapshot)
    setLoading(false)
  });
  return () => unsubscribe();
},  [db, id])

  // get comments of the post
  useEffect(() => {
    if(!id) return;
    onSnapshot(
      query(
        collection(db, "posts", id, "comments"),
        orderBy("timestamp", "desc")
      ),
      (snapshot) => setComments(snapshot.docs)
    );
  }, [db, id]);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleWidgets = () => {
    setIsWidgetsVisible(!isWidgetsVisible);
  }

  const toggleHome = () => {
    setIsWidgetsVisible(false);
    setIsSidebarVisible(false);
  }
  
  return (
    <div>
  <Head>
    <title>{post?.data()?.text ? post?.data()?.text : 'loading...'}</title>
    <meta name="description" content="Generated and created by redAnttech" />
    <link rel="icon" href="../../images/Brod.png" />
  </Head>
  <main className="flex min-h-screen mx-auto dark:bg-gray-950 w-[500px] sm:w-screen min-w-[476px] sm:px-10 md:px-24 xl:px-0 flex-grow">
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

  {/* Post content */}
  <div className="xl:ml-[350px] border-x-[1px] dark:border-gray-600 border-gray-300 xl:min-w-[576px] flex-grow max-w-xl  min-w-[580px] sm:min-w-full">
    <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 bg-white dark:bg-gray-950 border-b dark:border-gray-600 border-x-gray-300">
      <Tooltip content="back" arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
        <div onClick={() => router.replace("/home")}>
          <ArrowLeftIcon className="h-8 animate-pulse cursor-pointer" />
        </div>
      </Tooltip>
      <h2 className="text-lg sm:text-xl font-bold cursor-pointer">
        Posts
      </h2>
    </div>

    {loading ? (
      <Button color="gray" className="border-0">
        <Spinner aria-label="Loading..." size="sm" />
        <span className="pl-3">Loading...</span>
      </Button>
    ) : (
      <div className="top-6 sticky">
        <Post id={id} post={post} />
      </div>
    )}

    {comments.length > 0 && (
      <div>
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
    <div
      className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden"
      onClick={() => setIsWidgetsVisible(false)}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <Widgets />
      </div>
    </div>
  )}
  <div className="hidden xl:inline ml-14">
    <Widgets />
  </div>

  {/* Modal */}
  <CommentModal />
  <StatusModal />
</main>

{/* Bottom navigation for mobile */}
<div className="xl:hidden justify-between fixed bottom-0 z-40 bg-slate-50 dark:bg-neutral-700 w-full min-w-[580px] flex p-2 sm:px-10 md:px-24 px-4">
  <MenuAlt1Icon className="pl-4 h-8 cursor-pointer" onClick={toggleSidebar} />
  <HomeIcon className="h-8 cursor-pointer" onClick={toggleHome} />
  <SearchIcon className="pr-6 h-8 cursor-pointer" onClick={toggleWidgets} />
</div>
</div>
  );
}