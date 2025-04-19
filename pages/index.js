import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

function Index() {
  const router = useRouter();

  useEffect(() => {
    const { id } = router.query;

    // Only redirect if no ID is present in the query or path
    if (!id && router.pathname === '/') {
      router.push('/national');
    }
  }, [router]);

  return (
    <div className="flex flex-col w-full justify-center items-center h-screen">
      <div className="mb-60 flex-col space-y-4 items-center">
        <Image
          src="/images/Brodcast.jpg"
          width={100}
          height={100}
          className="rounded-md"
          alt="Broadcast"
        />
      </div>
    </div>
  );
}

export default Index;
