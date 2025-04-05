import MessagesFeed from '../components/Message/MessagesFeed'



function messages() {

  return (
    
    <div className='flex min-h-screen w-4/4 dark:bg-gray-950'>
        {/* Sidebar */}
        

        <div className='w-full xl:w-3/4 '> 
          <MessagesFeed />
        </div>
    </div>

 
  )
}

export default messages
