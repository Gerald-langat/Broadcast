import { useRouter } from 'next/router';


function SearchComponent({ post }) {
  const router = useRouter();
  const name = post.name;
  const nickname = post.nickname;
  return (
    <div>
      {post && (
        <div className="flex cursor-pointer items-center dark:hover:bg-gray-900 py-5 sm:py-2 hover:bg-slate-100 w-full"
         onClick={() =>  router.push(`/mediapost/${ name || nickname}`)}>
          
          <div className="flex items-center">
            <img
              className="sm:h-9 sm:w-9 h-12 w-12 rounded-full mb-1 ml-1 mt-1 mr-1"
              src={post.userImg}
              alt="user-img"
            />
          </div>

            <div className='flex space-x-2 text-2xl sm:text-sm'>
              <p>{post.name}</p>
              <p>{post.lastname}</p>
              <p className="text-gray-400">@{post.nickname}</p>
            </div>

        </div>
      )}
    </div>
  );
}

export default SearchComponent;
