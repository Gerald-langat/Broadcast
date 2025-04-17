import { SparklesIcon } from "@heroicons/react/outline";
import Input from "./Input";
import Post from "./Post";
import { collection, getDocs, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import {  db } from "../../firebase";
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
      if (!userData || !userData?.ward) {
        setLoading(true);
        return;
      }
      onSnapshot(
        query(collection(db, "ward", userData.ward, "posts"), orderBy("timestamp", "desc")),
        (snapshot) => {
          setPosts(snapshot.docs);
          setLoading(false);
        }
      ),
    [userData, userData?.ward]
});


  return (
    <div>
     <div className="xl:border-0 sm:border-x-[1px] w-full dark:border-gray-700 border-gray-200">
     {loading ? (
        <Button color="gray" className="border-0 items-center flex mt-4 sm:mt-0">
          <Spinner aria-label="Loading spinner" size="md" />
        </Button>
      ) : (
        <>
      <div className="dark:bg-gray-950 dark:text-gray-300 dark:border-gray-900 flex py-2 px-3 sticky top-0 rounded-md bg-white border-[1px] border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold cursor-pointer">{userData ? userData.ward : ""}</h2>
        <div className="flex items-center justify-center px-0 ml-auto w-9 h-9">
          <SparklesIcon className="h-5" />
        </div>
      </div>
      <div className="top-8 sticky dark:bg-gray-950 bg-white w-full">
        <Input />
      </div>
      
      <AnimatePresence>
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {loading ? <Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button> :(
            <Post key={post.id} id={post.id} post={post}/>
                    )}
          </motion.div>
        ))}
      </AnimatePresence>
      </>
      )}
    </div>
    </div>
  );
}
