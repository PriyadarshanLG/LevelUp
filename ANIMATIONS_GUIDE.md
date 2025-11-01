# Page Transition Animations Guide

## Overview
This application now has smooth page transition animations implemented using Framer Motion. Every page navigation will now have a beautiful fade-in and slide animation.

## What's Been Added

### 1. PageTransition Component
Located at: `src/components/PageTransition.tsx`

This component automatically wraps all routes and provides:
- **Fade in/out** effect when changing pages
- **Subtle slide** animation (moves up when entering, down when exiting)
- **Scale effect** for a polished feel
- **Smooth transitions** with custom easing curves

### 2. Animation Utilities
Located at: `src/utils/animations.ts`

Reusable animation presets you can use in any component:

#### Variants
- `fadeInUp` - Fades in with upward movement
- `fadeIn` - Simple fade effect
- `slideInLeft` - Slides in from the left
- `slideInRight` - Slides in from the right
- `scaleIn` - Zooms in smoothly
- `staggerContainer` - For animating lists with delay
- `staggerItem` - Items in a staggered list

#### Transitions
- `smoothTransition` - Default smooth animation (0.4s)
- `fastTransition` - Quick animation (0.2s)
- `springTransition` - Bouncy spring effect

## How to Use

### Automatic Page Transitions
All page transitions are handled automatically. No additional code needed!

### Custom Component Animations

You can add animations to any component using Framer Motion:

```tsx
import { motion } from 'framer-motion'
import { fadeInUp, smoothTransition } from '../utils/animations'

function MyComponent() {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={smoothTransition}
    >
      <h1>Content here</h1>
    </motion.div>
  )
}
```

### Animating Lists

For staggered list animations:

```tsx
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../utils/animations'

function MyList() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {items.map(item => (
        <motion.div key={item.id} variants={staggerItem}>
          {item.content}
        </motion.div>
      ))}
    </motion.div>
  )
}
```

### Button Hover Effects

```tsx
import { motion } from 'framer-motion'

function MyButton() {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      Click me
    </motion.button>
  )
}
```

## Animation Guidelines

### Performance
- All animations use GPU acceleration (transform, opacity)
- Avoid animating width, height, or other layout properties
- Use `will-change` sparingly (already included in CSS)

### Duration
- **Page transitions**: 0.3-0.4s
- **Component animations**: 0.2-0.3s
- **Hover effects**: 0.15-0.2s
- **Micro-interactions**: 0.1-0.15s

### Best Practices
1. Keep animations subtle and purposeful
2. Maintain consistency across the app
3. Don't overuse animations - they should enhance, not distract
4. Test on slower devices to ensure smooth performance
5. Use the provided animation presets for consistency

## Customization

### Change Default Page Transition

Edit `src/components/PageTransition.tsx`:

```tsx
const pageVariants = {
  initial: {
    opacity: 0,    // Change fade amount
    y: 20,         // Change slide distance
    scale: 0.98    // Change scale amount
  },
  // ... modify animate and exit similarly
}
```

### Adjust Timing

Modify the transition duration in the variants:

```tsx
animate: {
  // ...
  transition: {
    duration: 0.5,  // Slower transition
    ease: [0.25, 0.46, 0.45, 0.94]
  }
}
```

## Browser Support

Framer Motion animations work in all modern browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Opera

## Additional Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Animation Principles](https://www.framer.com/motion/animation/)
- [Gesture Animations](https://www.framer.com/motion/gestures/)
