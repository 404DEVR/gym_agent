'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2 } from 'lucide-react'
import MessageBubble from './MessageBubble'
import axios from 'axios'

interface Message {
  id: string
  text: string
  sender: 'user' | 'agent'
  timestamp: string
}

export default function ChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI Fitness Assistant. I'm here to help you with workout plans, nutrition advice, and answer any fitness-related questions you have. How can I help you today?",
      sender: 'agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/chat`, {
        message: inputMessage
      })

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.response || "I'm sorry, I couldn't process your request right now. Please try again.",
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, agentMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting to the server right now. Please make sure your fitness agent backend is running on http://localhost:8000 and try again.",
        sender: 'agent',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container - Full height like ChatGPT */}
      <div className="flex-1 overflow-y-auto">
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
                  onClick={() => setInputMessage("Create a beginner workout plan for weight loss")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Workout Plan</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Create a beginner workout plan for weight loss</div>
                </button>
                <button
                  onClick={() => setInputMessage("What should I eat to build muscle?")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Nutrition Advice</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">What should I eat to build muscle?</div>
                </button>
                <button
                  onClick={() => setInputMessage("Calculate my daily calorie needs")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Calorie Calculator</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Calculate my daily calorie needs</div>
                </button>
                <button
                  onClick={() => setInputMessage("How do I improve my running endurance?")}
                  className="p-4 text-left bg-white dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors"
                  disabled={isLoading}
                >
                  <div className="font-medium text-gray-900 dark:text-white mb-1">Training Tips</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">How do I improve my running endurance?</div>
                </button>
              </div>
            </div>
          ) : (
            /* Chat messages */
            <div className="py-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message.text}
                    sender={message.sender}
                    timestamp={message.timestamp}
                  />
                ))}
              </AnimatePresence>

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