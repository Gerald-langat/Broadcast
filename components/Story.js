import { auth } from "../firebase";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function Story({ post, id }) {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(null);

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user)
      setUserDetails(user);
    })
  }
  useEffect(() => {
    fetchUserData();
  }, []);


  const handleClick = () => {
    if (!userDetails) {
      router.replace('/');
    } else {
      router.push(`/status/${id}`);
    }
  };

  return (
    <div className='flex flex-col' onClick={handleClick} >
       {post.statusImg && (
           <img
                 className="h-14 w-14 rounded-full p-[1.5px] border-2 border-blue-500 object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
                 src={post.statusImg}
                 alt=''
               />
       )}

         {post.video && (
        <video
          className="h-14 w-14 rounded-full p-[1.5px] border-2 border-blue-500 object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
          autoPlay
          src={post.video}
        />
         )}
      
      <p className="text-xs w-14 truncate text-center dark:text-gray-300 pt-1">{post.name}</p>
    </div>
  );
}

export default Story;
