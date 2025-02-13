import { Carousel } from "flowbite-react";
import Head from "next/head";
import { useRouter } from "next/router";


  export default function MediaPost({ post, id, name }) {
  const router = useRouter();
 
  

    return (
<div className="px-2 w-full cursor-pointer" onClick={() => router.push(`/posts(id)/${id}`)}>
  <Head>
    <title>{name && post?.data()?.name}</title>
    <meta name="description" content="Generated and created by redAnttech" />
    <link rel="icon" href="/images/Brod.png" /> {/* Updated to a relative path */}
  </Head>

  {(post?.data()?.images?.length || post?.data()?.video) && (
  <>
    {/* Display Carousel for Multiple Images */}
    {post?.data()?.images?.length > 1 ? (
      <Carousel className="top-0 h-[200px] w-full cursor-pointer">
        {post?.data()?.images.map((imageUrl, index) => (
          <img
            key={index}
            className="object-cover w-full h-full"
            src={imageUrl}
            alt={`image-${index}`}
            onClick={() => router.push(`/posts(id)/${id}`)}
          />
        ))}
      </Carousel>
    ) : (
      // Display Single Image
      post?.data()?.images?.[0] && (
        <img
          className="w-full h-[200px] object-cover rounded-md"
          src={post?.data()?.images[0]}  // Access the first image directly
          alt="Single image"
        />
      )
    )}

    {/* Display Video */}
    {post?.data()?.video && (
      <video
        autoPlay
        loop
        controls
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          e.currentTarget.pause(); // Pauses the video on click
        }}
        className="w-full h-[200px] object-cover rounded-md"
        src={post?.data()?.video}
      />
    )}
  </>
)}

       

  <div className={`'absolute flex space-x-2 ml-2 text-gray-50 text-2xl sm:text-lg' ${post?.data()?.video ? '-mt-48' : '-mt-8'}`}>
    <p className="truncate">{post?.data()?.name}</p>
    <p className="truncate">{post?.data()?.lastname}</p>
    <p className="truncate">@{post?.data()?.nickname}</p>
  </div>
</div>

    

            
       
    
    
    
    )
  }    