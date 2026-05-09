import { Pressable } from 'react-native'
import React from 'react'

const AnimatedPressable = ({ children, style, ...props }) => {
  return (
    <Pressable {...props} style={({ pressed }) => [
        {
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        style
    ]}>
        {children}
    </Pressable>
  )
}

export default AnimatedPressable

