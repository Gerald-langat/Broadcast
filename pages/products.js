import ProductsFeed from '../components/Products/ProductsFeed'
import Head from 'next/head'


function products() {

  
  return (
    <div>
    <Head>
        <title>product</title>
        <meta name="description" content="Generated and created by redAnttech" />
        <link rel="icon" href="../../images/Brodcast.jpg" />
      </Head>
      <ProductsFeed />
    </div>
  )
}

export default products
