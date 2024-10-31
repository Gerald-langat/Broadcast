
function Messages({ post }) {
 


  return (
    <div className=" dark:bg-gray-950" >
    
       <div>
        {post && (
          <div
            className="flex justify-start cursor-pointer items-center dark:hover:bg-neutral-700 py-5 sm:py-2 hover:bg-slate-100 w-full"
          >
            <div className="flex items-center">
              <img
                className="sm:h-9 sm:w-9 h-12 w-12 rounded-full mb-1 ml-1 mt-1 mr-1"
                src={post.userImg}
                alt="user-img"
              />
            </div>

            <div className="flex space-x-2 text-2xl sm:text-sm">
              <p>{post.name}</p>
              <p>{post.lastname}</p>
              <p className="text-gray-400">@{post.nickname}</p>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
}

export default Messages;
