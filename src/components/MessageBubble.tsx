'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  sender: 'user' | 'agent'
  timestamp?: string
}

export default function MessageBubble({ message, sender, timestamp }: MessageBubbleProps) {
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
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
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
              <div className={`inline-block max-w-full ${
                isUser 
                  ? 'bg-primary-600 text-white rounded-2xl rounded-br-md px-4 py-3' 
                  : 'bg-transparent text-gray-900 dark:text-gray-100 py-2'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message}
                </p>
              </div>
              
              {timestamp && (
                <div className={`text-xs text-gray-400 dark:text-gray-500 mt-1 ${
                  isUser ? 'text-right' : 'text-left'
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