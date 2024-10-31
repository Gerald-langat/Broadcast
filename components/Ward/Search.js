import { useRouter } from 'next/router';



function SearchComponent({ post }) {
  
  const router = useRouter();

  


  return (
    <div>
    {post && (
      <div className="flex cursor-pointer items-center dark:hover:bg-neutral-700 hover:bg-slate-100 w-full" onClick={() =>  router.replace(`/wardposts/${ post.data().name}`)}>
        <div className="flex items-center">
          <img
            className="h-9 w-9 rounded-full mb-1 ml-1 mt-1 mr-1"
            src={post.data().userImg}
            alt="user-img"
          />
        </div>

          <div className='flex space-x-2 text-sm'>
            <p>{post.data().name}</p>
            <p>{post.data().lastname}</p>
            <p className="text-sm text-gray-400">@{post.data().nickname}</p>
          </div>

      </div>
    )}
  </div>
);
}

export default SearchComponent;
