import { Button, Checkbox, Label, Modal, TextInput, Toast} from "flowbite-react";
import { useState } from "react";
import { auth, db } from '../firebase'
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { HiCheck, HiExclamation, HiFire } from "react-icons/hi";

function Signup() {
  const [openModal, setOpenModal] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter()
  const [showToast, setShowToast] = useState(null);

  function onCloseModal() {
    setOpenModal(false);
    setEmail('');
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log(userCredential);

      const user = userCredential.user;
      const token = await user.getIdToken(); // Fetching token properly

      // Storing user and token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      const userEmail = user.email;
      const userQuery = query(
        collection(db, 'userPosts'), // Assuming your users are stored in a 'users' collection
        where('email', '==', userEmail)
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        // If email exists, redirect to /home
        setShowToast('Login successful, redirecting to Home...');
        router.push('/home');
      } else {
        // If email does not exist, redirect to /form
        setShowToast('Login successful, please complete your profile');
        router.push('/form');
      }
    }  catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setShowToast('Login successful, redirecting to Home...');
        router.push('/home');
        // Optionally, you can redirect to the login page or provide a login option
      } else {
        console.error('Error registering user:', e);
        setShowToast('Password should be at least 6 characters . Please try again.');
        
      }
    } finally{
      onCloseModal();
    }
  };


  return (
    <>
      <Modal show={openModal} size="md" onClose={onCloseModal} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sign in to our platform</h3>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Your email" />
              </div>
              <TextInput
                id="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Your password" />
              </div>
              <TextInput id="password" 
              type="password" 
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <a href="#" className="text-sm text-cyan-700 hover:underline dark:text-cyan-500">
                Lost Password?
              </a>
            </div>
            <div className="w-full">
              <Button type="submit"  onClick={handleSubmit}>Log in to your account</Button>
            </div>
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
              Not registered?&nbsp;
              <a href="#" className="text-cyan-700 hover:underline dark:text-cyan-500">
                Create account
              </a>
            </div>
          </div>
      
        </Modal.Body>
      </Modal>
      {showToast && (
        <div className="w-screen h-screen flex justify-center items-center">
        <Toast className="flex justify-center">
        <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200">
        {showToast === 'the email entered already in use. Please try again.' ? (
          <HiExclamation className="h-5 w-5" />
        ) : (
          <HiCheck className="h-5 w-5" />
        )}
     
      </div>
          <p className="ml-3 text-sm font-normal">{showToast}</p>
        </Toast>
        </div>
      )}
    </>
  );
}
export default Signup
