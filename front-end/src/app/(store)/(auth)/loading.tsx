 
import Loader from '@/components/ui/Loader';
import { NextPage } from 'next';
 
const AuthLoaderPage: NextPage = () => {
  return <Loader loaderText='Please wait..'/>;
};

export default AuthLoaderPage;
