'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  sender: 'user' | 'agent'
  timestamp?: string
}

// Simple markdown renderer for common formatting
const renderMarkdown = (text: string) => {
  // Handle bold text **text** or __text__
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>')
  
  // Handle italic text *text* or _text_
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>')
  
  // Handle inline code `code`
  formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
  
  // Handle line breaks
  formatted = formatted.replace(/\n/g, '<br>')
  
  // Handle numbered lists
  formatted = formatted.replace(/^\d+\.\s(.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
  
  // Handle bullet points
  formatted = formatted.replace(/^[-*]\s(.+)$/gm, '<div class="ml-4 mb-1">• $1</div>')
  
  return formatted
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
                <div 
                  className="text-sm leading-relaxed break-words"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message) }}
                />
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