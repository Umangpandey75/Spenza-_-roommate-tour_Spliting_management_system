// Motion configuration with design tokens
export const motionConfig = {
  // Duration tokens
  duration: {
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
  },
  
  // Easing tokens
  ease: {
    default: [0.4, 0, 0.2, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
    bounce: { type: 'spring', stiffness: 400, damping: 10 },
  },
  
  // Common animation variants
  variants: {
    // Fade animations
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    
    fadeInUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    
    fadeInDown: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
    },
    
    // Scale animations
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    
    // Slide animations
    slideInFromLeft: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
    },
    
    slideInFromRight: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 },
    },
    
    slideInFromBottom: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 },
    },
    
    // Drawer specific animations
    drawer: {
      initial: { opacity: 0, y: '100%' },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: '100%' },
    },
    
    // Modal specific animations
    modal: {
      initial: { opacity: 0, scale: 0.95, y: 20 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 20 },
    },
    
    // Overlay animations
    overlay: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    
    // Stagger container
    staggerContainer: {
      animate: {
        transition: {
          staggerChildren: 0.1,
        },
      },
    },
    
    // Stagger item
    staggerItem: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
    },
  },
  
  // Transition presets
  transitions: {
    fast: {
      duration: 0.15,
      ease: [0.4, 0, 0.2, 1],
    },
    normal: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
    slow: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
    spring: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
    bounce: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

// Helper function to get reduced motion variants
export const getMotionVariants = (variantName, respectReducedMotion = true) => {
  const variants = motionConfig.variants[variantName];
  
  if (!variants) {
    console.warn(`Motion variant "${variantName}" not found`);
    return {};
  }
  
  if (respectReducedMotion && typeof window !== 'undefined') {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Return simplified variants for reduced motion
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
    }
  }
  
  return variants;
};

// Helper function to get transition config
export const getTransition = (transitionName = 'normal') => {
  return motionConfig.transitions[transitionName] || motionConfig.transitions.normal;
};