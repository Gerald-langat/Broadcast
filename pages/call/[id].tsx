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

import { useRouter } from 'next/router';
import { useEffect, useState, useMemo } from 'react';
import { auth, db } from '../../firebase';
import { query, where, getDocs, collection } from 'firebase/firestore';

const apiKey = 'mmhfdzb5evj2';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL1NlbmF0b3JfQmFpbF9PcmdhbmEiLCJ1c2VyX2lkIjoiU2VuYXRvcl9CYWlsX09yZ2FuYSIsInZhbGlkaXR5X2luX3NlY29uZHMiOjYwNDgwMCwiaWF0IjoxNzMzMzEwMzc2LCJleHAiOjE3MzM5MTUxNzZ9.7L_TUvEW3ZHLvlkLQBnAvjsiivtscO_edevEL8u5FZQ';
const userId = 'Senator_Bail_Organa';


export default function App() {
  const router = useRouter();
  const { id } = router.query; // Call ID from URL
  const [userDetails, setUserDetails] = useState(null);
  const [follower, setFollower] = useState(null);
  const [userData, setUserData] = useState(null);

  // Fetch logged-in user details
  useEffect(() => {
    const fetchUserDetails = () => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUserDetails(user);
        } else {
          console.error('User not logged in.');
        }
      });
    };
    fetchUserDetails();
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

  // Fetch specific follower
  useEffect(() => {
    if (!id || !userDetails?.uid) return;

    const fetchFollower = async () => {
      try {
        const q = query(
          collection(db, 'following'),
          where('followingId', '==', id), // Match URL follower ID
          where('followerId', '==', userDetails.uid) // Match current user
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setFollower(querySnapshot.docs[0].data());
        } else {
          console.error('No matching follower found.');
        }
      } catch (error) {
        console.error('Error fetching follower:', error);
      }
    };

    fetchFollower();
  }, [id, userDetails]);

  // Memoize client to avoid reinitializing on each render
  const client = useMemo(() => {
    if (userData) {
      const user = {
        id: userId,
        name: userData.name || 'Unknown',
      };
      return new StreamVideoClient({ apiKey, user, token });
    }
  }, [userData]);

  // Memoize call instance
  const call = useMemo(() => {
    if (client && id) {
      return client.call('default', id); // Use `id` from URL as call ID
    }
  }, [client, id]);

  // Join the call
  useEffect(() => {
    if (call) {
      call.join({ create: true }).catch((error) => {
        console.error('Failed to join call:', error);
      });
    }
  }, [call]);

  if (!id) {
    return <div className="min-w-screen min-h-screen flex justify-center items-center">Invalid call ID. Please check the URL.</div>;
  }

  if (!userDetails) {
    return <div className="min-w-screen min-h-screen flex justify-center items-center">Loading user details...</div>;
  }

  if (!follower) {
    return <div className="min-w-screen min-h-screen flex justify-center items-center">Loading follower details...</div>;
  }

  if (!client || !call) {
    return <div className="min-w-screen min-h-screen flex justify-center items-center">Initializing call...</div>;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <MyUILayout />
      </StreamCall>
    </StreamVideo>
  );
}

export const MyUILayout = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) {
    return <div className="min-w-screen min-h-screen flex justify-center items-center">Connecting to call...</div>;
  } else 
  <div>ggge</div>

  return (
    <StreamTheme>
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls />
    </StreamTheme>
  );
};
