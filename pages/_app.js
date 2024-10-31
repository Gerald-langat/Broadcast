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
