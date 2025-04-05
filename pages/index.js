import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { addDoc, collection, doc, getDocs, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import countyData from '../county.json';
import { Cursor, useTypewriter } from 'react-simple-typewriter';
import { Alert, Button,  Modal, Popover, Tooltip } from 'flowbite-react';
import {  db, storage } from '../firebase';
import Head from 'next/head';
import BackgroundCircles from '../components/BackgroundCircles';
import { ChevronDownIcon } from '@heroicons/react/outline';
import { useUser } from '@clerk/nextjs';

function Form() {
  const [isOpen, setIsOpen] = useState(false);
  const [wardDropdownOpen, setWardDropdownOpen] = useState(false);
  const [constituencyDropdownOpen, setConstituencyDropdownOpen] = useState(false);
  const router = useRouter();
  const filePickerRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCounty, setSelectedCounty] = useState('Select County');
  const [selectedConstituency, setSelectedConstituency] = useState('Select Constituency');
  const [selectedWard, setSelectedWard] = useState('Select Ward');
  const [loading, setLoading] = useState(false);
  const [constituencies, setConstituencies] = useState([]);
  const [wards, setWards] = useState([]);
  const [counties, setCounties] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [input, setInput] = useState({
    name: '',
    nickname: '',
    lastname: '',
  });
  const [openModal, setOpenModal] = useState(true);
  const [isChecked, setIsChecked] = useState(false);
  const [userData, setUserData] = useState();
  const [open, setOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const { user } = useUser()

  
  
  useEffect(() => {
    if (!user || !user?.id) return;
  
    const checkUserExists = async () => {
      try {
        const userQuery = query(
          collection(db, 'userPosts'),
          where('uid', '==', user.id)
        );
        const querySnapshot = await getDocs(userQuery);
  
        if (!querySnapshot.empty) {
          setAlertMessage("Welcome to broadcast!");
          setShowAlert(true);
          setTimeout(() => {
            setShowAlert(false);
            router.push('/national'); // ✅ Only push after alert is hidden
          }, 1000);
        } else {
          return;
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };
  
    checkUserExists();
  }, [user?.id]);
  

  useEffect(() => {
    if (countyData && countyData.counties) {
      setCounties(countyData.counties);
    }
  }, []);

  useEffect(() => {
    const selectedCountyObj = counties.find(c => c.name === selectedCounty);
    if (selectedCountyObj) {
      setConstituencies(selectedCountyObj.constituencies);
    } else {
      setConstituencies([]);
      setSelectedConstituency('Select Constituency');
      setSelectedWard('Select Ward');
    }
  }, [selectedCounty, counties]);

  useEffect(() => {
    const selectedConstituencyObj = constituencies.find(c => c.name === selectedConstituency);
    if (selectedConstituencyObj) {
      setWards(selectedConstituencyObj.wards);
    } else {
      setWards([]);
      setSelectedWard('Select Ward');
    }
  }, [selectedConstituency, constituencies]);

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
   
    const docRef = await addDoc(collection(db, 'userPosts'), {
      uid: user?.id,
      timestamp: serverTimestamp(),
      name: input.name,
      lastname: input.lastname,
      nickname: input.nickname,
      constituency: selectedConstituency,
      ward: selectedWard,
      county: selectedCounty,
      category: selectedCategory,
    });

    const imageRef = ref(storage, `userPosts/${docRef.id}/userImg`);
    if (selectedFile) {
      await uploadString(imageRef, selectedFile, 'data_url').then(async () => {
        const downloadURL = await getDownloadURL(imageRef);
        await updateDoc(doc(db, 'userPosts', docRef.id), {
          userImg: downloadURL,
        });
      });
    }

    setSelectedFile(null);
    setInput({ name: '', nickname: '', lastname: '' });
    setSelectedCounty(selectedCounty);
    setSelectedConstituency(selectedConstituency);
    setSelectedWard(selectedWard);
    setLoading(false);

    if (selectedWard !== 'Select Ward') {
      router.push('/national');
    }

    if (!selectedFile) {
      alert('Please select your profile');
      return;
    }
    if (!selectedCategory) {
      alert('Please select category');
      return;
    }
    if (selectedCounty === 'Select County') {
      alert('Please select your county');
    } else if (selectedConstituency === 'Select Constituency') {
      alert('Please select your constituency');
    } else if (selectedWard === 'Select Ward') {
      alert('Please select your ward');
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (input.nickname) {
        const q = query(collection(db, 'userPosts'), where('nickname', '==', input.nickname));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUserData(querySnapshot.docs[0].data());
        }
      }
    };

    fetchUserData();
  }, [input.nickname]);

  useEffect(() => {
    if (userData && userData.nickname === input.nickname) {
      alert('Nickname already exists. Please enter a new nickname.');
    }
  }, [userData]);

  const addImageUserImg = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setSelectedFile(readerEvent.target.result);
    };
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const toggleConstituencyDropdown = () => {
    setConstituencyDropdownOpen(!constituencyDropdownOpen);
  };

  const toggleWardDropdown = () => {
    setWardDropdownOpen(!wardDropdownOpen);
  };

  const [text, count] = useTypewriter({
    words: ['Welcome to BroadCast', 'In pursuit of a perfect nation'],
    loop: true,
    delaySpeed: 2000,
  });

  const handleAccept = () => {
    setIsChecked(true);
    setOpenModal(false);
  };

  const handleDecline = () => {
    setIsChecked(false);
    setOpenModal(false);
  };

  const handleSelect = (category) => {
    setSelectedCategory(category)
    setOpen(false);
  }

  return (
  <>
  <Head>
        <title>Broadcast</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head> 
      
      {showAlert && (
      <Alert color="success">
        <span className="font-medium">{alertMessage}</span>
      </Alert>
    )}
    <div className=' h-screen min-w-screen flex justify-center'>
    
     

      <div className='w-full min-h-screen rounded-lg  dark:border-gray-700 xl:min-w-[576px]  
      flex-grow max-w-xl bg-white  sm:w-[600px] md:w-[700px] dark:bg-gray-950'>
        <div className='relative p-2'>
          <span className='absolute font-mono text-xl'>{text}</span>
          <Cursor cursorColor='green' />
        </div>
        <form className='relative mt-4 p-8' onSubmit={handleSubmit}>
    <div className='absolute  sm:ml-[394px] top-2  ml-[300px] md:ml-[420px] lg:ml-[412px]  md:mt-6 flex items-center'>
        <div className='absolute ml-10'>
        <BackgroundCircles />
        </div>
  
          <p className='absolute ml-3 text-base'>
            <span className='dark:text-white text-black text-xl'>KE</span>
            <span className='text-red-600 text-xl'>N</span>
            <span className='text-green-400 text-xl'>YA</span>
          </p>
    </div>

          <div className='-mt-6 md:flex flex-col space-y-2 text-lg md:text-lg'>
            <div className='md:flex-row flex flex-col items-start md:items-center'>
              <label className='mr-[53px]'>Name:</label>
              <input
                type='text'
                name='name'
                value={input.name}
                onChange={handleChange}
                placeholder='Enter name'
                className=' border-[1px] border-gray-300 bg-transparent focus:outline-none focus:ring-0 rounded-full md:rounded-md dark:bg-gray-950 dark:border-gray-900 text-2xl md:text-lg'
                required
              />
            </div>
            <div className='md:flex-row flex flex-col items-start md:items-center'>
              <label className='mr-4'>Last Name:</label>
              <input
                type='text'
                name='lastname'
                value={input.lastname}
                onChange={handleChange}
                placeholder='Enter last name'
                className='mr-4 border-gray-300 rounded-full bg-transparent outline-none focus:outline-none focus:ring-0 md:rounded-md border-[1px]
                 dark:border-gray-900 text-2xl md:text-lg'
                required
              />
            </div>
            <div className='md:flex-row flex flex-col items-start md:items-center'>
              <label className='mr-4'>NickName:</label>
              <input
                type='text'
                name='nickname'
                value={input.nickname}
                onChange={handleChange}
                placeholder='Enter username'
                className='mr-4 rounded-full border-gray-300 bg-transparent outline-none focus:outline-none focus:ring-0 md:rounded-md border-[1px]
                 dark:border-gray-900 text-2xl md:text-lg'
                required
              />
            </div>

            <div className='md:flex-row flex flex-col md:items-center'>
              <label className='mr-4'>Profile:</label>
              <input
                type='file'
                required
                accept='image/*'
                ref={filePickerRef}
                onChange={addImageUserImg}
                className='rounded-md dark:bg-gray-950 bg-gray-300 border-gray-300 text-gray-800 dark:text-gray-200 w-[300px] md:ml-[32px] md:w-[228px]'
              />
            </div>

            {selectedFile && (
              <div className='items-center flex'>
                <img src={selectedFile} alt='image' className='h-16 w-16 md:h-12 md:w-12 rounded-full' />
              </div>
            )}
          </div>
      

          <div className='flex items-center'>
            <Popover 
            aria-labelledby="area-popover"
            open={open}
            onOpenChange={setOpen}
            trigger='click'
            content={
              <div className="absolute dark:bg-gray-900 -ml-6 bg-gray-100 rounded-md shadow-lg py-2  border-0 z-50 space-y-2 w-64">
                <div onClick={() => handleSelect('Personal Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>Personal Account</div>
                <div onClick={() => handleSelect('Business Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>Business Account</div>
                <div onClick={() => handleSelect('Non-Profit and Community Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>Non-Profit and Community Account</div>
                <div onClick={() => handleSelect('Public Figure Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>'Public Figure Account'</div>
                <div onClick={() => handleSelect('Media and Publisher Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>Media and Publisher Account</div>
                <div onClick={() => handleSelect('News and Media Outlet')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>News and Media Outlet</div>
                <div onClick={() => handleSelect('E-commerce and Retail Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>E-commerce and Retail Account</div>
                <div onClick={() => handleSelect('Entertainment and Event Account')} className='dark:hover:bg-gray-800 hover:bg-gray-200 px-2 cursor-pointer'>Entertainment and Event Account</div>
                
              </div>
            } placement="bottom">
            
            <div className='w-[300px] md:w-[200px] text-gray-800 dark:text-gray-300 font-medium border-[1px] border-gray-300 dark:border-gray-900 my-2 p-2 rounded-md flex items-center justify-between'>
            <p  onClick={toggleDropdown}>{selectedCategory || 'select category'}</p>  
            <ChevronDownIcon  className={`${selectedCategory ? 'h-6' : 'h-6 animate-bounce' }`}/>
           </div>
              </Popover>
         </div>

         {selectedCategory && (
          <div>
            <button
              type='button'
              className='inline-flex justify-between rounded-md border border-gray-300 dark:border-gray-900 shadow-sm w-[300px] md:w-[200px] p-2 dark:bg-gray-950 
               text-xl md:text-sm font-medium text-gray-800 dark:text-gray-300 hover:opacity-80 focus:outline-none'
              onClick={toggleDropdown}
              required
            >
              {selectedCounty}
              <ChevronDownIcon className={`${selectedCounty != 'Select County' ? 'h-6' : 'h-6 animate-bounce' }`}/>
            </button>
          </div>
         )}

         {isOpen && (
  <div className='absolute mt-2 md:w-56 w-[300px] z-40 rounded-md shadow-lg 
    bg-gray-200 ring-1 ring-black ring-opacity-5 dark:bg-red-900 
    max-h-60 overflow-y-auto'>  
    {/* max-h-60: Limits height, overflow-y-auto: Enables vertical scrolling */}

    <div className='py-1' role='menu' aria-orientation='vertical' aria-labelledby='options-menu'>
      {counties.map(county => (
        <button
          key={county.countyCode}
          className='block px-4 py-2 text-xl w-full z-60 md:text-sm dark:bg-gray-900 
            dark:text-gray-50 bg-gray-200 hover:bg-slate-100 text-gray-800 text-left 
            dark:hover:bg-gray-950'
          onClick={() => {
            setSelectedCounty(county.name);
            setSelectedConstituency('Select Constituency');
            setSelectedWard('Select Ward');
            setIsOpen(false);
          }}
        >
          {county.name}
        </button>
      ))}
    </div>
  </div>
)}


          {selectedCounty !== 'Select County' && (
            <div>
              <button
                type='button'
                className='inline-flex justify-between rounded-md border border-gray-300 dark:border-gray-900 shadow-sm w-[300px] md:w-[200px] mt-2 mb-2 p-2
                  text-gray-800 dark:text-gray-300 text-xl md:text-sm font-medium dark:bg-gray-950 hover:opacity-50 focus:outline-none'
                onClick={toggleConstituencyDropdown}
              >
                {selectedConstituency}
                <ChevronDownIcon className={`${selectedConstituency != 'Select Constituency'? 'h-6' : 'h-6 animate-bounce' }`}/>
              </button>
              
            </div>
          )}

          {constituencyDropdownOpen && (
            <div className='absolute mt-2 md:w-56 w-[300px] z-40 rounded-md shadow-lg bg-gray-200 ring-1 ring-black ring-opacity-5 dark:text-white dark:bg-gray-800'>
              <div className='py-1' role='menu' aria-orientation='vertical' aria-labelledby='options-menu'>
                {constituencies.map(constituency => (
                  <button
                    key={constituency.code}
                    className='block px-4 py-2 text-xl w-full z-60 md:text-sm dark:bg-gray-950 dark:text-gray-50 bg-gray-200 hover:bg-slate-100 text-gray-800  text-left dark:hover:bg-gray-950'
                    onClick={() => {
                      setSelectedConstituency(constituency.name);
                      setSelectedWard('Select Ward');
                      setConstituencyDropdownOpen(false);
                    }}
                  >
                    {constituency.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedConstituency !== 'Select Constituency' && (

              <button
                type='button'
                className='inline-flex justify-between rounded-md border border-gray-300 dark:border-gray-900 shadow-sm w-[300px] md:w-[200px] p-2  text-xl
                 md:text-sm font-medium text-gray-800 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none'
                onClick={toggleWardDropdown}
              >
                {selectedWard}
                <ChevronDownIcon className={`${selectedWard != 'Select Ward'? 'h-6' : 'h-6 animate-bounce' }`}/>
              </button>
            
          )}

          {wardDropdownOpen && (
            <div className='absolute mt-1 md:w-56 w-[300px] rounded-md shadow-lg ring-1 z-40 ring-black ring-opacity-5'>
              <div className='py-1' role='menu' aria-orientation='vertical' aria-labelledby='options-menu'>
                {wards.map(ward => (
                  <button
                    key={ward.code}
                    className='block px-4 py-2 text-xl md:text-sm text-gray-700 bg-gray-200 hover:bg-slate-100 w-full text-left dark:bg-gray-950 dark:text-white dark:hover:bg-gray-950'
                    onClick={() => {
                      setSelectedWard(ward.name);
                      setWardDropdownOpen(false);
                    }}
                  >
                    {ward.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className='flex flex-col absolute space-y-3 space-x-2'>
          <button
            type='submit'
            className='dark:bg-gray-950 border-[1px] bg-gray-600  hover:bg-gray-800 dark:hover:bg-gray-600 dark:border-gray-900 p-2 text-lg rounded-md text-white  mt-2 w-[300px] md:w-[200px] font-bold cursor-pointer hover:opacity-50 font-serif shadow-sm'
          >
            {loading ? 'Loading..' : 'Submit'}
          </button>
          <div className='flex space-x-2'>
            <label className='flex items-center'>
              <input type='checkbox' required checked={isChecked} onChange={() => setIsChecked(!isChecked)} />
            </label>
            <div className='font-serif cursor-pointer' onClick={() => setOpenModal(true)}>
              <Tooltip content='Click to view terms and conditions' trigger="hover">
              <p className='text-xl text-wrap'>Accept terms and conditions</p>
              </Tooltip>
            </div>
            </div>

         
          </div>

          <Modal dismissible show={openModal} onClose={() => setOpenModal(false)}>
            <Modal.Header>Terms of Service</Modal.Header>
            <Modal.Body>
              <div className='space-y-6'>
                <p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
                  Welcome to Broadcast. By using the App, you agree to be bound by these Terms of Service
                  . Broadcast is a political app that allows users to share, discuss, and stay updated on
                  political news and events. You must be at least 18 years old to use the App. To use certain features
                  of the App, you must create an account and provide accurate and complete information. You are
                  responsible for maintaining the confidentiality of your account credentials. You agree not to use the
                  App to post or transmit any illegal, harmful, or objectionable content, impersonate any person or
                  entity, engage in any activity that could impair the App, or use any automated means to access the App
                  without permission.
                </p>
                <p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
                  These Terms shall be governed by the laws of [Your Country/State]. We reserve the right to modify
                  these Terms at any time, and your continued use of the App constitutes your acceptance of the new
                  Terms.
                </p>
                <p className='text-base leading-relaxed text-gray-500 dark:text-gray-400'>
                  If you have any questions, please contact us at contact@broadcastapp.com. By using the Broadcast app,
                  you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleAccept}>I accept</Button>
              <Button color='gray' onClick={handleDecline}>
                Decline
              </Button>
            </Modal.Footer>
          </Modal>
        </form>
      </div>
    </div>
    </>
  );
}

export default Form;
