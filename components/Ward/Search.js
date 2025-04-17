import Link from 'next/link';


function SearchComponent({ post }) {
  const uid = post?.data()?.uid


  return (
    <div>
    {post && (
<Link href={`/wardposts/${uid}`}>
      <div className="flex cursor-pointer items-center dark:hover:bg-gray-900 py-5 sm:py-2 hover:bg-slate-100 w-full">          
        <div className="flex items-center">
        {post?.data()?.userImg ? (
          <img
            className="sm:h-9 sm:w-9 h-12 w-12 rounded-md mb-1 ml-1 mt-1 mr-1"
            src={post.data().userImg}
            alt="user-img"
          />
        ): (
          <img
            className="sm:h-9 sm:w-9 h-12 w-12 rounded-md mb-1 ml-1 mt-1 mr-1"
            src={post?.data()?.imageUrl}
            alt="user-img"
          />
        )}
          
        </div>
          <div className='flex space-x-2 text-lg sm:text-sm'>
            <p className='max-w-24 truncate '>{post.data().name}</p>
            <p className='max-w-24 truncate '>{post.data().lastname}</p>
            <p className="max-w-24 truncate text-gray-400">@{post.data().nickname}</p>
          </div>
      </div>
</Link>
    )}
  </div>
);
}

export default SearchComponent;
