import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, where, getDocs } from 'firebase/firestore';
import { Button, Dropdown, Navbar, Popover, Spinner } from 'flowbite-react'; 
import { ArrowCircleDownIcon, ArrowLeftIcon, HeartIcon, HomeIcon, SearchIcon, TrashIcon, UserIcon, XIcon } from '@heroicons/react/outline';
import Products from './Products';
import { useRouter } from 'next/router';
import SearchProducts from './SearchProducts';
import SearchCategories from './SearchCategories';
import { ArrowDownWideNarrow } from 'lucide-react';


function ProductsFeed() {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [querySearch, setQuerySearch] = useState('');
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  const fetchPosts = async () => {
    try {
      const q = query(collection(db, 'marketplace'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPosts(snapshot.docs);  // Update the posts state
        setLoading(false);        // Set loading to false once data is fetched
      });
      return unsubscribe;  // Return unsubscribe to cleanup the listener
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load products.');
    }
  };
  
  useEffect(() => {
    let unsubscribe;
  
    const getPosts = async () => {
      unsubscribe = await fetchPosts(); // Assign unsubscribe function from fetchPosts
    };
  
    getPosts();  
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  

  // Search products and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setProducts([]);
          return;
        }
  
        const q = query(
          collection(db, 'marketplace'),
          where('product', '>=', querySearch),
          where('product', '<=', querySearch + '\uf8ff'),
        );
  
  
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const docs = []; // Array to store unique posts
  
          snapshot.docs.forEach((doc) => {
            const postName = doc.data().product;
            if (postName) {
              docs.push(doc);
            }
          });
  
          setProducts(docs);
          setLoading(false);
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error('Error searching Firestore:', error);
      }
    };
  
    fetchData();
    
  }, [querySearch]);


  // category

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!querySearch) {
          setCategories([]);
          return;
        }
  
        const q = query(
          collection(db, 'marketplace'),
          where('category', '>=', querySearch),
          where('category', '<=', querySearch + '\uf8ff'),
        );
  
  
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const docs = []; // Array to store unique posts
  
          snapshot.docs.forEach((doc) => {
            const postName = doc.data().category;
            if (postName) {
              docs.push(doc);
            }
          });
  
          setCategories(docs);
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error('Error searching Firestore:', error);
      }
    };
  
    fetchData();
    
  }, [querySearch]);


  const clearSearch = () => {
    setQuerySearch('');
  };


  const handleCategorySelect = (category) => {
     setQuerySearch(category); 
     setOpen(false)
  };


  

  return (
    <div className='dark:bg-gray-950'>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <Button color="gray" className="border-0">
            <Spinner aria-label="Loading spinner" size="sm" />
            <span className="pl-3 animate-pulse">Loading...</span>
          </Button>
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center px-1'>
          <div className='md:px-8 py-4 shadow-md w-full flex lg:justify-between justify-center space-x-3 px-2 -ml-3'>
          <div className='flex space-x-8'>
            <ArrowLeftIcon className='h-10 p-1 text-gray-500 hover:bg-slate-400 hover:text-gray-200 dark:text-gray-200 rounded-full cursor-pointer dark:hover:bg-slate-800 hidden lg:inline' onClick={() => router.push('/marketplace')} />
             <div className='flex items-center'>
            
                <Popover 
                aria-labelledby="area-popover"
                open={open}
                onOpenChange={setOpen}
                trigger='click'
                content={
                  <div className="absolute dark:bg-gray-900 -ml-6 rounded-md shadow-lg py-2 z-20 border-0 space-y-2 w-64 bg-gray-100">
                    <div onClick={() => handleCategorySelect("Vehicles & Trucks")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Vehicles & Trucks</div>
                    <div onClick={() => handleCategorySelect("Electronics")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Electronics</div>
                    <div onClick={() => handleCategorySelect("Fashion")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Fashion</div>
                    <div onClick={() => handleCategorySelect("Phones & Tablets")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Phones & Tablets</div>
                    <div onClick={() => handleCategorySelect("Machineries")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Machineries</div>
                    <div onClick={() => handleCategorySelect("Buildings & Land")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Buildings & Land</div>
                    <div onClick={() => handleCategorySelect("Agricultural")} className='dark:hover:bg-gray-800 hover:bg-gray-300 px-2 cursor-pointer'>Agricultural</div>
                  </div>
                } placement="bottom">
                
                <ArrowDownWideNarrow className='h-10 w-10 cursor-pointer p-2 text-gray-600 dark:text-gray-500'  onClick={toggleDropdown}/>
               
                  </Popover>
            
             </div>
             
            </div>
            
            <form className='flex items-center justify-center min-w-[250px] sm:min-w-[400px] space-x-4 rounded-full '>
              <div className='flex items-center border-[1px] w-full rounded-full dark:border-gray-500'>
                <SearchIcon className='h-6 ml-2 text-gray-600 dark:text-gray-500' />
                <input 
                  type='text' 
                  value={querySearch}
                  onChange={e => setQuerySearch(e.target.value)}
                  placeholder='Search product or category'
                  className='outline-none focus:ring-0 border-0 rounded-full w-full dark:bg-gray-950 dark:placeholder:text-gray-300'
                />
                <XIcon className={`${querySearch ? 'h-6 px-1 cursor-pointer' : 'hidden'}`} onClick={clearSearch} />
              </div>
             
            </form>

            <HomeIcon className='h-10 p-1 dark:text-gray-400 text-gray-500 rounded-full cursor-pointer hover:bg-slate-400 hover:text-gray-200 dark:hover:bg-slate-800 hidden lg:inline' onClick={() => router.push('/home')} />
          </div>

          <div className='flex  w-full space-x-3 px-2'>
            <div className='border-r-md shadow-gray-600 z-30 min-h-screen lg:hidden '>
              <div className='flex space-x-3 px-1 py-3 items-center cursor-pointer text-gray-700 dark:text-gray-300' onClick={() => router.push('/marketplace')}>
                <ArrowLeftIcon className='h-8 w-8' />
                <span className='hidden sm:inline'>Back</span>
              </div>
              <div className='flex space-x-3 px-1 py-3 items-center cursor-pointer text-gray-700 dark:text-gray-300' onClick={() => router.push('/home')}>
                <HomeIcon className='h-8 w-8' />
                <span className='hidden sm:inline'>Home</span>
              </div>
              <div className='flex space-x-3 px-1 py-3 items-center cursor-pointer text-gray-700 dark:text-gray-300' onClick={() => router.push('/profile')}>
                <UserIcon className='h-8 w-8' />
                <span className='hidden sm:inline truncate'>Profile</span>
              </div>
            </div>
     
          
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 py-4 px-2 sm:px-4 w-full">
           
              {posts.map((post) => (
                <div key={post.id} className={`${querySearch ? 'hidden' : 'inline'}`}>
                  <Products id={post.id} data={post} />
                </div>
              ))}
      
                  {loading ? (
                    <Spinner className='h-10' />
                  ) : (
                    products.map((post) => (
                      <div key={post.product}>
                        <SearchProducts key={post.product} id={post.id} product={querySearch} data={post} />
                      </div>
                    ))
                  )}
        

                  {loading ? (
                    <Spinner className='h-10' />
                  ) : (
                    categories.map((post) => (
                      <div key={post.category}>
                        <SearchCategories key={post.category} id={post.id} category={querySearch} data={post} />
                      </div>
                    ))
                  )}
               </div>
               </div>
          </div>
   
      )}
    </div>
  );
}

export default ProductsFeed;
