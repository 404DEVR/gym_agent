'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2, Calendar, Target, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WorkoutPlan } from '@/types'

interface WorkoutPlanCardProps {
  plan: WorkoutPlan
  onDelete: () => void
}

export default function WorkoutPlanCard({ plan, onDelete }: WorkoutPlanCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const totalExercises = plan.exercises.reduce((sum, day) => sum + day.exercises.length, 0)

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
              {plan.split.map((splitDay, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded-full"
                >
                  {splitDay}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {plan.days}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Days/Week</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {plan.split.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Split Days</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {totalExercises}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Exercises</div>
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
              {plan.exercises.map((dayPlan, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 capitalize">
                    {dayPlan.day}
                  </h4>
                  
                  <div className="space-y-3">
                    {dayPlan.exercises.map((exercise, exerciseIndex) => (
                      <div key={exerciseIndex} className="bg-gray-50 dark:bg-dark-700 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900 dark:text-white">
                            {exercise.name}
                          </h5>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Sets: </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {exercise.sets}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Reps: </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {exercise.reps}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-gray-600 dark:text-gray-400">Rest: </span>
                            <span className="font-medium text-gray-900 dark:text-white ml-1">
                              {exercise.rest}
                            </span>
                          </div>
                        </div>
                        
                        {exercise.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Notes: </span>
                            {exercise.notes}
                          </div>
                        )}
                      </div>
                    ))}
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