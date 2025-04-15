import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from "@heroicons/react/outline";
import Head from "next/head";
import { useRouter } from "next/router";
import Sidebar from "../../components/National/Sidebar";
import Post from "../../components/National/Post";
import Widgets from "../../components/National/Widgets";
import Comment from "../../components/National/Comment";
import CommentModal from "../../components/National/CommentModal";
import StatusModal from "../../components/National/StatusModal";
import { Button, Spinner, Tooltip } from "flowbite-react";
import { db } from "../../firebase";
import {
  doc,
  collection,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";


const WardPost = () => {
  const router = useRouter();
 const { id } = router.query;
 const [post, setPost] = useState(null);
 const [comments, setComments] = useState([]);
const [loading, setLoading] = useState(false);
const [isSidebarVisible, setIsSidebarVisible] = useState(false);
const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);



 useEffect(() => {
   if (!id) return;
   setLoading(true);
   const unsubscribe = onSnapshot(doc(db, "national", id), (snapshot) => {
       setPost(snapshot);
       setLoading(false);
   });

   return () => unsubscribe();
}, [id]);

 
useEffect(() => {
  if (!id) {
    console.warn("No ID provided for fetching comments.");
    return;
  }
      onSnapshot(
        query(collection(db, "national",  id, "comments"), orderBy("timestamp", 'desc')),
        (snapshot) => {
          setComments(snapshot.docs);
        }
      ),
    []
  });

  // Cleanup subscription
 

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
}

export default WardPost;