import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import '@stream-io/video-react-sdk/dist/css/styles.css';
import { auth, db } from "../firebase";
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';

const apiKey = 'mmhfdzb5evj2';
const callId = 'tCzNrcnRwoYL';

export default function App() {
  const [userName, setUserName] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [userData, setUserData] = useState(null);
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);

  // Fetch authenticated user details
  const fetchUserData = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        console.log(user);
        setUserDetails(user);
      }
    });
  };

  // Fetch user data from Firestore
  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserDataFromFirestore = async () => {
      if (userDetails) {
        const q = query(collection(db, 'userPosts'), where('id', '==', userDetails.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0].data();
          setUserData(userDoc);
          setUserName(userDoc.name); // Set userName after userData is fetched
        }
      }
    };
    fetchUserDataFromFirestore();
  }, [userDetails]);

  // Initialize StreamVideoClient after userData is fetched
  useEffect(() => {
    if (userDetails && userData && userName) {
      const user = {
        id: userDetails.uid, // Use Firebase UID for user id
        name: userName, // Use the fetched user name
        image: '../../images/Brod.png',
      };

      const token = 'your_new_token_generated_based_on_user_id'; // Ensure this token matches userDetails.uid

      const clientInstance = new StreamVideoClient({ apiKey, user, token });
      const callInstance = clientInstance.call('default', callId);

      callInstance.join({ create: true });

      setClient(clientInstance);
      setCall(callInstance);
    }
  }, [userDetails, userData, userName]);

  return (
    client && call ? (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <MyUILayout />
        </StreamCall>
      </StreamVideo>
    ) : (
      <div className="flex justify-center items-center w-full h-screen">
        <img src="../../images/Brod.png" alt="Loading" />
      </div>
    )
  );
}

export const MyUILayout = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <img src="../../images/Brod.png" alt="Joining" />
      </div>
    );
  }

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};
