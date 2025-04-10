import Link from 'next/link';



function SearchComponent({ post }) {
  const uid = post?.data()?.uid;
 
  return (
    <div>
      {post && (
        <Link href={`/constituencyposts/${uid}`}>
        <div className="flex cursor-pointer items-center dark:hover:bg-neutral-700 hover:bg-slate-100 w-full">
          <div className="flex items-center">
          {post?.data().userImg ? (
            <img
              className="h-9 w-9 rounded-full mb-1 ml-1 mt-1 mr-1"
              src={post?.data()?.userImg}
              alt="user-img"
            />
            ):(
              <img
              className="h-9 w-9 rounded-full mb-1 ml-1 mt-1 mr-1"
              src={post?.data()?.imageUrl}
              alt="user-img"
            />
            )}
            
          </div>
          <div className='flex space-x-2 text-sm'>
              <p>{post?.data()?.name}</p>
              <p>{post?.data()?.lastname}</p>
              <p className="text-sm text-gray-400">@{post?.data()?.nickname}</p>
            </div>
        </div>
        </Link>
      )}
    </div>
  );
}

export default SearchComponent;
