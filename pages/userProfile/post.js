import Link from "next/link";


function post({ post, id }) {
  return (
    <div>
          {/* {post?.images?.length > 1 ? (
            <Carousel className={`${!post?.images ? 'hidden' : "rounded-md h-[300px] w-[450px] sm:w-full sm:h-[600px] xl:h-[250px] mr-2 object-cover"}`}>
              {post?.images.map((imageUrl, index) => {
              console.log(imageUrl, index); // Check what images are being loaded
                return(
                <img
                  key={index}
                  className="object-cover h-full w-full"
                  src={imageUrl}
                  alt={`image-${index}`}
                />
              );
              })}
            </Carousel>
          ) : ( */}
                    <Link href={`/posts(id)/${id}`}>
          
            <img
                  className={` ${!post?.images ? 'hidden' : "rounded-md h-[200px] w-[350px] sm:w-full sm:h-[200px]  mr-2 object-cover"}`}
                  src={post?.images}
                  alt=''
                  onClick={() => router.push(`/posts(id)/${id}`)}
                />
          {/* )} */}
</Link>
     
         {post?.video && (
          <video autoPlay
          onClick={(e) => { 
            e.stopPropagation(); // Prevent the click event from bubbling up
            e.preventDefault(); // Prevent the default action (navigation)
            e.currentTarget.pause();
         
          }}
          className="rounded-2xl h-[200px] w-[350px] sm:w-full sm:h-[200px] mr-2 object-cover"
          src={post?.video}
          alt=""
          controls
        />
        )}
            
            
    </div>
  )
}

export default post
