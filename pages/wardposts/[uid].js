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
    <div>
      <Head>
      <title>
  {loading
    ? "Loading..."
    : userData
    ? `${userData.name || ''} ${userData.lastname || ''} @${userData.nickname || ''}`
    : "No User Data"}
</title>

        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <main className="flex min-h-screen mx-auto dark:bg-gray-950 sm:w-screen min-w-[580px]
     flex-grow sm:px-10 md:px-24 xl:px-0">
      {isSidebarVisible && (
              <div
                className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden"
                onClick={() => setIsSidebarVisible(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
                  <Sidebar />
                </div>
              </div>
            )}
      <div className='hidden xl:inline'>
      <Sidebar />
      </div>
        <div className="xl:ml-[350px] 2xl:ml-[560px] xl:min-w-[576px] 2xl:min-w-[700px]  sm:min-w-full flex-grow max-w-xl">
          <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 bg-white dark:bg-gray-950 border-[1px] rounded-md border-gray-300 dark:border-gray-900">
          <Tooltip content='back' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
            <Link href={`/ward`}>
            <div>
              <ArrowLeftIcon className="h-8 animate-pulse cursor-pointer" />
            </div>
            </Link>
          </Tooltip>
            <h2 className="text-lg sm:text-xl font-bold cursor-pointer">
            { loading ? (<Spinner size="sm" />) : userData
              ? `${userData.name || ''} ${userData.lastname || ''} @${userData.nickname || ''}` : ''}
            </h2>
          </div>
          {loading ? (<Button color="gray" className="border-0">
                    <Spinner aria-label="Alternate spinner button example" size="sm" />
                    <span className="pl-3">Loading...</span>
                  </Button>):(
                    <div>
            {posts.map((post) => (
             <div key={post.id}>
               <SearchPost  key={post.id} id={post.id} post={post}/>
             </div>
            ))}
          </div>
                  )}
        </div>
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-30  bg-black bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
          <div
                  onClick={(e) => e.stopPropagation()} // Prevents the click event from closing the sidebar when clicked inside it
                >
            <Widgets />
            </div>
          </div>
        )}
      <div className='hidden xl:inline'>
        <Widgets />
        </div>
        <CommentModal />
      </main>
      <div
        className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50
        dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4"
      >
          <MenuAlt1Icon className='pl-4 h-8 cursor-pointer' onClick={toggleSidebar} />
          <HomeIcon className='h-8 cursor-pointer' onClick={toggleHome}/>
          <SearchIcon className='pr-6 h-8 cursor-pointer' onClick={toggleWidgets}/>
      </div>
    </div>
  );
};

export default WardPost;
