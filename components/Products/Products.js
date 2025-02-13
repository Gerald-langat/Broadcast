import { Carousel } from 'flowbite-react';
import { useRouter } from 'next/router';
import { db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

function Products({data, id}) {
    const router = useRouter();
    const [post, setPost] = useState(null);
  
    useEffect(() => {
      const fetchPost = async () => {
        try {
          const docRef = doc(db, "marketplace", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setPost(docSnap.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching post:", error);
        }
      };
      
      fetchPost();
    }, [id]);


  return (

        <div
        key={data?.data()?.id}
        className="max-w-sm hover:scale-105 transition transform duration-300 dark:bg-gray-950 border-[1px] 
        dark:border-gray-800 rounded-md border-gray-300 relative"
        >
   <p className='absolute bg-yellow-500 text-white px-1 rounded-tl-md'>{post?.reserved && 'Reserved'}</p>
           {data?.data()?.images?.length > 1 ? (
            <Carousel className="top-0 h-[130px] w-full">
              {data?.data()?.images.map((imageUrl, index) => (
                <img
                  key={index}
                  className="object-cover w-full h-full" // Use object-cover and h-full to fill the carousel
                  src={imageUrl}
                  alt={`image-${index}`}
                
                />
              ))}
            </Carousel>

          ) : (
            <img
                  className="w-full h-[130px] object-cover rounded-t-md"  
                  src={data?.data()?.images}
                  alt=''
                />
          )}
     
        
        <div className='cursor-pointer' onClick={() => router.push(`/products/${id}`)}>
        <p className="font-normal text-gray-700 dark:text-gray-400 truncate p-2">
                {data?.data()?.description || 'No description available.'}
            </p>

            <p className="text-lg font-bold text-gray-900 dark:text-white w-full truncate p-2">
            Price: KES {Number(data?.data()?.cost).toLocaleString('en-KE')}
                    </p>
        </div>
          
        </div>
          
  )
}

export default Products
