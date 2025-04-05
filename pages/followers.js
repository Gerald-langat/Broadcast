
import { useUser } from '@clerk/nextjs';
import Followers from '../components/Followers/Followers'
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';


function followers() {

  
  return (

    <div>
          <Followers />
    </div>
    
    
  )
}

export default followers
