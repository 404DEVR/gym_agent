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

        console.log('Chat page - checking session:', session?.user?.email, sessionError)

        if (sessionError) {
          console.error('Session error:', sessionError)
          if (mounted) router.push('/auth/login')
          return
        }

        if (!session?.user) {
          console.log('No session found, redirecting to login')
          if (mounted) router.push('/auth/login')
          return
        }

        console.log('User authenticated, showing chat')
        if (mounted) {
          setUser(session.user)
          setLoading(false)
        }
      } catch (err) {
        console.error('Unexpected error in checkAuth:', err)
        if (mounted) router.push('/auth/login')
      }
    }

    // Small delay to ensure auth state is settled
    const timer = setTimeout(checkAuth, 100)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)

        if (!mounted) return

        if (event === 'SIGNED_OUT' || !session?.user) {
          console.log('User signed out, redirecting to login')
          router.push('/auth/login')
        } else if (session?.user) {
          console.log('User authenticated, updating state')
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