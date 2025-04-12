import { useFollow } from '../FollowContext';
import { Spinner } from 'flowbite-react';

  

function FollowerCard({follower}) {
    const { hasFollowed, followMember, followloading } = useFollow();

    return (
       
            <div className='flex justify-between items-center w-full space-y-3'>
                <div className="flex  items-center space-x-3 mt-3">
                {follower?.userImg ? (
                    <img src={follower?.userImg} className='h-10 w-10 rounded-full object-cover' />
                ):(
                    <img src={follower?.imageUrl} className='h-10 w-10 rounded-full object-cover' />

                )}
                    
                <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">{follower?.name}</h5>
                <h5 className="mb-1 w-20 truncate font-medium text-gray-900 dark:text-white">{follower?.lastname}</h5>
                    <span className="text-sm w-20 truncate text-gray-500 dark:text-gray-400">@{follower?.nickname}</span>
                </div>
              <p  
                className='font-bold text-blue-500 sm:text-sm text-2xl cursor-pointer space-y-2'
      
                onClick={() => {
                  followMember(follower?.uid);
                }}
              >
              {followloading[follower?.uid] ? (
                  <Spinner aria-label="Loading spinner" size="sm" />
                ) : hasFollowed[follower?.uid] ? (
                  <p className='text-sm w-20 truncate text-red-500'>Unfollow</p>
                ) : (
                  <p className='text-sm w-20 truncate'>Follow</p>
                )}
              </p>
                   
        </div>
        
    );
}

export default FollowerCard;
