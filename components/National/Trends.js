import Link from 'next/link';


export default function Trends({ topic, postCount }) {

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
    <div className="dark:bg-gray-950  lg:inline  space-y-5 py-2">      
        <div className=' dark:bg-gray-950 cursor-pointer bg-slate-50'>       
          <div className=" dark:bg-gray-950 items-center py-2 px-4  hover:bg-slate-200">
          <Link href={`/nationtrend/${topic.topic}`}>
          <div className='lg:w-[380px] 2xl:w-[400px] sm:w-[88%] w-[570px] dark:hover:bg-gray-900 flex flex-col dark:text-gray-300 hover:scale-105 
          transition transform duration-500'>
          <h6 className='sm:text-sm dark:text-gray-400 pt-3 sm:pt-1'>Trends in Kenya</h6>
            <span className="font-bold text-gray-950 dark:text-gray-300 sm:text-lg w-96 truncate">{topic.topic}</span>
            <span className='text-sm  dark:text-gray-400'>{formatNumber(postCount)} posts</span>
            </div>
            </Link>
          </div>
        </div>   
    </div>  
  );
}
