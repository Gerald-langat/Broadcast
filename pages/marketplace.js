import { useUser } from '@clerk/nextjs';
import { db, storage } from '../firebase';
import { ArrowLeftIcon, PhotographIcon, XIcon } from '@heroicons/react/outline'
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { Dropdown } from 'flowbite-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link';

function MarketPlace() {
const filePickerRef = useRef();
const router = useRouter();
const [selectedFiles, setSelectedFiles] = useState([]);
const [input, setInput] = useState("");
const [inputNum, setInputNum] = useState("");
const [userData, setUserData] = useState("");
const [loading, setLoading] = useState(false);
const categories = ['Electronics', 'Vehicles & Trucks', 'Machineries', 'Buildings & Land', 'Fashion', 'Phones & Tablets', 'Agricultural'];
const [error, setError] = useState(null);
const [selectedCategory, setSelectedCategory] = useState(null);
const [productName, setProductName] = useState(null);
const { user } = useUser()


  const handleSelect = (category) => {
    setSelectedCategory(category)
  };

useEffect(() => {
  const fetchUserData = async () => {
    if (user?.id) {
      const q = query(collection(db, 'userPosts'), where('uid', '==', user?.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUserData(querySnapshot.docs[0].data());
      }

    }
  };

  fetchUserData();
}, [user?.id]);

// send product to db
const sendPost = async (e) => {
  e.preventDefault();
  setLoading(true);  
  try {
    if (userData) {
      const docRef = await addDoc(collection(db, 'marketplace'), {
        uid: user?.id,
        description: input,
        cost: inputNum,
        userImg:userData.userImg,
        productImg: userData.userImg,
        timestamp: serverTimestamp(),
        lastname: userData.lastname,
        name: userData.name,
        nickname: userData.nickname,
        county: userData.county,
        constituency: userData.constituency,
        ward: userData.ward,
        product: productName,
        category: selectedCategory
      });

   
      const imageUploadPromises = [];
      const imageUrls = [];
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          const imageRef = ref(storage, `marketplace/${docRef.id}/image-${index}`);

          // Upload each image and store the URL
          const uploadTask = uploadString(imageRef, file, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(imageRef);
            imageUrls.push(downloadURL);
          });

          imageUploadPromises.push(uploadTask);
        });

        // Wait for all images to upload
        await Promise.all(imageUploadPromises);

        // Update Firestore document with all image URLs
        await updateDoc(doc(db, "marketplace", docRef.id), {
          images: imageUrls,
        });
      }
      
      setInput("");
      setInputNum("");
      setProductName("");
      setSelectedFiles([]);
         
     }
  } catch (error) {
    console.error("Error adding document: ", error);
    setError("Error adding document: " + error.message);
  } finally{
    setLoading(false);
  }

};

const addImageToPost = (e) => {
  const files = e.target.files;
  const fileReaders = [];

  for (let i = 0; i < files.length; i++) {
    const reader = new FileReader();
    fileReaders.push(reader);
    reader.readAsDataURL(files[i]);

    reader.onload = (readerEvent) => {
      setSelectedFiles((prevFiles) => [...prevFiles, readerEvent.target.result]);
    };
  }
};

const removeSelectedFile = (index) => {
  setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
};

