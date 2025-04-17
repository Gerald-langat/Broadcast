import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon  } from '@heroicons/react/outline';
import Sidebar from '../../components/National/Sidebar';
import Widgets from '../../components/Ward/Widgets';
import CommentModal from '../../components/Ward/CommentModal';
import Head from 'next/head';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import SearchPost from '../../components/Ward/SearchPost';
import Link from 'next/link';
import StatusModal from '../../components/National/StatusModal';
import MembersModal from '../../components/Members/Members';


const WardPost = () => {
  const router = useRouter();
  const { uid } = router.query;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);


  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true); // Set loading to true at the start of async function
      try {
        if (uid) {
          const q = query(collection(db, 'userPosts'), where('uid', '==', uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            setUserData(querySnapshot.docs[0].data());
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after fetch
      }
    };
  
    fetchUserData();
  }, [uid]);
  

  useEffect(
    () =>{
      if (!userData || !userData.ward || !uid) {
        setLoading(true);
        return;
      }
      const unsubscribe = onSnapshot(
        query(collection(db, "ward", userData.ward, "posts"),
         where("uid", "==", uid),  
         orderBy("timestamp", "desc")),
        (snapshot) => {
          setPosts(snapshot.docs);
          setLoading(false);
        }
      );
      return () => unsubscribe();
}, [userData, uid]);

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
           <title>{
             loading ? 'loading...' : 
             userData ? userData.name + " " + userData.lastname + " " + '@' + userData.nickname : 'loading...'}</title>
           <meta name="description" content="Generated and created by redAndtech" />
           <link rel="icon" href="../../images/Brodcast.jpg" />
         </Head>
         <main className="flex flex-1 min-h-screen sm:min-w-[768px] xl:max-w-7xl mx-auto mb-12">
             {/* Sidebar for mobile */}
             {isSidebarVisible && (
               <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsSidebarVisible(false)}>
                 <div onClick={(e) => e.stopPropagation()}>
                   <Sidebar />
                 </div>
               </div>
             )}
         
             {/* Sidebar for desktop */}
             <div className="hidden xl:inline-flex  ">
               <Sidebar />
             </div>
         
             {/* Feed */}
             <div className="flex-col w-full sm:min-w-[400px] mx-auto">
               <div className="flex items-center space-x-2 py-3 w-full px-4 sticky top-0 bg-white dark:bg-gray-950 border-b dark:border-gray-800 border-gray-200">
                 <Tooltip content="back" arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                   <Link href={`/ward`}>
                     <ArrowLeftIcon className="h-8 sm:h-8 cursor-pointer animate-pulse" />
                   </Link>
                 </Tooltip>
                 <h2 className="text-lg sm:text-xl font-bold">
                   {loading ? 'loading...' : 
                     userData ? userData.name + " " + userData.lastname + " " + '@' + userData.nickname : 'loading...'}
                 </h2>
               </div>
         
               {loading ? (
                 <Button color="gray" className="border-0">
                   <Spinner aria-label="Loading..." size="sm" />
                   <span className="pl-3">Loading...</span>
                 </Button>
               ) : (
                 <div>
                   {posts.map((post) => (
                     <SearchPost key={post.id} id={post.id} post={post} />
                   ))}
                 </div>
               )}
             </div>
         
             {/* Widgets */}
             {isWidgetsVisible && (
               <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
                 <div onClick={(e) => e.stopPropagation()} className="relative  h-full">
                   <Widgets />
                 </div>
               </div>
             )}
         
             <div className="hidden xl:inline-flex w-[320px]">
               <Widgets />
             </div>
         
             <CommentModal />
             <StatusModal />
           </main>
         <div className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50  dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4">
                   <MenuAlt1Icon className="pl-4 h-8 cursor-pointer" onClick={toggleSidebar} />
                   <HomeIcon className="h-8 cursor-pointer" onClick={toggleHome} />
                   <SearchIcon className="pr-6 h-8 cursor-pointer" onClick={toggleWidgets} />
                 </div>
       </div>
  );
};

export default WardPost;
