import '../styles/globals.css';
import { ThemeProvider } from "next-themes";
import { RecoilRoot } from "recoil";
import { FollowProvider } from '../components/FollowContext';


export default function App({
  Component,
  pageProps: { ...pageProps },
}) {
  return (
    
        <ThemeProvider enableSystem={true} attribute='class'>
          <RecoilRoot>
            <FollowProvider>
              <Component {...pageProps}/>
              </FollowProvider>
            </RecoilRoot>
        </ThemeProvider>
     
  );
}

//     useCameraState,
//     useMicrophoneState,
//     useParticipantCount,
//     useIsCallLive,
//     useParticipants,
//   } = useCallStateHooks();

//   const { camera: cam, isEnabled: isCamEnabled } = useCameraState();
//   const { microphone: mic, isEnabled: isMicEnabled } = useMicrophoneState();

//   const participantCount = useParticipantCount();
//   const isLive = useIsCallLive();

//   const [firstParticipant] = useParticipants();

//   return (
//     <div className="w-80 h-80">
//       <div>{isLive ? `Live: ${participantCount}` : `In Backstage`}</div>
//       {firstParticipant ? (
//         <ParticipantView participant={firstParticipant} />
//       ) : (
//         <div>The host hasn't joined yet</div>
//       )}
//       <div style={{ display: "flex", gap: "4px" }}>
//         <button onClick={() => (isLive ? call.stopLive() : call.goLive())}>
//           {isLive ? "Stop Live" : "Go Live"}
//         </button>
//         <button onClick={() => cam.toggle()}>
//           {isCamEnabled ? "Disable camera" : "Enable camera"}
//         </button>
//         <button onClick={() => mic.toggle()}>
//           {isMicEnabled ? "Mute Mic" : "Unmute Mic"}
//         </button>
//       </div>
//     </div>
//   );
// };
