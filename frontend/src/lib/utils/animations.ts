export const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw" // Start off-screen to the left
  },
  animate: {
    opacity: 1,
    x: 0, // Animate to original position
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    x: "100vw", // Exit off-screen to the right
    transition: {
      ease: "easeInOut"
    }
  }
};

// A simpler FADE IN / FADE OUT
export const fadeVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.9
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0 
    }
  }
};