'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import SavePlanButton from './SavePlanButton'
import { supabase } from '@/lib/supabase'
import axios from 'axios'
import { WorkoutPlan, MealPlan } from '@/types'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: string
  showBothButtons?: boolean
  nutritionPlan?: {
    goal: string
    ingredients: string[]
    dietary_restrictions: string[]
    target_calories: number
    daily_totals: {
      calories: number
      protein: number
    }
    meals: MealPlan['meals']
  }
  workoutPlan?: {
    goal: string
    split: string[]
    days: number
    exercises: WorkoutPlan['exercises']
    user_profile?: UserProfile
  }
}

interface UserProfile {
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

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm your AI Fitness Assistant. I'd love to help you on your fitness journey! To get started, I'd like to know a bit about you. What's your main fitness goal right now - are you looking to lose weight, build muscle, improve endurance, or something else?",
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentWorkoutPlan, setCurrentWorkoutPlan] = useState<WorkoutPlan | null>(null)
  const [showSaveWorkoutButton, setShowSaveWorkoutButton] = useState(false)
  const [currentNutritionPlan, setCurrentNutritionPlan] = useState<MealPlan | null>(null)
  const [showProvideRecipeButton, setShowProvideRecipeButton] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
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
          setUserProfile(data.profile)

          // Update welcome message if profile exists
          if (data.profile && data.profile.age) {
            setMessages([{
              id: '1',
              text: `Welcome back! I see you're ${data.profile.age} years old, ${data.profile.weight}kg, ${data.profile.height}cm, and your goal is to ${data.profile.fitness_goal}. Your daily targets are ${data.profile.target_calories} calories, ${data.profile.target_protein}g protein, ${data.profile.target_carbs}g carbs, and ${data.profile.target_fat}g fat. How can I help you today?`,
              sender: 'agent',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }])
          }
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }

    loadUserProfile()
  }, [])

  // Function to detect if user is providing personal information
  const detectPersonalInfo = (message: string) => {
    const lowerMessage = message.toLowerCase()
    const hasAge = /\b(?:i am|i'm)\s+\d+|\d+\s+(?:years old|year old|yo)\b|\bage\s*:?\s*\d+/.test(lowerMessage)
    const hasWeight = /\b\d+(?:\.\d+)?\s*(?:kg|kgs|kilos?|pounds?|lbs?)\b/.test(lowerMessage)
    const hasHeight = /\b\d+(?:\.\d+)?\s*(?:cm|centimeters?|ft|feet|inches?|'|")\b|\b(?:tall|height)\s+\d+/.test(lowerMessage)
    const hasGender = /\b(?:male|female|man|woman|boy|girl)\b/.test(lowerMessage)
    const hasGoal = /\b(?:lose weight|gain weight|build muscle|lose fat|bulk|cut|maintain)\b/.test(lowerMessage)

    return hasAge || hasWeight || hasHeight || hasGender || hasGoal
  }

  // Function to extract and save personal information
  const extractAndSavePersonalInfo = async (message: string) => {
    const profileUpdate: Partial<UserProfile> = {}

    // Extract age - improved patterns to match "i am 21 years old"
    const ageMatch = message.match(/\b(?:i am|i'm)\s+(\d+)(?:\s+(?:years old|year old|yo))?|\b(\d+)\s+(?:years old|year old|yo)\b|\bage\s*:?\s*(\d+)/i)
    if (ageMatch) {
      profileUpdate.age = parseInt(ageMatch[1] || ageMatch[2] || ageMatch[3])
    }

    // Extract weight - improved patterns
    const weightMatch = message.match(/\b(?:weigh|weight)\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilos?|pounds?|lbs?)\b|\b(\d+(?:\.\d+)?)\s*(?:kg|kgs|kilos?|pounds?|lbs?)\b/i)
    if (weightMatch) {
      let weight = parseFloat(weightMatch[1] || weightMatch[2])
      // Convert pounds to kg if needed
      if (message.toLowerCase().includes('pound') || message.toLowerCase().includes('lbs')) {
        weight = weight * 0.453592 // Convert lbs to kg
      }
      profileUpdate.weight = Math.round(weight * 10) / 10 // Round to 1 decimal
    }

    // Extract height - improved patterns to match "175 cm tall"
    const heightCmMatch = message.match(/\b(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)\s*(?:tall|height)?|\b(?:height|tall)\s*(?:is\s*)?(\d+(?:\.\d+)?)\s*(?:cm|centimeters?)\b/i)
    const heightFtMatch = message.match(/\b(\d+)\s*(?:ft|feet|')\s*(\d+)?\s*(?:in|inches?|")?\s*(?:tall|height)?|\b(?:height|tall)\s*(?:is\s*)?(\d+)\s*(?:ft|feet|')\s*(\d+)?\s*(?:in|inches?|")?\b/i)

    if (heightCmMatch) {
      profileUpdate.height = parseFloat(heightCmMatch[1] || heightCmMatch[2])
    } else if (heightFtMatch) {
      const feet = parseInt(heightFtMatch[1] || heightFtMatch[3])
      const inches = parseInt(heightFtMatch[2] || heightFtMatch[4] || '0')
      profileUpdate.height = Math.round((feet * 30.48 + inches * 2.54) * 10) / 10 // Convert to cm
    }

    // Extract gender - improved patterns
    if (/\b(?:i am|i'm)\s*(?:a\s*)?(?:male|man|boy|guy)\b|\b(?:male|man|boy|guy)\b/i.test(message)) {
      profileUpdate.gender = 'male'
    } else if (/\b(?:i am|i'm)\s*(?:a\s*)?(?:female|woman|girl|lady)\b|\b(?:female|woman|girl|lady)\b/i.test(message)) {
      profileUpdate.gender = 'female'
    }

    // Extract fitness goal - improved patterns
    if (/\b(?:lose weight|weight loss|losing weight|shed weight|drop weight)\b/i.test(message)) {
      profileUpdate.fitness_goal = 'lose weight'
    } else if (/\b(?:gain weight|weight gain|gaining weight|bulk|bulking)\b/i.test(message)) {
      profileUpdate.fitness_goal = 'gain weight'
    } else if (/\b(?:build muscle|muscle gain|gaining muscle|get stronger|strength|muscle building)\b/i.test(message)) {
      profileUpdate.fitness_goal = 'build muscle'
    } else if (/\b(?:maintain|maintenance|stay the same|keep weight)\b/i.test(message)) {
      profileUpdate.fitness_goal = 'maintain weight'
    }

    // If we have enough info to create/update profile
    if (Object.keys(profileUpdate).length > 0) {
      try {
        // Merge with existing profile
        const updatedProfile = { ...userProfile, ...profileUpdate }

        // Set default activity level if not provided (before validation)
        if (!updatedProfile.activity_level) {
          updatedProfile.activity_level = 'moderately_active'
        }

        // Only save if we have the minimum required fields
        if (updatedProfile.age && updatedProfile.weight && updatedProfile.height &&
          updatedProfile.gender && updatedProfile.fitness_goal) {

          // Get the current session for authorization
          const { data: { session } } = await supabase.auth.getSession()

          if (!session?.access_token) {
            return
          }

          const response = await fetch('/api/user-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(updatedProfile)
          })

          if (response.ok) {
            const data = await response.json()
            setUserProfile(data.profile)
          }
        } else {
          // Just update local state for partial info
          setUserProfile(updatedProfile)
        }
      } catch {
        // Silent error handling
      }
    }
  }

  // Parsing functions removed - now using structured JSON from Python API

  // Function to handle saving workout plan
  const handleSaveWorkoutPlan = () => {
    // Don't hide buttons immediately - let SavePlanButton handle the success state
    // Buttons will be hidden when next message is sent
  }

  // All parsing functions removed - now using structured JSON from Python API

  // Function to handle generating meal plan - redirect to chef page with auto-generation
  const handleGenerateMealPlan = () => {
    if (!currentNutritionPlan) return

    // Extract ingredients from the nutrition plan text for chef page
    const extractedIngredients = [
      'oats', 'greek yogurt', 'berries', 'eggs', 'whole grain bread', 'avocado',
      'chicken breast', 'brown rice', 'mixed vegetables', 'olive oil', 'lemon',
      'fish', 'tofu', 'steamed vegetables', 'lentils', 'cucumber',
      'apple', 'peanut butter', 'almonds', 'cottage cheese', 'protein powder'
    ]

    // Structure the nutrition plan data for the chef page (only what's needed for chef page)
    const nutritionPlanData = {
      goal: currentNutritionPlan.goal || 'Weight Loss',
      ingredients: extractedIngredients,
      dietary_restrictions: currentNutritionPlan.dietary_restrictions || [],
      target_calories: currentNutritionPlan.target_calories || 2000,
      auto_generate: true // Flag to auto-generate meal plan
    }

    // Store nutrition plan data in localStorage to pass to chef page
    localStorage.setItem('nutritionPlanData', JSON.stringify(nutritionPlanData))

    // Navigate to chef page
    window.location.href = '/chef'

    setShowProvideRecipeButton(false)
    setCurrentNutritionPlan(null)
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    // Hide any previous save buttons when user sends a new message
    setShowSaveWorkoutButton(false)
    setShowProvideRecipeButton(false)
    setCurrentWorkoutPlan(null)
    setCurrentNutritionPlan(null)

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])

    // Extract and save personal information if detected
    if (detectPersonalInfo(inputMessage)) {
      await extractAndSavePersonalInfo(inputMessage)
    }

    setInputMessage('')
    setIsLoading(true)

    try {
      // Check if we have a valid API URL from environment
      const apiUrl = process.env.NEXT_PUBLIC_API_URL

      if (!apiUrl || apiUrl.includes('your-actual-railway-url') || apiUrl.includes('fitness-rag-agent-production.up.railway.app')) {
        throw new Error('API URL not configured properly')
      }

      // Prepare the message with user profile context
      let messageWithContext = inputMessage
      if (userProfile && userProfile.age) {
        messageWithContext = `User Profile: Age: ${userProfile.age}, Weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm, Gender: ${userProfile.gender}, Goal: ${userProfile.fitness_goal}, Activity Level: ${userProfile.activity_level}, Daily Targets: ${userProfile.target_calories} calories, ${userProfile.target_protein}g protein, ${userProfile.target_carbs}g carbs, ${userProfile.target_fat}g fat. User Message: ${inputMessage}`
      }

      // Get user ID from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || 'anonymous'

      const response = await axios.post(`${apiUrl}/chat`, {
        message: messageWithContext,
        user_id: userId
      })

      const responseText = response.data.response || "I'm sorry, I couldn't process your request right now. Please try again."

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, agentMessage])

      // Check if API returned structured workout plan data
      if (response.data.workout_plan) {
        console.log('🎯 Backend response data:', response.data)
        console.log('🔘 show_both_buttons flag:', response.data.show_both_buttons)

        setCurrentWorkoutPlan(response.data.workout_plan)
        setShowSaveWorkoutButton(true)

        // Add workout plan data to the agent message
        const lastMessage = agentMessage
        lastMessage.workoutPlan = response.data.workout_plan
        lastMessage.showBothButtons = response.data.show_both_buttons || false

        console.log('💾 Message with showBothButtons:', lastMessage.showBothButtons)

        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = lastMessage
          return newMessages
        })
      }

      // Check if API returned structured nutrition plan data
      if (response.data.nutrition_plan) {
        setCurrentNutritionPlan(response.data.nutrition_plan)
        setShowProvideRecipeButton(true)

        // Add nutrition plan data to the agent message
        const lastMessage = agentMessage
        lastMessage.nutritionPlan = response.data.nutrition_plan
        setMessages(prev => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = lastMessage
          return newMessages
        })
      }
    } catch {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://gym-agent-rag.onrender.com'

      let errorText = `I'm sorry, I'm having trouble connecting to the server at ${apiUrl}.`

      errorText += ` No response received from server. This might be a CORS issue or the server might be down.`

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Messages Container - Full height like ChatGPT */}
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="max-w-3xl mx-auto">
          {messages.length === 1 ? (
            /* Welcome screen when only initial message exists */
            <div className="flex flex-col items-center justify-center h-full px-4 py-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AI Fitness Assistant
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Get personalized workout plans, nutrition advice, and expert fitness guidance. How can I help you today?
                </p>
              </div>

              {/* Example prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                <button
                  onClick={() => setInputMessage("I want to lose weight")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">💪 Weight Loss</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">I want to lose weight</div>
                </button>
                <button
                  onClick={() => setInputMessage("I want to build muscle")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">🏋️ Build Muscle</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">I want to build muscle</div>
                </button>
                <button
                  onClick={() => setInputMessage("I want to improve my endurance")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">🏃 Endurance</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">I want to improve my endurance</div>
                </button>
                <button
                  onClick={() => setInputMessage("I'm new to fitness and need guidance")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">🌟 Beginner</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">I&apos;m new to fitness and need guidance</div>
                </button>
              </div>
            </div>
          ) : (
            /* Chat messages */
            <div className="py-4 min-h-0">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message.text}
                    sender={message.sender}
                    timestamp={message.timestamp}
                    nutritionPlan={message.nutritionPlan}
                    workoutPlan={message.workoutPlan}
                  />
                ))}
              </AnimatePresence>

              {/* Save Workout Plan Button(s) */}
              {showSaveWorkoutButton && currentWorkoutPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 mb-4"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center">
                      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-dark-700">
                        {/* Check if we should show both buttons */}
                        {messages.find(msg => msg.showBothButtons) ? (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                              I&apos;ve created your workout plan! Choose what you&apos;d like to do:
                            </p>
                            <div className="flex space-x-3 justify-center">
                              <SavePlanButton
                                type="workout"
                                data={currentWorkoutPlan}
                                onSave={handleSaveWorkoutPlan}
                                action="update"
                              />
                              <SavePlanButton
                                type="workout"
                                data={currentWorkoutPlan}
                                onSave={handleSaveWorkoutPlan}
                                action="add"
                              />
                              <button
                                onClick={() => setShowSaveWorkoutButton(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                              >
                                No thanks
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                              I&apos;ve created a workout plan for you! Would you like to save it to your profile?
                            </p>
                            <div className="flex space-x-3 justify-center">
                              <SavePlanButton
                                type="workout"
                                data={currentWorkoutPlan}
                                onSave={handleSaveWorkoutPlan}
                                action="add"
                              />
                              <button
                                onClick={() => setShowSaveWorkoutButton(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                              >
                                No thanks
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Provide Recipe Button */}
              {showProvideRecipeButton && currentNutritionPlan && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 mb-4"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex justify-center">
                      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-dark-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                          I&apos;ve created a nutrition plan for you! Would you like detailed recipes and cooking instructions?
                        </p>
                        <div className="flex space-x-3 justify-center">
                          <button
                            onClick={handleGenerateMealPlan}
                            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors"
                          >
                            🍽️ Generate Meal Plan
                          </button>
                          <button
                            onClick={() => setShowProvideRecipeButton(false)}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          >
                            No thanks
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 mb-4"
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">AI</span>
                      </div>
                      <div className="bg-gray-100 dark:bg-dark-800 rounded-lg px-4 py-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Extra padding at bottom to ensure last message is fully visible */}
              <div className="h-20"></div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Section - Fixed at bottom like ChatGPT */}
      <div className="border-t border-gray-200 dark:border-dark-700 bg-white dark:bg-dark-900">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={sendMessage} className="flex space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Message AI Fitness Assistant..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-dark-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-800 text-gray-900 dark:text-gray-100 transition-all duration-200 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-dark-600 text-white p-3 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-sm hover:shadow-md disabled:shadow-none"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            AI Fitness Assistant can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}