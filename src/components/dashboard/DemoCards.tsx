'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Award } from 'lucide-react';

const demoCards = [
  {
    icon: TrendingUp,
    title: 'Bias Detection',
    description: 'Identify unconscious bias in placement communications',
    color: 'from-accent-cyan to-blue-500',
  },
  {
    icon: Users,
    title: 'Inclusive Language',
    description: 'Get suggestions for more inclusive terminology',
    color: 'from-accent-pink to-purple-500',
  },
  {
    icon: Target,
    title: 'Compliance Check',
    description: 'Ensure communications meet legal requirements',
    color: 'from-accent-green to-teal-500',
  },
  {
    icon: Award,
    title: 'Best Practices',
    description: 'Learn from industry-leading examples',
    color: 'from-yellow-500 to-orange-500',
  },
];

export default function DemoCards() {
  return (
    <div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mb-8"
      >
        Features & Capabilities
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {demoCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="glass-effect rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group hover:scale-105"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:shadow-lg transition-all`}>
              <card.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
            <p className="text-gray-400 text-sm">{card.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
