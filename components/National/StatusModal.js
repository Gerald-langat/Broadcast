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
import { Button, Spinner, Tooltip } from "flowbite-react";
import Picker from 'emoji-picker-react'

export default function StatusModal() {
  
  const [open, setOpen] = useRecoilState(modalStatus);
  const [post, setUserData] = useState(null);
  const [input, setInput] = useState("");
  const filePickerRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("");
  const [selectedVidFile, setSelectedVidFile] = useState(null);
  const videoPickerRef = useRef(null);
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for EmojiPicker
  const [userDetails, setUserDetails] = useState(null);
 

  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      console.log(user)
      setUserDetails(user)

    })
  }
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (userDetails) {
        const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };

    fetchUserData();
  }, [userDetails]);

  const sendStatus = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (post) {
        const docRef = await addDoc(collection(db, "status"), {
          id: userDetails.uid,
          text: input,
          userImg: post.userImg,
          timestamp: serverTimestamp(),
          lastname: post.lastname,
          name: post.name,
          nickname: post.nickname,
          county:post.county,
          constituency:post.constituency,
          ward:post.ward
        });

        const imageRef = ref(storage, `status/${docRef.id}/statusImage`);
        const vidRef = ref(storage, `status/${docRef.id}/statusVideo`);

        if (selectedFile) {
          await uploadString(imageRef, selectedFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(imageRef);
            await updateDoc(doc(db, "status", docRef.id), {
              statusImage: downloadURL,
            });
          });
        } else if (selectedVidFile) {
          let isVideo = false;
          if (selectedVidFile.type) {
            isVideo = selectedVidFile.type.includes("video"); 
          }
          await uploadString(vidRef, selectedVidFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(vidRef);
            await updateDoc(doc(db, "status", docRef.id), {
              statusVideo: downloadURL,
            });
          });
        }
        setOpen(false);
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

  return (
    <div>
      {open && (
        <Modal
          isOpen={open}
          onRequestClose={() => setOpen(false)}
          className="lg:max-w-lg lg:w-[90%] w-[60%] absolute top-24 left-[60%] translate-x-[-80%] bg-white dark:bg-gray-950 rounded-xl shadow-md z-50">
          <div className="p-1">
            <div className="border-b border-gray-600 rounded-md py-2 px-1.5">
          <Tooltip content='close' arrow={false} placement="right" className="p-1 text-xs bg-gray-500">
              <div
                onClick={closeMode}
                className="rounded-full cursor-pointer w-10 h-10 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-neutral-700"
              >
                <XIcon className="h-[23px] text-gray-700 dark:text-gray-100"/>
              </div>
          </Tooltip>

              <h2>Add Status</h2>
            </div>
            <div className="hidden lg:inline absolute lg:-ml-[350px] -mt-[100px]">
            {emoji.emoji}
            {emoji && <a href={emoji.getImageUrl()}></a>}
            {showEmojiPicker && <Picker className="dark:bg-gray-950" height={400} width={300} onEmojiClick={(e) => {
              setInput(input + e.emoji)
              
            }}/>}
            </div>
          
            <div className="p-2 flex items-center space-x-1 relative">
              <span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300" />
              <img
                className="h-11 w-11 rounded-full mr-4"
                src={post?.userImg}
                alt="user-img"
              />
              <h4 className="font-bold text-[15px] sm:text-[16px] hover:underline">
                {post?.name}
              </h4>
              <h4 className="font-bold">
                {post?.lastname}
              </h4>
              <span className="text-sm sm:text-[15px] font-bold">
                @{post?.nickname}
              </span>
              
             
            </div>
            

            <div className="flex  p-3 space-x-3">
              <div className="w-full divide-y divide-gray-600">
                <div className="">
                  <textarea
                    className="w-full border-none focus:ring-0 text-lg dark:bg-gray-950 placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700 dark:text-gray-100 dark:placeholder:text-gray-100"
                    rows="2"
                    placeholder="Post a status..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onClick={() => setShowEmojiPicker(false)}
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                {loading ? (<Button color="gray" className="border-0">
                      <Spinner aria-label="Alternate spinner button example" size="sm" />
                      <span className="pl-3">Loading...</span>
                    </Button>) : (
                      <div>
                      {selectedFile && (
                    <img
                        src={selectedFile}
                        className='h-14'
                        alt="image"
                      />
                    )}
                    {selectedVidFile && (
                    <video autoPlay
                        src={selectedVidFile}
                        className='h-14'
                        alt="image"
                      />
                    )}
                    </div>
                    )}
            
                     
                  <div className="flex">
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
                       <CameraIcon className="h-10 w-10 rounded-full cursor-pointer p-2 text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
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
                    className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                   {loading ? 'Posting...' : 'post'}
                  </button>
                </div>
              
              </div>
            </div>
          </div>
         
        </Modal>
      
      )}
    
    </div>
  );
}
