'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Loader2, User as UserIcon, Dumbbell, ChefHat } from 'lucide-react'
import MealPlanCard from '@/components/MealPlanCard'
import WorkoutPlanCard from '@/components/WorkoutPlanCard'
import ProfileTabs from '@/components/ProfileTabs'
import ProfileForm from '@/components/ProfileForm'
import { MealPlan, WorkoutPlan } from '@/types'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'meals' | 'workouts'>('profile')
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          if (mounted) router.push('/auth/login')
          return
        }

        if (mounted) {
          setUser(session.user)
          setLoading(false)
          loadUserPlans(session.user.id)
        }
      } catch {
        if (mounted) router.push('/auth/login')
      }
    }

    const timer = setTimeout(checkAuth, 100)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_OUT' || !session?.user) {
          router.push('/auth/login')
        } else if (session?.user) {
          setUser(session.user)
          setLoading(false)
          loadUserPlans(session.user.id)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timer)
      subscription.unsubscribe()
    }
  }, [router])

  const loadUserPlans = async (userId: string) => {
    setLoadingPlans(true)
    try {
      // Load meal plans
      const { data: meals, error: mealsError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!mealsError && meals) {
        setMealPlans(meals)
      }

      // Load workout plans
      const { data: workouts, error: workoutsError } = await supabase
        .from('workout_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!workoutsError && workouts) {
        setWorkoutPlans(workouts)
      }
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleDeletePlan = async (type: 'meal' | 'workout', id: string) => {
    try {
      const table = type === 'meal' ? 'meal_plans' : 'workout_plans'
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)

      if (!error) {
        if (type === 'meal') {
          setMealPlans(prev => prev.filter(plan => plan.id !== id))
        } else {
          setWorkoutPlans(prev => prev.filter(plan => plan.id !== id))
        }
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <UserIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your saved meal plans and workout routines
          </p>
        </div>

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="mt-8">
          {loadingPlans ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading your plans...</p>
            </div>
          ) : (
            <>
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <ProfileForm />
                </div>
              )}

              {activeTab === 'meals' && (
                <div className="space-y-6">
                  {mealPlans.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
                      <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No meal plans yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first meal plan using our AI Chef
                      </p>
                      <button
                        onClick={() => router.push('/chef')}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Go to Chef
                      </button>
                    </div>
                  ) : (
                                         mealPlans.map((plan) => (
                       <MealPlanCard
                         key={plan.id || `meal-${Math.random()}`}
                         plan={plan}
                         onDelete={() => plan.id && handleDeletePlan('meal', plan.id)}
                       />
                     ))
                  )}
                </div>
              )}

              {activeTab === 'workouts' && (
                <div className="space-y-6">
                  {workoutPlans.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-dark-800 rounded-lg shadow-lg">
                      <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No workout plans yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Create your first workout plan using our AI Chat
                      </p>
                      <button
                        onClick={() => router.push('/chat')}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                      >
                        Go to Chat
                      </button>
                    </div>
                  ) : (
                                         workoutPlans.map((plan) => (
                       <WorkoutPlanCard
                         key={plan.id || `workout-${Math.random()}`}
                         plan={plan}
                         onDelete={() => plan.id && handleDeletePlan('workout', plan.id)}
                       />
                     ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}