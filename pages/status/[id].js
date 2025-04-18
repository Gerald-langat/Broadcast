import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { auth, db, storage } from '../../firebase';
import { collection, deleteDoc, doc, onSnapshot, query, where } from 'firebase/firestore';
import Head from 'next/head';
import { Spinner } from 'flowbite-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { deleteObject } from 'firebase/storage';
import { useUser } from '@clerk/nextjs';

export default function StatusPage() {
  const router = useRouter();
  const { id } = router.query;
  const [statuses, setStatuses] = useState([]); // Array of statuses
  const [currentIndex, setCurrentIndex] = useState(0); // Track the current status index
  const [progress, setProgress] = useState(0); // Progress for the current status
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const { user } = useUser()

  useEffect(() => {
    if (!id) return;
  
    const docRef = doc(db, "status", id);
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatuses([{ docId: snapshot.id, ...snapshot.data() }]); // Convert single doc to array
      } else {
        setStatuses([]); // Handle case where document does not exist
      }
      setLoading(false);
    });
  
    return () => unsubscribe && unsubscribe(); // Cleanup function
  }, [id]);
  
   
  // delete status
  async function deleteStatus() {
    if (!id) {
      console.error("id is undefined");
      return;
    }
    if (window.confirm("Are you sure you want to delete this status?")) {
      try {
        console.log("Deleting Firestore document...");
        await deleteDoc(doc(db, "status", id));
        await deleteObject(ref(storage, `status/${id}/video`));
        console.log("Firestore document deleted successfully.");
        console.log('this is the best id', id);
        setStatuses((prev) => prev.filter((status) => status.id !== id)); // Update local state
      } catch (error) {
        console.error("Error deleting Firestore document:", error);
      }
    }
    router.replace('/national')
  }
  
  const pauseOrResume = () => {
    setIsPaused((prev) => !prev);
  };

  // Automatically progress through statuses
  useEffect(() => {
    if (!statuses.length || loading) return;

    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            if (currentIndex < statuses.length - 1) {
              setCurrentIndex((prevIndex) => prevIndex + 1);
              return 0;
            } else {
              router.push('/national'); // Exit when all statuses are viewed
              return prev;
            }
          }
          return prev + 1; // Increment progress
        });
      }, 100);
    }

    return () => clearInterval(timerRef.current); // Cleanup timer
  }, [statuses, currentIndex, loading, isPaused]);


  // Handle manual navigation
  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      router.push('/national'); // Exit when reaching the end
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  if (loading) {
    return <div className='w-full h-full justify-center flex'>
    <Spinner />
    </div>;
  }

  if (!statuses){
    router.replace('/national')
  }

  

  return (
    <div className="w-screen h-screen flex flex-col dark:bg-gray-950 relative">
      <Head>
        <title>Status</title>
      </Head>

      {/* Progress Bars */}
      <div className="absolute top-0 left-0 w-full flex space-x-1 p-2 z-50">
        {statuses.map((_, index) => (
          <div
            key={index}
            className={`flex-1 h-1 ${
              index < currentIndex ? 'bg-gray-200 rounded-full' : 'bg-gray-500 rounded-full'
            }`}
          >
            {index === currentIndex && (
              <div
                className="dark:bg-white bg-black h-1 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Current Status */}
    {statuses.length > 0 && (
    statuses[currentIndex]?.statusImg ? (
      <div
        className="relative flex-grow flex-col items-center justify-center"
        style={{
          backgroundImage: `url(${statuses[currentIndex]?.statusImg})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100%',
        }}
      >
        <div className="absolute w-full justify-center flex bottom-4 text-white text-lg font-semibold">
          <p className='bg-gray-700 p-1 rounded-md'>
            {statuses[currentIndex]?.text || ''}
          </p>
        </div>
        <div className='flex space-x-2 ml-auto mt-4 z-50'>
        {/* delete */}
        <button
            onClick={() => deleteStatus(statuses[currentIndex]?.id)}
            className={`${statuses[currentIndex]?.uid == user?.id ? " z-50 bg-red-500 text-white px-4 py-2 rounded" : "hidden"}`}
          >
            Delete
        </button>
        {/* pause */}
        <button onClick={pauseOrResume} >
          {isPaused ? "Resume" : "Pause"}
        </button>
</div>
      </div>
    ) : statuses[currentIndex]?.video ? (
    <div className="relative flex-grow flex flex-col items-center justify-center">
      <video
        src={statuses[currentIndex]?.video}
        controls
        autoPlay
        className="object-contain"
        style={{ height: '90%', width: '60%' }}
      />
        <div className="absolute w-full justify-center flex bottom-24 text-white text-lg font-semibold">
          <p className='bg-gray-700 p-1 rounded-md'>
            {statuses[currentIndex]?.text || ''}
          </p>
        </div>
      <button
      onClick={() => deleteStatus(statuses[currentIndex]?.id)}
      className={`${statuses[currentIndex]?.uid == user?.id ? "absolute top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded" : "hidden"}`}
    >
      Delete
    </button>
    </div>
) : null
      )}
      {/* Navigation Controls */}
      <div className="absolute top-0 left-0 w-1/6 h-full flex justify-center items-center cursor-pointer" onClick={handlePrev}>
      <ChevronLeft className='h-10 w-10'/>
      </div>
      <div className="absolute top-0 right-0 w-1/6 h-full flex justify-center items-center cursor-pointer" onClick={handleNext}>
      <ChevronRight className='h-10 w-10'/>
      </div>
    </div>
  );
}
