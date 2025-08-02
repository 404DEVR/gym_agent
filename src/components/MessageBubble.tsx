'use client'

import { motion } from 'framer-motion'
import { User } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  sender: 'user' | 'agent'
  timestamp?: string
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