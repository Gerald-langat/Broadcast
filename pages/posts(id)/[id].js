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

  useEffect(() => {
    if (!post?.uid) {
      router.push('/'); // Instead of using signout, you can push to the signout page
    }
  }, [post?.uid, router]);

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Head>
        <title>{post?.data()?.text ? post?.data()?.text : 'loading...'}</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
        <div className="flex min-h-screen min-w-[560px] flex-1 ">
              {/* Sidebar */}
              {isSidebarVisible && (
                <div
                  className="fixed inset-0 z-30 xl:hidden w-full"
                  onClick={() => setIsSidebarVisible(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the sidebar
                    className="relative"
                  >
                    <Sidebar />
                  </div>
                </div>
              )}
              <div className="hidden xl:block w-1/4 ">
                <Sidebar />
              </div>

        {/* Post content */}
        <div className="xl:ml-[10px] 2xl:mr-[120px] 2xl:ml-[80px] xl:min-w-[576px] 2xl:min-w-[700px]  sm:min-w-full flex-grow max-w-xl">
                  <div className="flex items-center space-x-2  py-2 px-3 sticky top-0 dark:bg-gray-950 bg-white border-[1px] rounded-md dark:border-gray-900
                     border-gray-200">
                  <Tooltip content='back' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                  <Link href={`/national`}>
                    <div className="animate-pulse">
                      <ArrowLeftIcon className="h-10 sm:h-8 cursor-pointer animate-pulse" />
                    </div>
                    </Link>
                  </Tooltip>
                    <h2 className="text-lg sm:text-xl font-bold cursor-pointer">
                    {post?.data()?.text && (
                      <span className='text-2xl sm:text-lg'>{post?.data()?.text}</span>
                      )}
                    </h2>
                  </div>

           {loading ? (<Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>):(
                      <Post id={id} post={post} />
                    )}

        {/*comment content*/}
          {comments.length > 0 && (
            <div>
              {comments.map((comment) => (
                <Comment
                  key={comment.id}
                  commentId={comment.id}
                  originalPostId={id}
                  comment={comment.data()}
                />
              ))}
            </div>
          )}
        </div>

        {/* Widgets */}
        {isWidgetsVisible && (
                 <div
                   className="fixed inset-0 z-30 bg-white dark:bg-gray-950 xl:hidden"
                   onClick={() => setIsWidgetsVisible(false)}
                 >
                   <div
                     onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the widgets
                     className="relative"
                   >
                     <Widgets />
                   </div>
                 </div>
               )}
               
 
              <div className="xl:ml-16">
                 <Widgets />
               </div>
</div>
        {/* Modal */}
        <CommentModal />
        <StatusModal />
     

      {/* Bottom navigation for mobile */}
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
        <MenuAlt1Icon className="pl-4 h-10 cursor-pointer" onClick={toggleSidebar}/>
        <HomeIcon className="h-10 cursor-pointer" onClick={toggleHome}/>
        <SearchIcon className="pr-6 h-10 cursor-pointer" onClick={toggleWidgets}/>
      </div>
    </div>
  );
}

export default WardPost;