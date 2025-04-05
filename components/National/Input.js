import {
  CameraIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/outline";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { useState, useRef, useEffect } from "react";
import { auth, db, storage } from "../../firebase";
import Picker from 'emoji-picker-react'// Import your EmojiPicker component
import { Popover, Spinner, Tooltip } from "flowbite-react";
import { useRouter } from "next/router";
import { useUser } from "@clerk/nextjs";

export default function Input() {
  const [input, setInput] = useState("");
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for EmojiPicker
  const filePickerRef = useRef(null);
  const videoPickerRef = useRef(null);
  const [error, setError] = useState('');
  const [postToWard, setPostToWard] = useState(false);
  const [postToConst, setPostToConst] = useState(false);
  const [postToCounty, setPostToCounty] = useState(false);
  const [emoji, setEmoji] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const { user } = useUser()
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        const q = query(collection(db, 'userPosts'), where('uid', '==', user.id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
      setLoading(false); // 🔥 Important! Set loading to false after fetch finishes
    };
    fetchUserData();
  }, [user?.id]);

  const sendPost = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (userData) {
        const docRef = await addDoc(collection(db, 'national'), {
          uid: userData.uid,
          text: input,
          userImg: userData.userImg,
          timestamp: serverTimestamp(),
          lastname: userData.lastname,
          name: userData.name,
          nickname: userData.nickname,
          county: userData.county,
          constituency: userData.constituency,
          ward: userData.ward,
          category:userData.category,
          views: []
        });

        const imgRef = ref(storage, `national/${docRef.id}/images`);
       if (selectedFile) {
          await uploadString(imgRef, selectedFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(imgRef);
            await updateDoc(doc(db, "national", docRef.id), {
              images: downloadURL,
            });
          });
        }
        
        const vidRef = ref(storage, `national/${docRef.id}/videos`);
       if (selectedVidFile) {
          await uploadString(vidRef, selectedVidFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(vidRef);
            await updateDoc(doc(db, "national", docRef.id), {
              videos: downloadURL,
            });
          });
        }

        if (postToWard) {
          const wardCollection = collection(db, "ward", userData.ward, "posts");
          await addDoc(wardCollection, {
            uid: userData.uid,
            text: input,
            userImg: userData.userImg,
            timestamp: serverTimestamp(),
            lastname: userData.lastname,
            name: userData.name,
            nickname: userData.nickname,
            county: userData.county,
            constituency: userData.constituency,
            ward: userData.ward,
            category:userData.category,
            views: [],
          });
        }

        if (postToConst) {
          const ConstituencyCollection = collection(db, "constituency", userData.constituency, "posts");
          await addDoc(ConstituencyCollection, {
            uid: userData.uid,
            text: input,
            userImg: userData.userImg,
            timestamp: serverTimestamp(),
            lastname: userData.lastname,
            name: userData.name,
            nickname: userData.nickname,
            county: userData.county,
            constituency: userData.constituency,
            ward: userData.ward,
            category:userData.category,
            views: []
          });
        }

        if (postToCounty) {
          const countyCollection = collection(db, "county", userData.county, "posts");
          await addDoc(countyCollection, {
            uid: userData.uid,
            text: input,
            userImg: userData.userImg,
            timestamp: serverTimestamp(),
            lastname: userData.lastname,
            name: userData.name,
            nickname: userData.nickname,
            county: userData.county,
            constituency: userData.constituency,
            ward: userData.ward,
            category:userData.category,
            views: []
          });
        }

        setInput("");
        setSelectedFiles([]);
        setSelectedVidFile(null);
        setLoading(false);
        setPostToWard(false); 
        setPostToConst(false);
        setPostToCounty(false);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Error adding document: " + error.message);
      setLoading(false);
    }
    setShowEmojiPicker(false);
  };

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };


  const addVideoToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setSelectedVidFile(readerEvent.target.result);
    };
  };

  const wardPost = () => {
    if (window.confirm("Are you sure you want to post in your Ward?...")) {
      setPostToWard(true);
    }
  };

  const constituencyPost = () => {
    if (window.confirm("Are you sure you want to post in your Constituency?...")) {
      setPostToConst(true);
    }
  };

  const countyPost = () => {
    if (window.confirm("Are you sure you want to post in your County?...")) {
      setPostToCounty(true);
    }
  };
  
  const removeSelectedFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };
  

  return (
    <>
      {userData && (
        <div className="flex xl:p-3 space-x-3 z-40 top-0
        pb-2 dark:border-gray-900 border-[1px] rounded-md my-1">
        {userData.userImg && (
            <img
            className="h-11 w-11 md:h-11 md:w-11 rounded-md lg:mr-4 object-fit  cursor-pointer  shadow-gray-800 shadow-sm dark:shadow-gray-600"
            src={userData.userImg}
            alt="user-img"
          />

      )}
    
          <div className="w-full border-none">
          
              <textarea
                  className="dark:bg-gray-950 border-b-[1px] border-x-0 border-t-0 dark:border-gray-900 dark:placeholder:text-gray-100
                   dark:text-gray-300 w-full outline-none  focus:ring-0 text-xl sm:text-lg placeholder-gray-700 border-gray-300
                   placeholder:text-2xl sm:placeholder:text-xl tracking-wide min-h-[50px] text-gray-700"
                rows="2"
                placeholder="type here...."
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onClick={() => setShowEmojiPicker(false)}>
              </textarea>


            {loading ? (
        <div  className="border-none items-center flex mt-4 sm:mt-0">
          <Spinner aria-label="Loading spinner" size="md" />
          <span className="pl-3 animate-pulse sm:text-[16px] text-[28px]">Loading...</span>
        </div>
      ) :(
        <>
            {selectedVidFile && (
              <div className="relative">
                <XIcon
                  onClick={() => setSelectedVidFile(null)}
                  className="border h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full"
                />
                <video
                  autoPlay
                  src={selectedVidFile}
                  controls
                  className={`${loading && "animate-pulse"} h-[200px] w-[300px] object-cover` }
                />
              </div>
            )}
              <div className="flex gap-2 flex-wrap border-none">
                {selectedFile && (
                  <div key={index} className="border-none">
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
                )}
              </div>
              </>
            )}


            <div className="flex items-center justify-between pt-2.5 border-none">
              {!loading && (
                <div className='flex w-full justify-between px-2'>
                  <div className="flex">
                    <div onClick={() => filePickerRef.current.click()}>
                    <Tooltip content='image' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                      <PhotographIcon className="h-10 w-10 md:h-9 md:w-9 rounded-full cursor-pointer 
                      p-1 text-sky-500 dark:hover:bg-neutral-700 hover:bg-blue-100" />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={filePickerRef}
                        onChange={addImageToPost}
                      />
                      </Tooltip>
                    </div>
                    <div onClick={() => videoPickerRef.current.click()}>
                    <Tooltip content='video' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                      <CameraIcon className="h-10 w-10 md:h-9 md:w-9 rounded-full cursor-pointer p-1 text-sky-500 dark:hover:bg-neutral-700 hover:bg-blue-100" />
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        ref={videoPickerRef}
                        onChange={addVideoToPost}
                      />
                      </Tooltip>
                    </div>

                  
                    <Popover
                      aria-labelledby="profile-popover"
                      content={
                        <div className="w-64 ">
                          {emoji.emoji}
                          {emoji && <a href={emoji.getImageUrl()}></a>}
                          {showEmojiPicker && <Picker className="dark:bg-gray-950" height={400} width={300} emojiStyle="twitter" onEmojiClick={(e) => {
                            setInput(input + e.emoji)
                          }}/>}
                        </div>
                      }>
             
                      <EmojiHappyIcon
                        className="hidden md:inline h-14 w-14 md:h-10 md:w-10 rounded-full cursor-pointer p-2 text-sky-500 dark:hover:bg-neutral-700 hover:bg-blue-100"
                        onClick={() => setShowEmojiPicker(true)}
                      />
                   
                    </Popover>
                    
                
                  </div>
                  <div className="flex space-x-1 ml-[50px] md:ml-[70px]">
                    <button className="dark:bg-gray-950 dark:border-gray-900 dark:text-gray-300 border-gray-200 border-[1px]
                    dark:hover:bg-neutral-700 text-lg sm:text-sm bg-slate-200 rounded-full p-2 md:p-1 cursor-pointer" onClick={countyPost}>county</button>
                    <button className="dark:bg-gray-950 dark:border-gray-900 dark:text-gray-300 border-gray-200 border-[1px]
                    dark:hover:bg-neutral-700  text-lg sm:text-sm bg-slate-200 rounded-full p-2 md:p-1 cursor-pointer" onClick={constituencyPost}>constituency</button>
                    <button className="dark:bg-gray-950 dark:border-gray-900 dark:text-gray-300 border-gray-200 border-[1px]
                    dark:hover:bg-neutral-700  text-lg sm:text-sm bg-slate-200 rounded-full p-2 md:p-1 cursor-pointer" onClick={wardPost}>ward</button>
                  </div>
                  <button
                    onClick={sendPost}
                    disabled={!input.trim()}
                    className="bg-blue-400 text-white  text-lg sm:text-sm px-2 md:py-1.5 rounded-full font-bold shadow-md hover:brightness-95
                     disabled:opacity-50"
                  >
                    Cast
                  </button>
                </div>
              )}
            </div>
          
          </div>
        </div>
      )}
    </>
  );
}

