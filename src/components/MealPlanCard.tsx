'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Calendar, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { MealPlan } from '@/types'

interface MealPlanCardProps {
  plan: MealPlan
  onDelete: () => void
}

export default function MealPlanCard({ plan, onDelete }: MealPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const totalCalories = plan.meals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = plan.meals.reduce((sum, meal) => sum + meal.protein, 0)
  const totalCarbs = plan.meals.reduce((sum, meal) => sum + meal.carbs, 0)
  const totalFat = plan.meals.reduce((sum, meal) => sum + meal.fat, 0)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-primary-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {plan.goal}
              </h3>
            </div>
                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
               <Calendar className="w-4 h-4 mr-1" />
               Created on {plan.created_at ? formatDate(plan.created_at) : 'Unknown date'}
             </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {plan.ingredients.slice(0, 5).map((ingredient, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full"
                >
                  {ingredient}
                </span>
              ))}
              {plan.ingredients.length > 5 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{plan.ingredients.length - 5} more
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalCalories}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Calories</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalProtein}g
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalCarbs}g
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalFat}g
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Fat</div>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-center py-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          {isExpanded ? (
            <>
              Hide Details <ChevronUp className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              View Details <ChevronDown className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700"
          >
            <div className="p-6 space-y-6">
              {plan.meals.map((meal, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                        {meal.type}: {meal.name}
                      </h4>
                      <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span>{meal.calories} cal</span>
                        <span>{meal.protein}g protein</span>
                        <span>{meal.carbs}g carbs</span>
                        <span>{meal.fat}g fat</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">Cooking Steps:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {meal.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="text-sm">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}