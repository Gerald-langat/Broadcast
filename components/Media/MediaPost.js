import { Carousel } from "flowbite-react";
import Head from "next/head";
import { useRouter } from "next/router";


  export default function MediaPost({ post, id }) {
  const router = useRouter();
 
  

    return (
      <div
      className="px-2 w-full cursor-pointer"
      onClick={() => router.push(`/posts(id)/${id}`)}
    >
      <Head>
        <title>media</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../images/Brodcast.jpg" /> {/* Updated to a relative path */}
      </Head>

      {/* Display Carousel for Multiple Images */}
      {post?.data()?.images?.length > 1 ? (
        <Carousel className="h-[200px] w-full cursor-pointer mt-4 sm:mt-1">
          {post?.data()?.images.map((imageUrl, index) => (
            <div className="relative h-full w-full" key={index}>
              <img
                className="object-cover w-full h-full rounded-md"
                src={imageUrl}
                alt={`image-${index}`}
              />
              <div className="absolute bottom-2 left-2 bg-gray-700 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
                <p className="font-bold">{post?.data()?.name}</p>
                <p>{post?.data()?.lastname}</p>
                <p>@{post?.data()?.nickname}</p>
              </div>
            </div>
          ))}
        </Carousel>
      ) : // Display Single Image
      post?.data()?.images?.[0] ? (
        <div className="relative">
          <img
            className="w-full h-[200px] object-cover rounded-md"
            src={post?.data()?.images[0]} // Access the first image directly
            alt="Single image"
          />
          <div className="absolute bottom-2 left-2 bg-gray-500 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
            <p className="font-bold">{post?.data()?.name}</p>
            <p>{post?.data()?.lastname}</p>
            <p>@{post?.data()?.nickname}</p>
          </div>
        </div>
      ) : post?.data()?.video ? (
        <div className="relative mt-4">
          <video
            autoPlay
            loop
            controls
            className="w-full h-[200px] object-cover rounded-md"
            src={post?.data()?.video}
          />
          <div className="absolute bottom-2 left-2 bg-gray-500 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
            <p className="font-bold">{post?.data()?.name}</p>
            <p>{post?.data()?.lastname}</p>
            <p>@{post?.data()?.nickname}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
     