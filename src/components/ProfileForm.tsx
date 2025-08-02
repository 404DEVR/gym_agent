'use client'

import { useState, useEffect } from 'react'
import { User, Save, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UserProfile {
  age?: number
  weight?: number
  height?: number
  gender?: string
  activity_level?: string
  fitness_goal?: string
  dietary_restrictions?: string[]
  medical_conditions?: string[]
  experience_level?: string
  bmr?: number
  tdee?: number
  target_calories?: number
  target_protein?: number
  target_carbs?: number
  target_fat?: number
  preferred_workout_days?: number
  gym_access?: boolean
  equipment_available?: string[]
}

interface ProfileFormProps {
  onProfileUpdate?: (profile: UserProfile) => void
}

export default function ProfileForm({ onProfileUpdate }: ProfileFormProps) {
  const [profile, setProfile] = useState<UserProfile>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      // Get the current session for authorization
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        if (data.profile) {
          setProfile(data.profile)
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Get the current session for authorization
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setSaving(false)
        return
      }

      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(profile)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setSaved(true)
        onProfileUpdate?.(data.profile)

        // Reset saved state after 2 seconds
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: string | number | string[] | boolean | undefined) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center mb-6">
        <User className="w-6 h-6 text-primary-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Personal Information
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age *
            </label>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(e) => updateProfile('age', parseInt(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gender *
            </label>
            <select
              value={profile.gender || ''}
              onChange={(e) => updateProfile('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Weight (kg) *
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.weight || ''}
              onChange={(e) => updateProfile('weight', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Height (cm) *
            </label>
            <input
              type="number"
              step="0.1"
              value={profile.height || ''}
              onChange={(e) => updateProfile('height', parseFloat(e.target.value) || undefined)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
              required
            />
          </div>
        </div>

        {/* Fitness Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fitness Goal *
            </label>
            <select
              value={profile.fitness_goal || ''}
              onChange={(e) => updateProfile('fitness_goal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
              required
            >
              <option value="">Select goal</option>
              <option value="lose weight">Lose Weight</option>
              <option value="build muscle">Build Muscle</option>
              <option value="gain weight">Gain Weight</option>
              <option value="maintain weight">Maintain Weight</option>
              <option value="improve endurance">Improve Endurance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Activity Level *
            </label>
            <select
              value={profile.activity_level || ''}
              onChange={(e) => updateProfile('activity_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
              required
            >
              <option value="">Select activity level</option>
              <option value="sedentary">Sedentary (little/no exercise)</option>
              <option value="lightly_active">Lightly Active (light exercise 1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (moderate exercise 3-5 days/week)</option>
              <option value="very_active">Very Active (hard exercise 6-7 days/week)</option>
              <option value="extremely_active">Extremely Active (very hard exercise, physical job)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Experience Level
            </label>
            <select
              value={profile.experience_level || 'beginner'}
              onChange={(e) => updateProfile('experience_level', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Workout Days/Week
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={profile.preferred_workout_days || 3}
              onChange={(e) => updateProfile('preferred_workout_days', parseInt(e.target.value) || 3)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
            />
          </div>
        </div>

        {/* Calculated Macros Display */}
        {profile.target_calories && (
          <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Your Daily Targets
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary-600">{profile.target_calories}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Calories</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{profile.target_protein}g</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Protein</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{profile.target_carbs}g</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Carbs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{profile.target_fat}g</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Fat</div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          {saved ? (
            <button
              type="button"
              disabled
              className="flex items-center px-6 py-2 bg-green-600 text-white font-medium rounded-md"
            >
              <Save className="w-4 h-4 mr-2" />
              Saved!
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}