useEffect(() => {
    if (!userData?.uid) {
      router.push('/'); // Instead of using signout, you can push to the signout page
    }
  }, [user, router]);

  return (
<div>
    <Head>
    <title>MarketPlace</title>
    <meta name="description" content="Generated and created by redAnttech" />
    <link rel="icon" href="../../images/Brodcast.jpg" />
  </Head>

    <div className="bg-gray-100 h-screen dark:bg-gray-950">
     <form onSubmit={sendPost} className='min-h-1/2 flex-grow min-h-screen my-auto w-full sm:w-[600px] md:w-[700px] xl:w-[900px]
      text-gray-500 mx-auto bg-transparent rounded-md border-[1px] space-y-6 relative dark:border-gray-900 border-gray-300'>
      <div className='flex justify-between border-b-[1px] border-gray-200 dark:border-gray-900 w-full pb-2'>

      <div className='flex items-center space-x-3 p-3'>
      <Link href={`/national`}>
          <ArrowLeftIcon className='h-6 dark:text-gray-200 text-gray-700 animate-pulse cursor-pointer'/>
          </Link>
          <span className='text-lg dark:text-gray-200'>Home</span>
      </div>
      <div className='flex space-x-3 items-center p-3'>
      <Link href={`/products`}>
      <div className='border-[1px] dark:border-gray-900 rounded-md border-gray-400 p-1 hover:bg-neutral-700 cursor-pointer text-gray-600 hover:text-gray-300 dark:text-gray-300'>
        <p>View Products</p>
      </div>
      </Link>
      <img src={userData.userImg} className='h-8 w-8 rounded-md shadow-sm shadow-gray-600' />
      </div>
        

      </div>

    

{/*body */}
        <div className='flex-col sm:flex item-center justify-between mt-10  h-full w-full  px-2  sm:px-8'>
        <div className='flex flex-col space-y-4 ml-2'>

          <div className='dark:text-gray-200 text-gray-700 font-mono space-x-2 text-3xl flex'>
            <h2>Marketing</h2>
          </div>

        <div className=' flex flex-col md:flex-row md:items-center space-x-2 text-3xl'>
        <label className='dark:text-gray-200 mr-[23px] text-gray-700 '>
        Product Name:
        </label>
          <input type='text' 
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="enter product name" 
          className='focus:ring-0 focus:outline-none rounded-md border-[1px] w-72 bg-transparent 
           border-gray-400 dark:border-gray-900 dark:text-gray-200 text-gray-700 text-2xl dark:placeholder:text-gray-200 placeholder:text-gray-700'
            required
           />
        </div>

        <div className=' flex flex-col md:flex-row md:items-center space-x-2 text-3xl'>
        <label className='dark:text-gray-200 mr-[146px] text-gray-700'>
        Cost :
        </label>
          <input type='number' 
          value={inputNum}
          onChange={(e) => setInputNum(e.target.value)}
          placeholder="enter amount" 
          className='focus:ring-0 focus:outline-none rounded-md border-[1px] w-72 bg-transparent 
           border-gray-400 dark:border-gray-900 dark:text-gray-200 text-gray-700 text-2xl dark:placeholder:text-gray-200 placeholder:text-gray-700'
            required
           />
        </div>

        <div className='dark:text-gray-200 text-gray-700 flex flex-col md:flex-row md:items-center space-x-2 text-3xl'>
          <label className='mr-14'>
            Description :
          </label>
          <textarea 
          className='h-14 bg-transparent rounded-md text-2xl w-72 border-b-[1px] dark:border-gray-900 sm:ml-2 focus:ring-0 focus:outline-none'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          required
          ></textarea>
        </div>



<div className='flex flex-col sm:flex-row sm:justify-between items-center max-w-md sm:max-w-lg w-full ml-2'>
  {/* Category Dropdown */}
  <div className='w-72 sm:w-40 border border-gray-400 rounded-lg py-2 px-1 dark:border-gray-900 dark:text-gray-200 text-gray-700 dark:hover:bg-neutral-700'>
    <Dropdown label={selectedCategory || 'Select Category'} inline required>
      <div className=' overflow-y-scroll scrollbar-hide z-40'>
        {categories.map((category, index) => (
          <Dropdown.Item 
            className='text-xl md:text-sm' 
            key={index} 
            onClick={() => handleSelect(category)}>
            {category}
          </Dropdown.Item>
        ))}
      </div>
    </Dropdown>
  </div>

  {/* Sell Button */}
  <div className='mt-4 sm:mt-0'>
    <button
      className='font-serif px-4 w-72 sm:w-40 h-10 border dark:border-gray-900 border-gray-400 rounded-lg text-2xl dark:text-gray-100 text-gray-700 bg-blue-500 hover:animate-bounce cursor-pointer'>
      {loading ? 'loading...' : 'Sell'}
    </button>
  </div>
</div>



  <div className='flex-col sm:flex-row '>
     <div onClick={() => filePickerRef.current.click()} className='flex gap-4 w-fit cursor-pointer'>
        <PhotographIcon className='h-11 dark:text-gray-300 text-gray-700' 
           onChange={addImageToPost}
        />
          <input 
            type="file"
            hidden
            accept="image/*"
            ref={filePickerRef}
            onChange={addImageToPost}
              required
            />
             {selectedFiles.length > 0 && (
              <div className="gap-2 grid grid-cols-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <XIcon
                      onClick={() => removeSelectedFile(index)}
                      className="border h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full"
                    />
                    <img
                      src={file}
                      className={`${loading && "animate-pulse"} h-[100px] w-[200px] object-cover`}
                      alt={`image-${index}`}
                    />
                  </div>
                ))}
              </div>
            )}
        </div>    
</div>
       
        </div>     
        </div>
      </form>
     
    </div>
</div>
  )
}

export default MarketPlace
