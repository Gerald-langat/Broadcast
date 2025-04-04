import { Carousel } from "flowbite-react";
import Head from "next/head";
import Link from "next/link";


  export default function MediaPost({ post, id }) {
 
    return (
    <>
    <Head>
        <title>media</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../images/Brodcast.jpg" /> {/* Updated to a relative path */}
      </Head>

      <Link href={`/posts(id)/${id}`}>
      <div
      className="rounded-md w-full cursor-pointer"
    >
    
      {post?.images?.length > 1 ? (
        <Carousel className="h-[200px] w-full cursor-pointer mt-1 sm:mt-1">
          {post?.images.map((imageUrl, index) => (
            <div className="relative h-full w-full" key={index}>
              <img
                className="object-cover w-full h-full rounded-md"
                src={imageUrl}
                alt={`image-${index}`}
              />
              <div className="absolute bottom-2 left-2 bg-gray-700 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
                <p className="font-bold">{post?.name}</p>
                <p>{post?.lastname}</p>
                <p>@{post?.nickname}</p>
              </div>
            </div>
          ))}
        </Carousel>
      ) : // Display Single Image
      post?.images?.[0] ? (
        <div className="relative">
          <img
            className="w-full h-[200px] object-cover rounded-md"
            src={post?.images[0]} // Access the first image directly
            alt="Single image"
          />
          <div className="absolute bottom-2 left-2 bg-gray-500 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
            <p className="font-bold">{post?.name}</p>
            <p>{post?.lastname}</p>
            <p>@{post?.nickname}</p>
          </div>
        </div>
      ) : post?.video ? (
        <div className="relative mt-4">
          <video
            autoPlay
            loop
            controls
            className="w-full h-[200px] object-cover rounded-md"
            src={post?.video}
          />
          <div className="absolute bottom-2 left-2 bg-gray-500 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
            <p className="font-bold">{post?.name}</p>
            <p>{post?.lastname}</p>
            <p>@{post?.nickname}</p>
          </div>
        </div>
      ) : null}
    </div>
    </Link>
    </>
  );
}
     