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
  fromChefPage?: boolean // New prop to distinguish context
  action?: 'add' | 'update' // New prop for workout plan action
}

export default function SavePlanButton({ type, data, onSave, fromChefPage = false, action = 'add' }: SavePlanButtonProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      if (type === 'meal' && !fromChefPage) {
        // From ChatBot: Redirect to chef page with auto-generation
        const extractedIngredients = [
          'oats', 'greek yogurt', 'berries', 'eggs', 'whole grain bread', 'avocado',
          'chicken breast', 'brown rice', 'mixed vegetables', 'olive oil', 'lemon',
          'fish', 'tofu', 'steamed vegetables', 'lentils', 'cucumber',
          'apple', 'peanut butter', 'almonds', 'cottage cheese', 'protein powder'
        ]

        const nutritionPlanData = {
          goal: data.goal || 'General meal plan',
          ingredients: extractedIngredients,
          dietary_restrictions: [],
          target_calories: 2000,
          auto_generate: true
        }

        localStorage.setItem('nutritionPlanData', JSON.stringify(nutritionPlanData))
        window.location.href = '/chef'
      } else if (type === 'meal' && fromChefPage) {
        // From Chef Page: Save meal plan directly to Supabase
        const planData = {
          user_id: user.id,
          goal: data.goal || 'General meal plan',
          ingredients: data.ingredients || [],
          meals: data.meals || [],
          created_at: new Date().toISOString()
        }

        console.log('Saving meal plan data to Supabase:', planData)

        const { error } = await supabase
          .from('meal_plans')
          .insert([planData])

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        setSaved(true)
        onSave()
        
        // Keep the success state - don't reset it
        // The buttons will be hidden when the next message is sent
      } else {
        // For workout plans, use the new backend endpoint with action support
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gym-agent-rag.onrender.com'
        
        const requestData = {
          user_id: user.id,
          action: action, // 'add' or 'update'
          workout_plan: {
            goal: data.goal || 'General workout plan',
            split: data.split || [],
            days: data.days || 7,
            exercises: data.exercises || []
          }
        }

        console.log('Saving workout plan with action:', action, requestData)

        const response = await fetch(`${apiUrl}/api/save-workout-plan`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save workout plan')
        }

        const result = await response.json()
        console.log('Workout plan saved successfully:', result)

        setSaved(true)
        onSave()
        
        // Keep the success state - don't reset it
        // The buttons will be hidden when the next message is sent
      }
    } catch (error) {
      console.error('Error handling plan:', error)
      alert(`Failed to handle ${type} plan. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const getSavedText = () => {
    if (type === 'workout') {
      return action === 'update' ? 'Updated!' : 'Saved!'
    }
    return 'Saved!'
  }

  if (saved) {
    return (
      <button
        disabled
        className="flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md"
      >
        <Check className="w-4 h-4 mr-2" />
        {getSavedText()}
      </button>
    )
  }

  const getButtonText = () => {
    if (type === 'workout') {
      return action === 'update' ? 'Update Plan' : 'Add New Plan'
    }
    return 'Save to Profile'
  }

  const getSavingText = () => {
    if (type === 'workout') {
      return action === 'update' ? 'Updating...' : 'Saving...'
    }
    return 'Saving...'
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
          {getSavingText()}
        </>
      ) : (
        <>
          <Save className="w-4 h-4 mr-2" />
          {getButtonText()}
        </>
      )}
    </button>
  )
}