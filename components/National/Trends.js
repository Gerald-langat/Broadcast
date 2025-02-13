import { useRouter } from 'next/router';


export default function Trends({ topic, postCount }) {
  const router = useRouter();

  const formatNumber = (number) => {
    if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + 'M'; // 1 million and above
    } else if (number >= 1000) {
      return (number / 1000).toFixed(1) + 'k'; // 1 thousand and above
    } else {
      return number; // below 1 thousand
    }
  };

  return (
    <div className="dark:bg-gray-950 xl:w-[600px] lg:inline  space-y-5 py-2">      
        <div className=' dark:bg-gray-950 cursor-pointer ml-3 bg-slate-50'>       
          <div className=" dark:bg-gray-950 items-center py-2 px-4  hover:bg-slate-200">
          <div className='xl:w-[300px] w-[500px] sm:w-[500px] dark:hover:bg-gray-900 flex flex-col dark:text-gray-300 hover:scale-105 
          transition transform duration-500'  onClick={() => router.push(`/nationtrend/${topic.topic}`)}>
          <h6 className='text-2xl sm:text-sm dark:text-gray-400 pt-3 sm:pt-1'>Trends in Kenya</h6>
            <span className="font-bold text-gray-950 dark:text-gray-300 text-2xl sm:text-lg ">{topic.topic}</span>
            <span className='text-xl sm:text-sm  dark:text-gray-400'>{formatNumber(postCount)} posts</span>
            </div>
          </div>
        </div>   
    </div>  
  );
}
