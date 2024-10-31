import Sidebar from '../components/National/Sidebar'
import MessagesFeed from '../components/Message/MessagesFeed'
import StatusModal from '../components/National/StatusModal'

function messages() {
  return (
    
    <div className='flex min-h-screen w-full dark:bg-gray-950'>
        {/* Sidebar */}
        <div className='hidden xl:inline w-1/4'> 
          <Sidebar />
          <StatusModal />
        </div>

        <div className='w-full xl:w-3/4 '> 
          <MessagesFeed />
        </div>
    </div>

 
  )
}

export default messages
