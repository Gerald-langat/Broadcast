import { useRecoilState } from "recoil";
import { modalStatus } from "../../atoms/modalAtom";
import Modal from "react-modal";
import {
  CameraIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useEffect, useRef, useState } from "react";
import { auth, db, storage } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { Spinner, Tooltip } from "flowbite-react";
import Picker from 'emoji-picker-react'
import { useUser } from "@clerk/nextjs";

export default function StatusModal() {
  
  const [open, setOpen] = useRecoilState(modalStatus);
  const [userData, setUserData] = useState(null);
  const [input, setInput] = useState("");
  const filePickerRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const videoPickerRef = useRef(null);
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for EmojiPicker
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

  const sendStatus = async () => {
    if (loading || !user?.id) return;
    setLoading(true);

    try {
      if (userData) {
        const docRef = await addDoc(collection(db, 'status'), {
          uid: user?.id,
          text: input,
          userImg: userData.userImg || "",
          imageUrl: userData.imageUrl,
          timestamp: serverTimestamp(),
          lastname: userData.lastname,
          name: userData.name,
          nickname: userData.nickname,
          category:userData.category,
          views: []
        });

        const imageRef = ref(storage, `status/${docRef.id}/Images`);
    if (selectedFile) {
      await uploadString(imageRef, selectedFile, 'data_url').then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, 'status', docRef.id), {
          images: downloadURL,
        });
      });
    }

        const vidRef = ref(storage, `status/${docRef.id}/Videos`);
       if (selectedVidFile) {
          await uploadString(vidRef, selectedVidFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(vidRef);
            await updateDoc(doc(db,'status', docRef.id), {
              videos: downloadURL,
            });
          });
        }

       
        setInput("");
        setSelectedFile(null);
        setSelectedVidFile(null);
        setLoading(false);

      }
    } catch (error) {
      console.error("Error adding document: ", error);
      setError("Error adding document: " + error.message);
      setLoading(false);
    }
    setShowEmojiPicker(false);
    setOpen(false);
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

  const closeMode = () =>{
    setOpen(false);
    setShowEmojiPicker(false);
    setInput("");
  }

  
  const removeSelectedFile = () => {
    setSelectedFile(null);
  };
  

  return (
    <div>
      {open && (
        <Modal
          isOpen={open}
          onRequestClose={() => setOpen(false)}
          className="lg:max-w-lg lg:w-[90%] w-[90%] absolute sm:left-[60%] left-[77%] max-h-[60%] top-24 translate-x-[-80%] bg-white dark:bg-gray-950 rounded-xl shadow-md ">
          <div className="p-1">
            <div className="border-b border-gray-600 rounded-md py-2 px-1.5">
          <Tooltip content='close' arrow={false} placement="right" className="p-1 text-xs bg-gray-500">
              <div
                onClick={closeMode}
                className="rounded-full cursor-pointer w-10 h-10 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-neutral-700"
              >
                <XIcon className="sm:h-[23px] h-6 text-gray-700 dark:text-gray-100"/>
              </div>
          </Tooltip>

              <h2 className='text-lg '>Add Status</h2>
            </div>
            <div className="hidden lg:inline absolute lg:-ml-[350px] -mt-[100px]">
            {emoji.emoji}
            {emoji && <a href={emoji.getImageUrl()}></a>}
            {showEmojiPicker && <Picker className="dark:bg-gray-950" height={400} width={300} onEmojiClick={(e) => {
              setInput(input + e.emoji)
              
            }}/>}
            </div>
          
            <div className="p-2 flex items-center space-x-1 relative text-lg">
              <span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300" />
              {userData?.userImg ? (
                <img
                className="sm:h-11 sm:w-11 h-16 w-16 rounded-md mr-4"
                src={userData?.userImg}
                alt="user-img"
              />
              ):(
                <img
                className="sm:h-11 sm:w-11 h-16 w-16 rounded-md mr-4"
                src={userData?.imageUrl}
                alt="user-img"
              />
              )}
              
              <h4 className="font-bold hover:underline">
                {userData?.name}
              </h4>
              <h4 className="font-bold">
                {userData?.lastname}
              </h4>
              <span className=" font-bold">
                @{userData?.nickname}
              </span>
              
             
            </div>
            

            <div className="flex  p-3 space-x-3">
              <div className="w-full divide-y divide-gray-600">
                <div className="">
                  <textarea
                    className="w-full text-2xl sm:text-lg border-none focus:ring-0 dark:bg-gray-950 placeholder-gray-700 tracking-wide 
                    min-h-[50px] text-gray-700 dark:text-gray-100 dark:placeholder:text-gray-100 placeholder:text-lg "
                    rows="2"
                    placeholder="Post a status..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onClick={() => setShowEmojiPicker(false)}
                  >
                  </textarea>
                </div>

                <div className="flex flex-col-reverse  items-center pt-2.5">
                <div className='w-full flex-wrap gap-2 mt-2'>
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
                  className="h-7 text-gray-900 dark:text-gray-200 absolute cursor-pointer shadow-md ml-28 rounded-full"
                />
                <video
                  autoPlay
                  src={selectedVidFile}
                  controls
                  className={`${loading && "animate-pulse"} h-[60px] w-[100px] object-cover` }
                />
              </div>
            )}
              <div className="flex gap-2 flex-wrap border-none">
                {selectedFile && (
                  <div className="border-none">
                    <XIcon
                      onClick={() => removeSelectedFile(index)}
                      className="h-12 sm:h-7 dark:text-red-900 text-black absolute cursor-pointer shadow-md ml-28 rounded-full"
                    />
                    <img
                      src={selectedFile}
                      className={`${loading && "animate-pulse"} h-32 w-40 sm:h-[60px] sm:w-[100px] object-cover`}
                      alt=''
                    />
                  </div>
                )}
              </div>
              </>
            )}
            </div>
                     
                  <div className="flex justify-between w-full">
<div className='flex'>
                  <Tooltip content='image' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                    <div
                      className=""
                      onClick={() => filePickerRef.current.click()}
                    >
                      <PhotographIcon className="h-10 w-10 rounded-full cursor-pointer p-2 text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={filePickerRef}
                        onChange={addImageToPost}
                      />
                      </div>
                    </Tooltip>
          <Tooltip content='video' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                      <div
                      className=""
                      onClick={() => videoPickerRef.current.click()}
                    >
                       <CameraIcon className="h-10 w-10  rounded-full cursor-pointer p-2 text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        ref={videoPickerRef}
                        onChange={addVideoToPost}
                      />
                    </div>
                    </Tooltip>
          <Tooltip content='emoji' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                    <EmojiHappyIcon className="hidden md:inline h-10 w-10 cursor-pointer rounded-full p-2 text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700"  onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
                  </Tooltip>
</div>
                  <button
                    onClick={sendStatus}
                    disabled={!input.trim()}
                    className="bg-blue-400 text-2xl sm:text-lg text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                   {loading ? 'Posting...' : 'post'}
                  </button>
                  </div>
                  
                  
                </div>
              
              </div>
            </div>
          </div>
         
        </Modal>
      
      )}
    
    </div>
  );
}
