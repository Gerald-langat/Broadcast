import { useRecoilState } from "recoil";
import { modalState, postIdState } from "../../atoms/modalAtom";
import Modal from "react-modal";
import {
  CameraIcon,
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useEffect, useRef, useState } from "react";
import { db, storage } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import Moment from "react-moment";
import Picker from 'emoji-picker-react'
import { Tooltip } from "flowbite-react";
import { useUser } from "@clerk/nextjs";
import { getDownloadURL, ref, uploadString } from "firebase/storage";

export default function CommentModal() {
  
  const [open, setOpen] = useRecoilState(modalState);
  const [postId] = useRecoilState(postIdState);
  const [input, setInput] = useState("");
  const [userData, setUserData] = useState(null);
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const filePickerRef = useRef(null);
  const [post, setPost] = useState({});
  const { user } = useUser();
    const [selectedFile, setSelectedFile] = useState(null);
      const [selectedVidFile, setSelectedVidFile] = useState(null);
    const VidRef = useRef(null);

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


 useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "national", postId), (snapshot) => {
    setPost(snapshot); // Save the snapshot object
  });

  return () => unsubscribe(); // Cleanup listener on unmount
}, [postId, db]);

  async function sendComment() {
    if (!loading) {
      setLoading(true);
    }
   const docRef = await addDoc(collection(db, "national", postId, "comments"), {
      comment: input,
      userImg: userData.userImg || "",
      imageUrl:userData.imageUrl,
      name: userData.name,
      nickname:userData.nickname,
      timestamp: serverTimestamp(),
      uid: user?.id,
    });

   const imgRef = ref(storage, `national/${docRef.id}/images`);
       if (selectedFile) {
          await uploadString(imgRef, selectedFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(imgRef);
            await updateDoc(doc(db, "national", postId, "comments", docRef.id), {
              images: downloadURL,
            });
          });
        }
        
        const vidRef = ref(storage, `national/${docRef.id}/videos`);
       if (selectedVidFile) {
          await uploadString(vidRef, selectedVidFile, "data_url").then(async () => {
            const downloadURL = await getDownloadURL(vidRef);
            await updateDoc(doc(db, "national", postId, "comments", docRef.id), {
              videos: downloadURL,
            });
          });
        }
    setLoading(false);
    setOpen(false);
    setInput("");
    setSelectedFile(null);
    setSelectedVidFile(null);
  }

  const closeMode = () => {
    setOpen(false);
    setShowEmojiPicker(false);
    setInput("");
  }

  
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

  return (
    <div>
      {open && (
        <Modal
          isOpen={open}
          onRequestClose={() => setOpen(false)}
          className="max-w-lg w-[90%]  absolute top-24  left-[50%] translate-x-[-50%] dark:bg-gray-950 bg-gray-200 rounded-md shadow-md border-none"
        >
          <div className="p-1 dark:bg-gray-950 rounded-md">
            <div className="border-b dark:border-gray-900 py-2 px-1.5">
              <div
                onClick={closeMode}
                className="hover:bg-blue-100 w-10 h-10 rounded-full dark:hover:bg-gray-900 flex items-center justify-center"
              >
              <Tooltip content='close' arrow={false} placement="right" className="p-1 text-xs bg-gray-500 ml-1">
                <XIcon className="h-8 text-gray-700 p-0 cursor-pointer dark:text-gray-100" />
              </Tooltip>
              </div>
            </div>
            <div className="p-2 flex items-center space-x-1 relative ">
            {post?.data()?.userImg ? (
              <img
                className="sm:h-10 h-16 sm:w-10 w-16 rounded-md mr-1"
                src={post?.data()?.userImg}
                alt="user-img"
              />
            ):(
              <img
                className="sm:h-10 h-16 sm:w-10 w-16 rounded-md mr-1"
                src={post?.data()?.imageUrl}
                alt="user-img"
              />
            )}
              
              <h4 className="font-bold max-w-20 truncate">
                {post?.data()?.name}
              </h4>
              <h4 className="font-bold max-w-20 truncate">
                {post?.data()?.lastname}
              </h4>
              <span className=" font-bold max-w-20 truncate">
                @{post?.data()?.nickname} -{" "}
              </span>
              <span className=" max-w-20  text-sm">
                <Moment fromNow>{post?.data()?.timestamp?.toDate()}</Moment>
              </span>
            </div>
            <p className="text-gray-900 ml-16 mb-2 dark:text-gray-100 line-clamp-3 break-words">
              {post?.data()?.text}
            </p>

            <div className="flex  p-3 space-x-3">
              
              <div className="w-full divide-y dark:divide-gray-900">
                <div className="">
                  <textarea
                    className="w-full bg-gray-200 dark:bg-gray-950 dark:placeholder:text-gray-200 dark:text-gray-100 border-none focus:ring-0 text-xl sm:text-lg dark:placeholder-gray-500 placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700"
                    rows="2"
                    placeholder="Post your reply..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onClick={() => setShowEmojiPicker(false)}
                  ></textarea>
                </div>



                <div className="flex items-center justify-between pt-2.5">
                  <div className="flex">
                    <div
                      onClick={() => filePickerRef.current.click()}
                    >
                    <Tooltip content='media' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                    <PhotographIcon className=" h-10 w-10 rounded-full p-2 cursor-pointer text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
                     <input
                        type="file"
                        hidden
                        accept="image/*"
                        ref={filePickerRef}
                        onChange={addImageToPost}
                      />
                  </Tooltip>
                    </div>
                    <div
                      onClick={() => VidRef.current.click()}
                    >
                    <Tooltip content='video' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                    <CameraIcon className=" h-10 w-10 rounded-full p-2 cursor-pointer text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
                     <input
                        type="file"
                        hidden
                        accept="video/*"
                        ref={VidRef}
                        onChange={addVideoToPost}
                      />
                  </Tooltip>
                    </div>
                    <Tooltip content='emoji' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                    <EmojiHappyIcon className="hidden md:inline h-10 w-10 rounded-full p-2 cursor-pointer text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" onClick={() => setShowEmojiPicker(!showEmojiPicker)}/>
                  </Tooltip>
                  
                  </div>
                  <button
                    onClick={sendComment}
                    disabled={!input.trim()}
                    className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                   {loading ? <p className="animate-pulse items-center">.....</p> : <p className="text-lg sm:text-sm">Reply</p>}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute lg:-ml-[320px] -mt-[310px] md:ml-[300px]">
          {emoji.emoji}
          {emoji && <a href={emoji.getImageUrl()}></a>}
          {showEmojiPicker && <Picker className="dark:bg-neutral-800"   height={400} width={300} emojiStyle="twitter"  onEmojiClick={(e) => {
            setInput(input + e.emoji)
          }}/>}
          </div>
          {selectedFile && (
                  <div className="border-none">
                    <XIcon
                      onClick={() => setSelectedFile(null)}
                      className="border h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full"
                    />
                    <img
                      src={selectedFile}
                      className={`${loading && "animate-pulse"} h-[100px] w-[200px] object-cover rounded-bl-md`}
                      alt={`image`}
                    />
                  </div>
                )}
                {selectedVidFile && (
                  <div className="border-none">
                    <XIcon
                      onClick={() => setSelectedVidFile(null)}
                      className="border h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full"
                    />
                    <video
                    autoPlay
                    muted
                    controls
                      src={selectedVidFile}
                      className={`${loading && "animate-pulse"} h-[100px] w-[200px] object-cover rounded-bl-md`}
                      alt={`video`}
                    />
                  </div>
                )}
              
        </Modal>
      )}
    </div>
  );
}
