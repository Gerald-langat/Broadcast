import { useRecoilState } from "recoil";
import { modalState, postIdState } from "../../atoms/modalAtom";
import Modal from "react-modal";
import {
  EmojiHappyIcon,
  PhotographIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import Moment from "react-moment";
import Picker from 'emoji-picker-react'
import { Tooltip } from "flowbite-react";

export default function CommentModal() {
  
  const [open, setOpen] = useRecoilState(modalState);
  const [postId] = useRecoilState(postIdState);
  const [post, setPost] = useState(null);
  const [input, setInput] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [userData, setUserData] = useState(null);
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);

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
        console.log(userDetails.uid)
        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };

    fetchUserData();
  }, [userDetails]);


 useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, "posts", postId), (snapshot) => {
    setPost(snapshot); // Save the snapshot object
  });

  return () => unsubscribe(); // Cleanup listener on unmount
}, [postId, db]);

  async function sendComment() {
    if (!loading) {
      setLoading(true);
    }
    await addDoc(collection(db, "posts", postId, "comments"), {
      comment: input,
      userImg: userData.userImg,
      name: userData.name,
      nickname:userData.nickname,
      timestamp: serverTimestamp(),
      userId: userDetails.uid,
    });

    setLoading(false);
    setOpen(false);
    setInput("");
  }

  const closeMode = () => {
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
          className="max-w-lg w-[90%]  absolute top-24 left-[50%] translate-x-[-50%] bg-white rounded-md shadow-md"
        >
          <div className="p-1 dark:bg-gray-950 rounded-md">
            <div className="border-b border-gray-900 py-2 px-1.5">
              <div
                onClick={closeMode}
                className="hover:bg-blue-100 w-10 h-10 rounded-full dark:hover:bg-gray-900 flex items-center justify-center"
              >
              <Tooltip content='close' arrow={false} placement="right" className="p-1 text-xs bg-gray-500 ml-1">
                <XIcon className="h-[23px] text-gray-700 p-0 cursor-pointer dark:text-gray-100" />
              </Tooltip>
              </div>
            </div>
            <div className="p-2 flex items-center space-x-1 relative">
              <span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300" />
              <img
                className="h-11 w-11 rounded-full mr-4"
                src={post?.data()?.userImg}
                alt="user-img"
              />
              <h4 className="font-bold text-[15px] sm:text-[16px] hover:underline">
                {post?.data()?.name}
              </h4>
              <h4 className="font-bold">
                {post?.data()?.lastname}
              </h4>
              <span className="text-sm sm:text-[15px] font-bold">
                @{post?.data()?.nickname} -{" "}
              </span>
              <span className="text-sm sm:text-[15px] hover:underline">
                <Moment fromNow>{post?.data()?.timestamp?.toDate()}</Moment>
              </span>
            </div>
            <p className="text-gray-500 text-[15px] sm:text-[16px] ml-16 mb-2 dark:text-gray-100 ">
              {post?.data()?.text}
            </p>

            <div className="flex  p-3 space-x-3">
              
              <div className="w-full divide-y divide-gray-900">
                <div className="">
                  <textarea
                    className="w-full dark:bg-gray-950 dark:placeholder:text-gray-200 dark:text-gray-100 border-none focus:ring-0 text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700"
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
                      className=""
                      // onClick={() => filePickerRef.current.click()}
                    >
                    <Tooltip content='image' arrow={false} placement="bottom" className="p-1 text-xs bg-gray-500 -mt-1">
                      <PhotographIcon className="h-10 w-10 rounded-full cursor-pointer p-2 text-sky-500 hover:bg-sky-100 dark:hover:bg-neutral-700" />
                      {/* <input
                        type="file"
                        hidden
                        ref={filePickerRef}
                        onChange={addImageToPost}
                      /> */}
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
                   {loading ? <p>Replying...</p> : <p>Reply</p>}
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
        </Modal>
      )}
    </div>
  );
}
