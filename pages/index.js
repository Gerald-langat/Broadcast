import { Toast } from "flowbite-react";
import { auth, db } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/router";
import { collection, getDocs, query, where } from "firebase/firestore";



function signInWithGoogle() {
  const router = useRouter();
  
  function googleLogin(){
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async(result)=>{
      console.log(result)
 
      if (result.user) {
        const userEmail = result.user.email;
        const userQuery = query(
          collection(db, 'userPosts'), // Assuming your users are stored in a 'users' collection
          where('email', '==', userEmail)
        );
        const querySnapshot = await getDocs(userQuery);

        if (!querySnapshot.empty) {
          // If email exists, redirect to /home
          <div className="flex justify-center items-center w-full h-screen">
            <Toast>
              <p>Login successful, redirecting to Home...</p>
            </Toast>
          </div>
          ;
          router.push('/home');
        } else {
          // If email does not exist, redirect to /form
          <div className="flex justify-center items-center w-screen h-screen">
            <Toast>
              <p>Login successful, please complete your profile</p>
            </Toast>
          </div>
          ;
          router.push('/form');
        }
      }
    })
  }


  return (
      <div className="sm:flex justify-center mt-20 sm:space-x-4">
          <img
            src="../images/poli2.jpg"
            alt=""
            className="sm:h-20 object-cover md:w-44 md:h-80 rotate-6 md:inline-flex rounded-md ml-14"
          />
          <div className="space-y-4 mt-24">
          <p onClick={googleLogin} className="bg-red-400 rounded-lg p-3 text-white hover:bg-red-500 cursor-pointer">Sign with Google</p>
          <p onClick={() => router.replace('/signup')} className="cursor-pointer bg-red-400 rounded-lg p-3 text-white hover:bg-red-500">Sign With Email</p>
          </div>
      </div>
    )
}

export default  signInWithGoogle;