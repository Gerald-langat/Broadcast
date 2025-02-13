import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ArrowLeftIcon, HomeIcon, MenuAlt1Icon, SearchIcon } from '@heroicons/react/outline';
import Sidebar from '../../components/National/Sidebar';
import Widgets from '../../components/National/Widgets';
import CommentModal from '../../components/National/CommentModal';
import Head from 'next/head';
import { Button, Spinner, Tooltip } from 'flowbite-react';
import SearchPost from '../../components/National/NationSearch';
import StatusModal from '../../components/National/StatusModal';

const WardPost = () => {
  const router = useRouter();
  const { name } = router.query;
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isWidgetsVisible, setIsWidgetsVisible] = useState(false);
  

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      setUserDetails(user);
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
  }, [userDetails]);

  // posts
  useEffect(() =>{
      if (!userData || !userData.county) {
        setLoading(true);
        return;
      }
      const unsubscribe = onSnapshot(
        query(collection(db, "posts"),
        where("name", "==", name),
        orderBy("timestamp", "desc")
      ),
        (snapshot) => {
          setPosts(snapshot.docs);
          setLoading(false);
        }
      );
      return () => unsubscribe();
},[userData]);


  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
    setIsWidgetsVisible(false);
  };

  const toggleWidgets = () => {
    setIsWidgetsVisible(!isWidgetsVisible);
    setIsSidebarVisible(false);
  };

  const toggleHome = () => {
    setIsWidgetsVisible(false);
    setIsSidebarVisible(false);
  };

  return (
    <div>
      <Head>
        <title>{name || 'Loading...'}</title>
        <meta name="description" content="Generated and created by redAndttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <main className="flex min-h-screen mx-auto dark:bg-gray-950 sm:w-screen min-w-[580px] flex-grow sm:px-10 md:px-24 xl:px-0">
        {/* Sidebar */}
        {isSidebarVisible && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-50 xl:hidden" onClick={() => setIsSidebarVisible(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <Sidebar />
            </div>
          </div>
        )}
        <div className="hidden xl:inline">
          <Sidebar />
        </div>

        {/* Feed */}
        <div className="xl:ml-[350px] xl:min-w-[576px] min-w-[580px] sm:min-w-full flex-grow max-w-xl rounded-md">
          <div className="flex items-center space-x-2 py-2 px-3 sticky top-0 dark:bg-gray-950 bg-white border-[1px] rounded-md dark:border-gray-900 border-gray-200">
            <Tooltip content="back" arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
              <div className="animate-pulse" onClick={() => router.replace('/home')}>
                <ArrowLeftIcon className="sm:h-8 h-10 cursor-pointer animate-pulse" />
              </div>
            </Tooltip>
            <h2 className="text-xl sm:text-lg font-bold cursor-pointer">
              {name && <span className="text-2xl sm:text-lg">{name}</span>}
            </h2>
          </div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id}>
                <SearchPost key={post.id} id={post.id} post={post} />
              </div>
            ))
          ) : (
            <Button color="gray" className="border-0">
              <Spinner aria-label="Alternate spinner button example" size="sm" />
              <span className="pl-3">No posts found...</span>
            </Button>
          )}
        </div>

        {/* Widgets */}
        {isWidgetsVisible && (
          <div className="fixed inset-0 z-30 ml-4 dark:bg-gray-950 min-h-screen bg-opacity-50 xl:hidden" onClick={() => setIsWidgetsVisible(false)}>
            <div className="ml-10" onClick={(e) => e.stopPropagation()}>
              <Widgets />
            </div>
          </div>
        )}
        <div className="hidden xl:inline ml-14">
          <Widgets />
        </div>

        <CommentModal />
        <StatusModal />
      </main>

      <div className="xl:hidden justify-between bottom-0 z-40 fixed bg-slate-50 dark:bg-gray-900 w-full flex py-4 sm:px-10 md:px-24 px-4">
        <MenuAlt1Icon className="pl-4 h-10 cursor-pointer" onClick={toggleSidebar} />
        <HomeIcon className="h-10 cursor-pointer" onClick={toggleHome} />
        <SearchIcon className="pr-6 h-10 cursor-pointer" onClick={toggleWidgets} />
      </div>
    </div>
  );
};




export default WardPost;
