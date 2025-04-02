import { SparklesIcon } from "@heroicons/react/outline";
import Input from "./Input";
import Post from "./Post";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Spinner } from "flowbite-react";
import { useUser } from "@clerk/nextjs";



export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
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

  useEffect(
    () =>{
      if (!userData || !userData.county) {
        setLoading(true);
        return;
      }
      onSnapshot(
        query(collection(db, "county", userData.county, "posts"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setPosts(snapshot.docs);
          setLoading(false);
        }
      ),
    []
});


  return (
    <div className="dark:bg-gray-950 dark:border-gray-700 
    border-gray-200 w-full sm:w-screen lg:min-w-[576px] 
    lg:max-w-[620px] 2xl:min-w-[700px] sm:px-4 md:px-8 xl:px-0 min-h-screen 2xl:ml-[560px] ml-0 2xl:mr-16">
     <div className="xl:border-0 sm:border-x-[1px] dark:border-gray-700 border-gray-200">
     {loading ? (
        <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
          <Spinner aria-label="Loading spinner" size="md" />
          <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
        </Button>
      ) : (
        <>
        <div className="flex items-center justify-between dark:bg-gray-950 md:py-2 xl:px-3 sticky top-0 border-[1px] rounded-md
       border-gray-200 bg-white  dark:border-gray-900 h-10">
        <h2 className="text-lg sm:text-xl font-bold cursor-pointer dark:text-gray-300">{userData ? userData.county: ""}</h2>
        <div className="flex items-center justify-center px-0 ml-auto w-9 h-9 dark:text-gray-300">
          <SparklesIcon className="h-5" />
        </div>
      </div>
      <div className="top-8 sticky dark:bg-gray-950 bg-white">
        <Input />
      </div>
      
      {loading ? (
        <Button color="gray" className="border-0">
          <Spinner aria-label="Loading spinner" size="sm" />
          <span className="pl-3 animate-pulse">Loading...</span>
        </Button>
      ) : (
        <AnimatePresence>
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Post key={post.id} id={post.id} post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
      </>
      )}
    </div>
    </div>
  );
}
