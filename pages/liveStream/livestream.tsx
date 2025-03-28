"use client"
import {
    StreamVideoClient,
    StreamVideo,
    User,
    StreamCall,
    useCallStateHooks,
    ParticipantView,
  } from "@stream-io/video-react-sdk";
  
  const apiKey = "mmhfdzb5evj2";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL0FuYWtpbl9Tb2xvIiwidXNlcl9pZCI6IkFuYWtpbl9Tb2xvIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NDA2NTkxNjMsImV4cCI6MTc0MTI2Mzk2M30.EJw2dcOCvfbJeqwGxUoMs8X9BQThbGLPPZeGCLCd0Xs";
const userId = "Anakin_Solo";
const callId = "DDElJQ0v6lpl";

const user: User = { id: userId, name: "live" };
const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call("livestream", callId);
call.join({ create: true });
  
  export default function LiveStream() {
    return (
      <StreamVideo client={client}>
        <StreamCall call={call}>
          <LivestreamView />
        </StreamCall>
      </StreamVideo>
    );
  }

const LivestreamView = () => {
  const {
    useCameraState,
    useMicrophoneState,
    useParticipantCount,
    useIsCallLive,
    useParticipants,
  } = useCallStateHooks();

  const { camera: cam, isEnabled: isCamEnabled } = useCameraState();
  const { microphone: mic, isEnabled: isMicEnabled } = useMicrophoneState();

  const participantCount = useParticipantCount();
  const isLive = useIsCallLive();

  const [firstParticipant] = useParticipants();

  return (
    <div className="w-80 h-80">
      <div>{isLive && `Live: ${participantCount}`}</div>
      {firstParticipant ? (
        <ParticipantView participant={firstParticipant} />
      ) : (
        <div>The host hasn't joined yet</div>
      )}
      <div className="-mt-9">
        <button onClick={() => (isLive ? call.stopLive() : call.goLive())}>
          {isLive ? "Stop Live" : "Go Live"}
        </button>
        <button onClick={() => cam.toggle()}>
          {isCamEnabled ? "Disable camera" : "Enable camera"}
        </button>
        <button onClick={() => mic.toggle()}>
          {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>
      </div>
    </div>
  );
};