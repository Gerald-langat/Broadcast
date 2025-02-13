import { ArrowLeftIcon } from "@heroicons/react/outline";
import { Carousel } from "flowbite-react";
import Head from "next/head";
import { useRouter } from "next/router";

function StatusCard({ post }) {
  const router = useRouter();

  return (
    <div>
    <Head>
        <title>{post.name || 'loading...'}</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brod.png" />
      </Head>
      
    <div className="flex flex-col justify-center items-center w-full h-screen">
    

     <div className="mx-2 sm:mx-16 md:mx-24 lg:mx-32 xl:mx-52 rounded-md">
      {post.statusImage?.length > 1 ? (
         <Carousel className={`${!post.statusImage ? 'hidden' : 'w-full  h-full md:w-[900px] md:h-[500px] object-contain  shadow-md shadow-gray-600 drop-shadow-xl rounded-sm'}`}>
             {post.statusImage.map((imageUrl, index) => (
               <img
                 key={index}
                 className="object-cover rounded-sm"
                 src={imageUrl}
                 alt={`image-${index}`}
               />
             ))}
           </Carousel>
         ) : (
           <img
                 className={`${!post.statusImage ? 'hidden' : 'w-full  h-full md:w-[900px] md:h-[500px] object-contain  shadow-md shadow-gray-600 drop-shadow-xl rounded-sm'}`}
                 src={post.statusImage}
                 alt=''
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
