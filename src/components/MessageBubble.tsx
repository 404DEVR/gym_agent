'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  sender: 'user' | 'agent'
  timestamp?: string
  nutritionPlan?: {
    goal: string
    ingredients: string[]
    dietary_restrictions: string[]
    target_calories: number
    daily_totals: {
      calories: number
      protein: number
    }
    meals: import('@/types').MealPlan['meals']
    tips?: string[]
  }
  workoutPlan?: {
    goal: string
    split: string[]
    days: number
    exercises: import('@/types').WorkoutPlan['exercises']
    user_profile?: {
      age?: number
      weight?: number
      height?: number
      gender?: string
      activity_level?: string
      fitness_goal?: string
      dietary_restrictions?: string[]
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
  }
}

// Enhanced markdown renderer for better formatting
const renderMarkdown = (text: string) => {
  // Handle bold text **text** or __text__
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
  formatted = formatted.replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>')

  // Handle italic text *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
  formatted = formatted.replace(/_(.*?)_/g, '<em class="italic">$1</em>')

  // Handle inline code `code`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')

  // Handle headers
  formatted = formatted.replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h3>')
  formatted = formatted.replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-gray-900 dark:text-white">$1</h2>')
  formatted = formatted.replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">$1</h1>')

  // Handle line breaks and paragraphs
  formatted = formatted.replace(/\n\n/g, '</p><p class="mb-3">')
  formatted = formatted.replace(/\n/g, '<br>')

  // Handle numbered lists with better formatting
  formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '<div class="ml-4 mb-2 flex"><span class="mr-2 text-primary-600 font-medium">•</span><span>$1</span></div>')

  // Handle bullet points with better formatting
  formatted = formatted.replace(/^[-*]\s(.+)$/gm, '<div class="ml-4 mb-2 flex"><span class="mr-2 text-primary-600 font-medium">•</span><span>$1</span></div>')

  // Handle sub-bullet points
  formatted = formatted.replace(/^\s{2,}[-*]\s(.+)$/gm, '<div class="ml-8 mb-1 flex"><span class="mr-2 text-gray-500">◦</span><span>$1</span></div>')

  // Wrap in paragraph if not already wrapped
  if (!formatted.includes('<p>') && !formatted.includes('<div>') && !formatted.includes('<h')) {
    formatted = `<p class="mb-3">${formatted}</p>`
  }

  return formatted
}

export default function MessageBubble({ message, sender, timestamp, nutritionPlan, workoutPlan }: MessageBubbleProps) {
  const isUser = sender === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="px-4 mb-6"
    >
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser
            ? 'bg-primary-600 text-white'
            : 'bg-primary-600 text-white'
            }`}>
            {isUser ? (
              <User className="w-4 h-4" />
            ) : (
              <span className="text-xs font-semibold">AI</span>
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className={`${isUser ? 'text-right' : 'text-left'}`}>
              <div className={`${isUser
                ? 'inline-block max-w-full bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-3'
                : 'w-full bg-transparent text-gray-900 dark:text-gray-100 py-2'
                }`}>
                <div
                  className={`leading-relaxed break-words whitespace-pre-wrap ${isUser ? 'text-sm' : 'text-sm'
                    }`}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto'
                  }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message) }}
                />
              </div>

              {/* Simple Nutrition Plan Display - No detailed breakdown, just the plan format */}
              {!isUser && nutritionPlan && (
                <div className="mt-4">
                  {/* The nutrition plan is already formatted in the message text, so we don't need to display it again here */}
                  {/* This component just needs to pass the nutritionPlan data to the Generate Meal Plan button */}
                </div>
              )}

              {/* Detailed Workout Plan Display */}
              {!isUser && workoutPlan && (
                <div className="mt-4 bg-white dark:bg-dark-800 rounded-lg border border-gray-200 dark:border-dark-700 p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      💪 Your Detailed Workout Plan
                    </h3>
                    
                    {/* Workout Summary */}
                    <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3 mb-4">
                      <h4 className="font-medium text-primary-900 dark:text-primary-100 mb-2">
                        🎯 {workoutPlan.goal} - {workoutPlan.days} Days/Week
                      </h4>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {workoutPlan.split && workoutPlan.split.map((day: string, idx: number) => (
                          <span key={idx} className="bg-primary-200 dark:bg-primary-800 text-primary-800 dark:text-primary-200 px-2 py-1 rounded">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Exercise Breakdown */}
                    {workoutPlan.exercises && workoutPlan.exercises.length > 0 && (
                      <div className="space-y-4">
                        {workoutPlan.exercises.map((dayPlan, dayIdx: number) => (
                          <div key={dayIdx} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <span className="bg-primary-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm mr-2">
                                {dayIdx + 1}
                              </span>
                              {dayPlan.day_name || dayPlan.day || `Day ${dayIdx + 1}`}
                            </h4>
                            
                            {/* Exercises for this day */}
                            {dayPlan.exercises && dayPlan.exercises.length > 0 && (
                              <div className="space-y-3">
                                {dayPlan.exercises.map((exercise, exIdx: number) => (
                                  <div key={exIdx} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {exercise.name}
                                      </h5>
                                      <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
                                        <div>{exercise.sets} sets × {exercise.reps}</div>
                                        {exercise.rest && <div>Rest: {exercise.rest}</div>}
                                      </div>
                                    </div>
                                    
                                    {/* Exercise details */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                      {exercise.sets && <span>📊 {exercise.sets} sets</span>}
                                      {exercise.reps && <span>🔢 {exercise.reps} reps</span>}
                                      {exercise.weight && <span>🏋️ {exercise.weight}</span>}
                                      {exercise.rest && <span>⏱️ {exercise.rest} rest</span>}
                                    </div>

                                    {/* Exercise notes/tips */}
                                    {exercise.notes && (
                                      <div className="text-sm text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 rounded p-2 mt-2">
                                        <span className="font-medium text-blue-800 dark:text-blue-200">💡 Tip: </span>
                                        {exercise.notes}
                                      </div>
                                    )}

                                    {/* Muscle groups targeted */}
                                    {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                      <div className="mt-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">🎯 Targets: </span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {exercise.muscle_groups.map((muscle: string, muscleIdx: number) => (
                                            <span key={muscleIdx} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                                              {muscle}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Workout Tips */}
                    <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                      <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">🔥 Workout Tips:</h4>
                      <ul className="list-none space-y-1 text-sm text-orange-800 dark:text-orange-200">
                        <li className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          Warm up for 5-10 minutes before starting
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          Focus on proper form over heavy weights
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          Rest 48-72 hours between training same muscle groups
                        </li>
                        <li className="flex items-start">
                          <span className="text-orange-600 mr-2">•</span>
                          Stay hydrated and listen to your body
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {timestamp && (
                <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'
                  }`}>
                  {timestamp}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}