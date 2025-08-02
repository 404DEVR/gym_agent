'use client'

import { ChefHat, Dumbbell, User } from 'lucide-react'
import { motion } from 'framer-motion'

interface ProfileTabsProps {
  activeTab: 'profile' | 'meals' | 'workouts'
  onTabChange: (tab: 'profile' | 'meals' | 'workouts') => void
}

export default function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  const getTabPosition = () => {
    switch (activeTab) {
      case 'profile': return '4px'
      case 'meals': return 'calc(33.333% + 2px)'
      case 'workouts': return 'calc(66.666% + 0px)'
      default: return '4px'
    }
  }

  return (
    <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-1">
      <div className="flex relative">
        <motion.div
          className="absolute top-1 bottom-1 bg-primary-600 rounded-md"
          initial={false}
          animate={{
            left: getTabPosition(),
            width: 'calc(33.333% - 4px)'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        
        <button
          onClick={() => onTabChange('profile')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors relative z-10 ${
            activeTab === 'profile'
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <User className="w-5 h-5 mr-2" />
          Profile
        </button>
        
        <button
          onClick={() => onTabChange('meals')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors relative z-10 ${
            activeTab === 'meals'
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ChefHat className="w-5 h-5 mr-2" />
          Meal Plans
        </button>
        
        <button
          onClick={() => onTabChange('workouts')}
          className={`flex-1 flex items-center justify-center py-3 px-4 rounded-md font-medium transition-colors relative z-10 ${
            activeTab === 'workouts'
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Dumbbell className="w-5 h-5 mr-2" />
          Workout Plans
        </button>
      </div>
    </div>
  )
}