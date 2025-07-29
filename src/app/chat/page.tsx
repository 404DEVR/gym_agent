'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import ChatBox from '@/components/ChatBox'
import { Loader2 } from 'lucide-react'

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()



        if (sessionError) {

          if (mounted) router.push('/auth/login')
          return
        }

        if (!session?.user) {

          if (mounted) router.push('/auth/login')
          return
        }


        if (mounted) {
          setUser(session.user)
          setLoading(false)
        }
      } catch {
        if (mounted) router.push('/auth/login')
      }
    }

    // Small delay to ensure auth state is settled
    const timer = setTimeout(checkAuth, 100)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {


        if (!mounted) return

        if (event === 'SIGNED_OUT' || !session?.user) {

          router.push('/auth/login')
        } else if (session?.user) {

          setUser(session.user)
          setLoading(false)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your chat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-900">
      <ChatBox />
    </div>
  )
}