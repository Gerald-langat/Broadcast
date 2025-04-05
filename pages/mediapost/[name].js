import { Carousel } from "flowbite-react";
import Head from "next/head";
import Link from "next/link";
import Sidebar from "../../components/National/Sidebar";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { useUser } from "@clerk/nextjs";

export default function MediaSearch() {
  const router = useRouter();
  const [posts, setPosts] = useState([]); // Changed from {} to []
  const { name } = router.query;
  const [userData, setUserData] = useState(null);
  const { user } = useUser()

    useEffect(() => {
      const fetchUserData = async () => {
        setLoading(true); // Ensure loading is set to true at the start
    
        try {
          if (user?.id) {
            const q = query(collection(db, 'userPosts'), where('uid', '==', user?.id));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              setUserData(querySnapshot.docs[0].data());
            }
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false); // Ensure loading is set to false after fetching
        }
      };
    
      fetchUserData();
    }, [user?.id]);

  useEffect(() => {
    if (!name) return; // Skip if name is not provided

    const fetchPostsByName = async () => {
      try {
        const q = query(collection(db, "national"), where("name", "==", name));
        const querySnapshot = await getDocs(q);

        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPostsByName();
  }, [name]);

   useEffect(() => {
      if (!userData?.uid) {
        router.push('/'); // Instead of using signout, you can push to the signout page
      }
    }, [userData?.uid, router]);

  return (
    <div className="space-y-2 w-full p-6">
      <Head>
        <title>{name ? name : "loading..."}</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="/images/Brodcast.jpg" />
      </Head>

      {/* Grid Container */}
      <div className="flex w-full">
        {/* Sidebar */}
        <div className="w-1/4">
          <Sidebar />
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-3/4">
          {posts.map((post) => (
            <Link key={post.id} href={`/posts(id)/${post.id}`}>
              <div className="cursor-pointer">
                {post?.images?.length > 1 ? (
                  // Display Carousel for Multiple Images
                  <Carousel className="h-[200px] w-full">
                    {post.images.map((imageUrl, index) => (
                      <div className="relative h-full w-full" key={index}>
                        <img
                          className="object-cover w-full h-full rounded-md"
                          src={imageUrl}
                          alt={`image-${index}`}
                        />
                        <div className="absolute bottom-2 left-2 bg-gray-700 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
                          <p className="font-bold">{post.name}</p>
                          <p>{post.lastname}</p>
                          <p>@{post.nickname}</p>
                        </div>
                      </div>
                    ))}
                  </Carousel>
                ) : post?.images?.[0] ? (
                  // Display Single Image
                  <div className="relative w-full">
                    <img
                      className="w-full h-[200px] object-cover rounded-md"
                      src={post.images[0]}
                      alt="Single image"
                    />
                    <div className="absolute bottom-2 left-2 bg-gray-500 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
                      <p className="font-bold">{post.name}</p>
                      <p>{post.lastname}</p>
                      <p>@{post.nickname}</p>
                    </div>
                  </div>
                ) : post?.video ? (
                  // Display Video
                  <div className="relative mt-4">
                    <video
                      autoPlay
                      loop
                      controls
                      className="w-full h-[200px] object-cover rounded-md"
                      src={post.video}
                    />
                    <div className="absolute bottom-2 left-2 bg-gray-500 bg-opacity-75 p-2 rounded-lg text-white text-sm sm:text-xs truncate">
                      <p className="font-bold">{post.name}</p>
                      <p>{post.lastname}</p>
                      <p>@{post.nickname}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
