/**
 * Example component demonstrating various animation patterns
 * This file serves as a reference for implementing animations in your components
 */

import { motion } from 'framer-motion'
import { 
  fadeInUp, 
  scaleIn,
  staggerContainer,
  staggerItem,
  smoothTransition,
  springTransition 
} from '../utils/animations'

// Example 1: Simple fade-in animation
export const AnimatedCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={smoothTransition}
      className="p-6 bg-white rounded-lg shadow-md"
    >
      {children}
    </motion.div>
  )
}

// Example 2: Hover and tap animations
export const AnimatedButton = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return (
    <motion.button
      onClick={onClick}
      className="px-6 py-3 bg-blue-500 text-white rounded-lg"
      whileHover={{ scale: 1.05, backgroundColor: '#3b82f6' }}
      whileTap={{ scale: 0.95 }}
      transition={smoothTransition}
    >
      {children}
    </motion.button>
  )
}

// Example 3: Staggered list animation
interface Item {
  id: number
  title: string
  description: string
}

export const AnimatedList = ({ items }: { items: Item[] }) => {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-4"
    >
      {items.map((item) => (
        <motion.div
          key={item.id}
          variants={staggerItem}
          className="p-4 bg-white rounded-lg shadow"
        >
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-gray-600">{item.description}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}

// Example 4: Modal animation
export const AnimatedModal = ({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode 
}) => {
  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        variants={scaleIn}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={springTransition}
        className="bg-white rounded-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

// Example 5: Slide-in sidebar
export const AnimatedSidebar = ({ 
  isOpen, 
  children 
}: { 
  isOpen: boolean
  children: React.ReactNode 
}) => {
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: isOpen ? 0 : -300 }}
      transition={smoothTransition}
      className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg"
    >
      {children}
    </motion.aside>
  )
}

// Example 6: Loading skeleton with pulse
export const LoadingSkeleton = () => {
  return (
    <motion.div
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className="h-20 bg-gray-200 rounded-lg"
    />
  )
}

// Example 7: Number counter animation
export const AnimatedCounter = ({ value }: { value: number }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={value}
      transition={smoothTransition}
    >
      {value}
    </motion.span>
  )
}

// Example 8: Drag and drop
export const DraggableCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
      className="p-4 bg-white rounded-lg shadow cursor-grab"
    >
      {children}
    </motion.div>
  )
}

// Example 9: Sequential animations
export const SequentialAnimation = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.2
          }
        }
      }}
    >
      <motion.h1 variants={fadeInUp}>Welcome</motion.h1>
      <motion.p variants={fadeInUp}>This is a sequential animation</motion.p>
      <motion.button variants={fadeInUp}>Get Started</motion.button>
    </motion.div>
  )
}

// Example 10: Scroll-triggered animation (requires motion viewport)
export const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={smoothTransition}
    >
      {children}
    </motion.div>
  )
}
