import Head from 'next/head'
import MembersFeed from '../components/Members/Members'

function members() {
  return (
    <>
     <Head>
        <title>Members</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <div className='flex w-full h-screen max-w-6xl mx-auto justify-center'>
      <MembersFeed />
    </div>
    </>
    
  )
}

export default members
