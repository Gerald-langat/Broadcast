import { useRecoilState } from "recoil";
import { modalCountyState,  postIdCounty } from "../../atoms/modalAtom";
import Modal from "react-modal";
import {
  EmojiHappyIcon,
  XIcon,
} from "@heroicons/react/outline";
import { useEffect,  useState } from "react";
import { db } from "../../firebase";
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
import { Popover, Tooltip } from "flowbite-react";
import { useUser } from "@clerk/nextjs";

export default function CommentModal() {
  
  const [open, setOpen] = useRecoilState(modalCountyState);
  const [postId] = useRecoilState(postIdCounty);
  const [post, setPost] = useState({});
  const [input, setInput] = useState("");
  const [userData, setUserData] = useState({});
  const [emoji, setEmoji] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
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

  useEffect(() => {
    if  (userData && userData.county && postId){
    onSnapshot(doc(db, "county", userData.county, "posts", postId), (snapshot) => {
      setPost(snapshot);
    });
  }
  }, [postId, userData, db]);


  async function sendComment() {
    if (!loading) {
      setLoading(true);
    }
    await addDoc(collection(db, "county",  postId, "comments"), {
      comment: input,
      userImg: userData.userImg,
      name: userData.name,
      nickname:userData.nickname,
      timestamp: serverTimestamp(),
      uid: user?.id,
    });
    
  
      setLoading(false);
      setOpen(false);
      setInput("");
      setSelectedFile(null);  
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
          className="max-w-lg w-[90%]  absolute top-24 left-[50%] translate-x-[-50%] bg-white dark:bg-gray-950 rounded-xl shadow-md"
        >
          <div className="p-1">
            <div className="border-b border-gray-600 py-2 px-1.5">
          <Tooltip content='close' arrow={false} placement="right" className="p-1 text-xs bg-gray-500">
              <div
                onClick={closeMode}
                className=" w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full cursor-pointer"
              >
                <XIcon className="h-[23px] text-gray-700 p-0 dark:text-gray-100" />
              </div>
          </Tooltip>
            </div>
            <div className="p-2 flex items-center space-x-1 relative">
              <span className="w-0.5 h-full z-[-1] absolute left-8 top-11 bg-gray-300" />
              {post?.data()?.userImg ? (
                <img
                className="h-11 w-11 rounded-full mr-4"
                src={post?.data()?.userImg}
                alt="user-img"
              />
              ):(
                <img
                className="h-11 w-11 rounded-full mr-4"
                src={post?.data()?.imageUrl}
                alt="user-img"
              />
              )}
              
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
            <p className="text-gray-500 text-[15px] sm:text-[16px] ml-16 mb-2 dark:text-gray-100">
              {post?.data()?.text}
            </p>

            <div className="flex  p-3 space-x-3">
              <div className="w-full divide-y divide-gray-600">
                <div className="">
                  <textarea
                    className="w-full border-none focus:ring-0 text-lg placeholder-gray-700 tracking-wide min-h-[50px] text-gray-700 dark:placeholder:text-gray-100 dark:text-gray-100 dark:bg-gray-950"
                    rows="2"
                    placeholder="Post your reply..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onClick={() => setShowEmojiPicker(false)}
                  ></textarea>
                </div>

                <div className="flex items-center justify-between pt-2.5">
                  <div>
                    
                    <Popover
                      aria-labelledby="profile-popover"
                       placement="left"
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
                    {selectedFile && (
                    <div className="relative">
                      <XIcon
                        onClick={() => setSelectedFile(null)}
                        className="border h-7 text-black absolute cursor-pointer shadow-md border-white m-1 rounded-full"
                      />
                      <img
                        src={selectedFile}
                        controls
                        className={`${loading && "animate-pulse"} h-[200px] w-[300px] object-cover` }
                      />
                    </div>
                  )}
                  </div>
                  <button
                    onClick={sendComment}
                    disabled={!input.trim()}
                    className="bg-blue-400 text-white px-4 py-1.5 rounded-full font-bold shadow-md hover:brightness-95 disabled:opacity-50"
                  >
                   {loading ? <p>Replying...</p> : <p>Reply</p> }
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
