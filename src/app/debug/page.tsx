'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export default function DebugPage() {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check current user
                const { data: { user }, error: userError } = await supabase.auth.getUser()

                setUser(user)

                // Check current session
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                setSession(session)

                setLoading(false)
            } catch (error) {

                setLoading(false)
            }
        }

        checkAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {

                setUser(session?.user ?? null)
                setSession(session)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

            <div className="space-y-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">User Status</h2>
                    <p><strong>Authenticated:</strong> {user ? 'Yes' : 'No'}</p>
                    {user && (
                        <>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>ID:</strong> {user.id}</p>
                            <p><strong>Created:</strong> {user.created_at}</p>
                        </>
                    )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Session Status</h2>
                    <p><strong>Session exists:</strong> {session ? 'Yes' : 'No'}</p>
                    {session && (
                        <>
                            <p><strong>Access token:</strong> {session.access_token ? 'Present' : 'Missing'}</p>
                            <p><strong>Expires at:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
                        </>
                    )}
                </div>

                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-2">Environment</h2>
                    <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</p>
                    <p><strong>Supabase Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</p>
                </div>

                <div className="space-x-4">
                    <button
                        onClick={() => window.location.href = '/auth/login'}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                    <button
                        onClick={() => window.location.href = '/chat'}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Go to Chat
                    </button>
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut()
                            window.location.reload()
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}