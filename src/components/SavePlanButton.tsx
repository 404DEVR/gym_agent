'use client'

import { useState } from 'react'
import { Save, Check, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface SavePlanButtonProps {
  type: 'meal' | 'workout'
  data: {
    goal: string;
    [key: string]: unknown;
  }
  onSave: () => void
}

export default function SavePlanButton({ type, data, onSave }: SavePlanButtonProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const table = type === 'meal' ? 'meal_plans' : 'workout_plans'
      
      // Structure the data correctly for the database
      let planData
      if (type === 'meal') {
        planData = {
          user_id: user.id,
          goal: data.goal || 'General meal plan',
          ingredients: data.ingredients || [],
          meals: data.meals || [],
          created_at: new Date().toISOString()
        }
      } else {
        planData = {
          user_id: user.id,
          goal: data.goal || 'General workout plan',
          split: data.split || [],
          days: data.days || 7,
          exercises: data.exercises || [],
          created_at: new Date().toISOString()
        }
      }

      console.log('Saving plan data:', planData) // Debug log

      const { error } = await supabase
        .from(table)
        .insert([planData])

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      setSaved(true)
      onSave()
      
      // Reset saved state after 2 seconds
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Error saving plan:', error)
      alert(`Failed to save ${type} plan. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <button
        disabled
        className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md"
      >
        <Check className="w-4 h-4 mr-2" />
        Saved!
      </button>
    )
  }

  return (
    <button
      onClick={handleSave}
      disabled={saving}
      className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium rounded-md transition-colors"
    >
      {saving ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          Saving...
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          Save to Profile
        </>
      )}
    </button>
  )
}