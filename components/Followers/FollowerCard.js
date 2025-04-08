import { useFollow } from '../FollowContext';
import { Spinner } from 'flowbite-react';

  

function FollowerCard({follower}) {
    const { hasFollowed, followMember, followloading } = useFollow();
    const { userData } = useFollow()

    return (
       
            <div className='flex justify-between items-center w-full'>
                <div className="flex  items-center space-x-3">
                    <img src={follower?.userImg} className='h-10 w-10 rounded-full' />
                <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{follower?.name}</h5>
                <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{follower?.lastname}</h5>
                    <span className="text-sm text-gray-500 dark:text-gray-400">@{follower?.nickname}</span>
                </div>
              <p  
               className={`${
                 userData?.name === follower?.name 
                   ? 'hidden' 
                   : 'font-bold text-blue-500 sm:text-sm text-2xl cursor-pointer space-y-2'
               }`}
               onClick={() => {
               
                 followMember(follower?.uid);
                 
               }}
             >
              {followloading[follower?.uid] ? (
                 <Spinner aria-label="Loading spinner" size="sm" />
               ) : hasFollowed[follower?.uid] ? (
                 <p>Unfollow</p>
               ) : (
                 "Follow"
               )}
             </p>
   
                </div>
        
    );
}

export default FollowerCard;
