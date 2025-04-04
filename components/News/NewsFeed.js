import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Spinner } from "flowbite-react";
import News from "./News";


export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try{
         const q = query(
        collection(db, "national"), 
        where('category', '!=', 'Personal Account'), 
        orderBy("timestamp", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPosts(snapshot.docs);
        setLoading(false);
      });
  
      return () => unsubscribe();
    } catch(error){
        console.log("the error", error)
      }
     
    };
      
    
    fetchPost();
  }, []);
  
  return (
    <div className="dark:bg-gray-950 dark:border-gray-700 
    border-gray-200 w-full sm:w-screen lg:min-w-[500px] 
    lg:max-w-[620px] 2xl:min-w-[700px] sm:px-4 md:px-8 xl:px-0 min-h-screen 2xl:ml-20 ml-0 ">
     <div className="xl:border-0 sm:border-x-[1px] dark:border-gray-700 border-gray-200">
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
              <News key={post.id} id={post.id} post={post} />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
     
    </div>
    </div>
  );
}
