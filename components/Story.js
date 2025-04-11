import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

function Story({ post, id }) {
  const router = useRouter();
  const { user } = useUser()


 useEffect(() => {
  if (!user?.id) {
      router.replace('/');
    }
 });


  return (
    <Link href={`/status/${id}`}>
    <div className='flex flex-col' >
       {post.images && (
           <img
                 className="h-14 w-14 rounded-full p-[1.5px] border-2 border-blue-500 object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
                 src={post.images}
                 alt=''
               />
       )}

         {post.videos && (
        <video
          className="h-14 w-14 rounded-full p-[1.5px] border-2 border-blue-500 object-contain cursor-pointer hover:scale-110 transition transform duration-200 ease-out"
          autoPlay
          src={post.videos}
        />
         )}
      
      <p className="text-xs w-14 truncate text-center dark:text-gray-300 pt-1">{post.name}</p>
    </div>
    </Link>
  );
}

export default Story;
