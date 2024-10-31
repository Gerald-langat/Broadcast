import { ArrowLeftIcon } from "@heroicons/react/outline";
import Head from "next/head";
import { useRouter } from "next/router";

function StatusCard({ post }) {
  const router = useRouter();

  return (
    <div>
    <Head>
        <title>Broadcast</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>
      
    <div className="flex flex-col justify-center items-center w-full h-screen">
     <div className="mb-4 flex items-center z-50 top-0 fixed">
        <button onClick={() => router.back()} className='dark:hover:bg-white dark:hover:text-gray-800 rounded-full'>
          <ArrowLeftIcon className="h-8 w-8 dark:text-gray-200 text-black animate-pulse" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold ml-1 lg:ml-2 dark:text-gray-200 text-black">Status Post</h2>
      </div>

     <div className="mx-2 sm:mx-16 md:mx-24 lg:mx-32 xl:mx-52">
      {post.statusImage && (
          <img
            className='w-full  h-full md:w-[900px] md:h-[500px] object-contain  shadow-md shadow-gray-600 drop-shadow-xl rounded-sm'
            src={post.statusImage}
            alt=''
            width={1920}
            height={1080}
            key={post.id}
          />
    
      )}
      {post.statusVideo && (
        <video
          className='w-full  h-full md:w-[900px] md:h-[500px] object-contain  shadow-md shadow-gray-600 drop-shadow-xl rounded-sm'
          src={post.statusVideo}
          alt=''
          width={1920}
          height={1080}
          key={post.id}
          controls
          autoPlay
        />
      )}
      </div>
      <h2 className='z-16 text-2xl dark:text-gray-200 text-black'>{post.text}</h2>
     </div>
    </div>


  );
}

export default StatusCard;
