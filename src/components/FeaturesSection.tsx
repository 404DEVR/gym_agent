'use client'

import { motion } from 'framer-motion'
import { Brain, Target, Clock, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get personalized recommendations based on advanced machine learning algorithms that understand your unique fitness profile and goals.',
    color: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: Target,
    title: 'Goal-Oriented Plans',
    description: 'Whether you want to lose weight, build muscle, or improve endurance, our AI creates customized workout and nutrition plans.',
    color: 'text-green-600 dark:text-green-400'
  },
  {
    icon: Clock,
    title: '24/7 Availability',
    description: 'Your fitness assistant never sleeps. Get instant answers to your questions anytime, anywhere, without waiting for appointments.',
    color: 'text-purple-600 dark:text-purple-400'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Monitor your fitness journey with intelligent progress tracking and receive adaptive recommendations as you improve.',
    color: 'text-orange-600 dark:text-orange-400'
  }
]

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-white dark:bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Our AI Fitness Assistant?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Experience the future of fitness with cutting-edge AI technology designed to help you achieve your goals faster and more efficiently.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100 dark:bg-dark-700 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Fitness Journey?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Join thousands of users who have already achieved their fitness goals with our AI assistant.
            </p>
            <button className="btn-primary text-lg px-8 py-3">
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}