import React from 'react';
import { motion } from 'framer-motion';

function ParticleBackground() {
  const circleCount = 30; // Increase the count of circles

  // Generate an array of circle elements
  const circles = Array.from({ length: circleCount }, (_, index) => (
    <motion.div
      key={index}
      className="h-12 w-12 bg-white rounded-full opacity-30 absolute"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
      animate={{
        x: [0, '100%', '0%'], // Move from left to right and then back to left
        y: [0, '100%', '0%'], // Move from top to bottom and then back to top
        transition: {
          duration: Math.random() * 5 + 3, // Random duration for each particle
          repeat: Infinity,
          repeatType: 'reverse', // Reverse the animation after reaching the end
          ease: 'easeInOut', // Smooth animation
        },
      }}
    />
  ));

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {circles}
    </div>
  );
}

export default ParticleBackground;
