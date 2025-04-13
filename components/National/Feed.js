import Input from "./Input";
import Post from "./Post";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { AnimatePresence, motion } from "framer-motion";
import Stories from "../Stories";
import { Button, Spinner } from "flowbite-react";


export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
    const q = query(collection(db, "national"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs);
      setLoading(false);
    });
   
    return () => unsubscribe();
  }
  fetchPost();
  }, []);



  return (


    <div className="w-full max-w-screen ">
    {loading ? (
      <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
        <Spinner aria-label="Loading spinner" size="md" />
        <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
      </Button>
    ) : (
      <AnimatePresence>
        <div className="flex items-center justify-between dark:bg-gray-950 md:py-2 xl:px-3 sticky top-0 border-[1px] rounded-md border-gray-200 dark:border-gray-900 h-10 w-full">
          <h2 className="text-2xl md:text-xl font-bold cursor-pointer fixed dark:text-gray-300 xl:p-0">National</h2>
        </div>
  
        <div className="z-50">
          <Stories />
        </div>
  
        <div className="top-0 sticky z-5 bg-white dark:bg-gray-950">
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
      </AnimatePresence>
    )}
  </div>
  )
}