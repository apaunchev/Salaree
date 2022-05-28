import { useRouter } from 'next/router';
import '../styles/global.css';

const App = ({ Component, pageProps }) => {
  const router = useRouter();

  // Set key on route change to force React to remount and reset state.
  return <Component key={router.asPath} {...pageProps} />;
};

export default App;
