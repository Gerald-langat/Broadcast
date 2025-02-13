import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import Head from 'next/head';
import StatusCard from '../../components/StatusCard';
import { Button, Spinner } from 'flowbite-react';
import { ArrowLeftIcon } from '@heroicons/react/outline';

export default function ImagePage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (id) {
        setLoading(true);
        const q = query(
          collection(db, 'status'), 
          where('id', '==', id)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setPost(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // Ensure the id is included
          setLoading(false);
        } else {
          setLoading(false); // Ensure loading state is reset if no data is found
        }
      }
    };
  
    fetchUserData();
  }, [id]);

  return (
   <div>
      <Head>
        <title>Status Page</title>
      </Head>
    
      <main className="flex justify-start m-1 h-full">
      <div className="mb-4 flex items-center z-50 top-0 fixed px-6">
        <button onClick={() => router.back()} className='dark:hover:bg-white dark:hover:text-gray-800 rounded-full'>
          <ArrowLeftIcon className="h-8 w-8 dark:text-gray-200 text-black animate-pulse" />
        </button>
        <h2 className="text-lg sm:text-xl font-bold ml-1 lg:ml-2 dark:text-gray-200 text-black">Status Post</h2>
      </div>
        <div className="items-center justify-center snap-x snap-mandatory">
            {loading ? (
              <Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>
            ) : (
              <div className='flex overflow-scroll scrollbar-hide space-x-1 snap-container'>
                {post && post.map(post => (
              <section className=' snap-center'>
                  <StatusCard key={post.id} post={post} />
              </section>

                ))}
                </div>
            )}
          
          </div>
        
      </main>
      </div>
  );
}
