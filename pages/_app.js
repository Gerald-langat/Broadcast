import '../styles/globals.css';
import { ThemeProvider } from "next-themes";
import { RecoilRoot } from "recoil";
import { FollowProvider } from '../components/FollowContext';
import { ClerkProvider } from '@clerk/nextjs';



export default function App({
  Component,
  pageProps: { ...pageProps },
}) {
  return (
<ClerkProvider>
        <ThemeProvider enableSystem={true} attribute='class'>
          <RecoilRoot>
            <FollowProvider>
              <Component {...pageProps}/>
              </FollowProvider>
            </RecoilRoot>
        </ThemeProvider>
    </ClerkProvider>
  );
}
