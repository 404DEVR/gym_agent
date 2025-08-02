'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Loader2, ChefHat } from 'lucide-react'
import SavePlanButton from '@/components/SavePlanButton'
import { MealPlan } from '@/types'

export default function ChefPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
    const [goal, setGoal] = useState('')
    const [ingredients, setIngredients] = useState('')
    const [dietaryRestrictions, setDietaryRestrictions] = useState('')
    const [targetCalories, setTargetCalories] = useState('')
    const router = useRouter()

    // Function to load nutrition plan data from localStorage (from chatbot)
    const loadNutritionPlanData = useCallback(() => {
        try {
            const nutritionPlanData = localStorage.getItem('nutritionPlanData')
            if (nutritionPlanData) {
                const parsedData = JSON.parse(nutritionPlanData)

                // Pre-fill the form with chatbot data
                setGoal(parsedData.goal || '')
                setIngredients(parsedData.ingredients ? parsedData.ingredients.join(', ') : '')
                setDietaryRestrictions(parsedData.dietary_restrictions ? parsedData.dietary_restrictions.join(', ') : '')
                setTargetCalories(parsedData.target_calories ? parsedData.target_calories.toString() : '')

                // Clear the localStorage data after loading
                localStorage.removeItem('nutritionPlanData')

                // Automatically generate meal plan if we have enough data
                if (parsedData.goal && parsedData.ingredients && parsedData.ingredients.length > 0) {
                    // Small delay to ensure state is updated
                    setTimeout(() => {
                        generateMealPlanFromData(parsedData)
                    }, 500)
                }
            }
        } catch (error) {
            console.error('Error loading nutrition plan data:', error)
        }
    }, [])

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

                    // Check if there's nutrition plan data from chatbot
                    loadNutritionPlanData()
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

                    // Check if there's nutrition plan data from chatbot
                    loadNutritionPlanData()
                }
            }
        )

        return () => {
            mounted = false
            clearTimeout(timer)
            subscription.unsubscribe()
        }
    }, [router, loadNutritionPlanData])

    // Function to generate meal plan from pre-filled data
    const generateMealPlanFromData = async (nutritionData: {
        goal: string;
        ingredients: string[];
        dietary_restrictions?: string[];
        target_calories?: number;
    }) => {
        setGenerating(true)
        try {
            const requestBody = {
                goal: nutritionData.goal,
                ingredients: nutritionData.ingredients,
                dietary_restrictions: nutritionData.dietary_restrictions || [],
                target_calories: nutritionData.target_calories
            }

            const response = await fetch('/api/generate-meal-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            if (response.ok) {
                const data = await response.json()
                setMealPlan(data.mealPlan)
            }
        } catch (error) {
            console.error('Error generating meal plan from chatbot data:', error)
        } finally {
            setGenerating(false)
        }
    }

    const generateMealPlan = async () => {
        if (!goal.trim() || !ingredients.trim()) return

        setGenerating(true)
        try {
            const requestBody = {
                goal,
                ingredients: ingredients.split(',').map(i => i.trim()),
                dietary_restrictions: dietaryRestrictions ? dietaryRestrictions.split(',').map(r => r.trim()) : [],
                target_calories: targetCalories ? parseInt(targetCalories) : undefined
            }

            const response = await fetch('/api/generate-meal-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            })

            if (response.ok) {
                const data = await response.json()
                setMealPlan(data.mealPlan)
            }
        } catch (error) {
            console.error('Error generating meal plan:', error)
        } finally {
            setGenerating(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading chef...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-8">
                    <ChefHat className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        AI Chef
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Generate personalized meal plans with detailed recipes and macro breakdowns
                    </p>
                </div>

                <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 mb-8">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Fitness Goal
                            </label>
                            <input
                                type="text"
                                value={goal}
                                onChange={(e) => setGoal(e.target.value)}
                                placeholder="e.g., Build muscle, Lose weight, Maintain weight"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Available Ingredients (comma-separated)
                            </label>
                            <textarea
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                                placeholder="e.g., chicken, rice, broccoli, eggs, oats, banana"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dietary Restrictions (optional)
                                </label>
                                <input
                                    type="text"
                                    value={dietaryRestrictions}
                                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                                    placeholder="e.g., vegetarian, gluten-free, dairy-free"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Target Daily Calories (optional)
                                </label>
                                <input
                                    type="number"
                                    value={targetCalories}
                                    onChange={(e) => setTargetCalories(e.target.value)}
                                    placeholder="e.g., 2000, 2500"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-dark-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            onClick={generateMealPlan}
                            disabled={generating || !goal.trim() || !ingredients.trim()}
                            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Generating Meal Plan...
                                </>
                            ) : (
                                'Generate Meal Plan'
                            )}
                        </button>
                    </div>
                </div>

                {mealPlan && (
                    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Your Meal Plan
                            </h2>
                            <SavePlanButton
                                type="meal"
                                data={mealPlan}
                                onSave={() => console.log('Meal plan saved!')}
                            />
                        </div>

                        <div className="space-y-6">
                            {mealPlan.meals.map((meal, index) => (
                                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                                {meal.type}: {meal.name}
                                            </h3>
                                            <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                <span>{meal.calories} cal</span>
                                                <span>{meal.protein}g protein</span>
                                                <span>{meal.carbs}g carbs</span>
                                                <span>{meal.fat}g fat</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Cooking Steps:</h4>
                                        <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                            {meal.steps.map((step, stepIndex) => (
                                                <li key={stepIndex}>{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}