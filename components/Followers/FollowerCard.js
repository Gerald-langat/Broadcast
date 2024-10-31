import { PhoneOutgoingIcon } from '@heroicons/react/outline';
import { useRouter } from 'next/router';

  

function FollowerCard({follower}) {
    const router = useRouter();


    return (
       
            <div className="max-w-sm h-60 border border-gray-300 rounded-md">
                <div className="flex flex-col items-center pb-10 pt-4">
                    <img src={follower?.data()?.userImg} className='h-16 w-16 rounded-full' />
                <h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">{follower?.data()?.name}</h5>
                    <span className="text-sm text-gray-500 dark:text-gray-400">@{follower?.data()?.nickname}</span>
                    <div className="mt-4 flex space-x-3 lg:mt-6">
                        <div
                            className="inline-flex items-center p-2 text-center text-sm font-medium text-white hover:bg-slate-500 rounded-full cursor-pointer"  
                           onClick={() => router.push('/call')}
                        >
                      
                            <PhoneOutgoingIcon className='h-6 text-gray-800 dark:text-gray-300'/>
                        </div>
                      
                    </div>
                </div>
             
                </div>
        
    );
}

export default FollowerCard;
