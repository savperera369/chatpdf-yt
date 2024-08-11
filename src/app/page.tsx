import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

// async marks it as a server component
// entire code will run once on the server to generate the html
// html code will be send back to client to be rendered
export default async function Home() {
  // if logged in this userId will resolve to a string
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className='w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100'>
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <div className='flex flex-col items-center text-center'>
          <div className='flex items-center'>
            <h1 className='mr-3 text-5xl font-semibold'>Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>

          <div className="flex mt-2">
            {isAuth && <Button>Go to Chats</Button>}
          </div>

          <p className='max-w-xl mt-1 text-lg text-slate-600'>Join millions of students, researchers, and professionals to instantly answer questions and understand research with AI</p>

          <div className='w-full mt-4'>
            {isAuth ? (<h1>fileUpload</h1>) : (
              <Link href="/sign-in">
                <Button>
                  Log In to get started
                  <LogIn className='w-4 h-4 ml-2'/>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
