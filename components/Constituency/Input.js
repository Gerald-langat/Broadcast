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
import { db, storage } from "../../firebase";
import Picker from 'emoji-picker-react'// Import your EmojiPicker component
import { Popover, Spinner, Tooltip } from "flowbite-react";
import { useUser } from "@clerk/nextjs";

export default function Input() {

  const [input, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const filePickerRef = useRef(null);
  const videoPickerRef = useRef(null);
  const [error, setError] = useState('');
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
const { user } = useUser()
 
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

  const sendPost = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (userData) {
        const collectionName = userData?.constituency;
        
        const docRef = await addDoc(collection(db, "constituency", collectionName, "posts"), {
          uid: user?.id,
          text: input,
          userImg: userData.userImg,
          timestamp: serverTimestamp(),
          lastname: userData.lastname,
          name: userData.name,
          nickname: userData.nickname,
          constituency:userData.constituency,
          category:userData.category,
          views: []
        });


        const imageUploadPromises = [];
        const imageUrls = [];
        if (selectedFiles.length > 0) {
          selectedFiles.forEach((file, index) => {
            const imageRef = ref(storage, `constituency/${docRef.id}/image-${index}`);
  
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
          await updateDoc(doc(db, "constituency", collectionName, "posts", docRef.id), {
            images: imageUrls,
          });
        }

        const vidRef = ref(storage, `constituency/${docRef.id}/constituencyVideo`);
        if (selectedVidFile) {
          let isVideo = false;
          if (selectedVidFile.type) {
            isVideo = selectedVidFile.type.includes("video"); 
          }
          await uploadString(vidRef, selectedVidFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(vidRef);
            await updateDoc(doc(db, "constituency",collectionName, "posts", docRef.id), {
              video: downloadURL,
            });
          });
        }

        setInput("");
        setSelectedFiles([]);
        setSelectedVidFile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Error adding document: " + error.message);
      setLoading(false);
    }
    setShowEmojiPicker(false);
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

  const addVideoToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setSelectedVidFile(readerEvent.target.result);
    };
  };


  return (
    <>
      {userData && (
        <div className="flex border-[1px] bg-white dark:bg-gray-950 border-gray-200 p-3 space-x-3 z-10 top-0 sticky-top dark:border-gray-900 rounded-md mt-1">
          <img
            src={userData?.userImg}
            alt="user-img"
            className="h-11 w-11 rounded-md cursor-pointer hover:brightness-95"
          />
          <div className="w-full divide-y divide-gray-200 dark:divide-gray-900">
            <div className="" >
              <textarea
                className="w-full border-none focus:ring-0 text-lg dark:bg-gray-950 dark:text-gray-300
                 placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700 dark:placeholder:text-gray-300"
                rows="2"
                placeholder="type here...."
                value={input}
                onChange={(e) => setInput(e.target.value)} onClick={() => setShowEmojiPicker(false)}>
              </textarea>
            </div>

{loading ? (
        <div  className="border-0 items-center flex mt-4 sm:mt-0">
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
                  className={`${loading && "animate-pulse"} h-[200px] w-[300px] object-cover`}
                />
              </div>
            )}
            
            {selectedFiles.length > 0 && (
              <div className="flex gap-2 flex-wrap ">
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
</>
      )}

            <div className="flex items-center justify-between pt-2.5">
              {!loading && (
                <>
                  <div className="flex">
                    <div onClick={() => filePickerRef.current.click()}>
                    <Tooltip content='image' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                      <PhotographIcon className="h-10 w-10 rounded-full dark:hover:bg-neutral-700 cursor-pointer p-2 text-sky-500 hover:bg-sky-100" />
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
                      <CameraIcon className="h-10 w-10 rounded-full dark:hover:bg-neutral-700 cursor-pointer p-2 text-sky-500 hover:bg-sky-100" />
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
                  <button
                    onClick={sendPost}
                    disabled={!input.trim()}
                    className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                    Cast
                  </button>
                </>
              )}
            </div>
          
          </div>
        </div>
      )}
    </>
  );
}
