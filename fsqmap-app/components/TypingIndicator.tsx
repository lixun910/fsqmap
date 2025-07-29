import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { checkInStyles } from '../styles/checkInStyles';

export function TypingIndicator() {
  const dot1Opacity = useRef(new Animated.Value(0)).current;
  const dot2Opacity = useRef(new Animated.Value(0)).current;
  const dot3Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.parallel([
          Animated.timing(dot1Opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Reset and repeat the animation
        dot1Opacity.setValue(0);
        dot2Opacity.setValue(0);
        dot3Opacity.setValue(0);
        animateDots();
      });
    };

    animateDots();

    return () => {
      // Cleanup animations on unmount
      dot1Opacity.stopAnimation();
      dot2Opacity.stopAnimation();
      dot3Opacity.stopAnimation();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);

  return (
    <View style={checkInStyles.typingIndicator}>
      <View style={checkInStyles.typingBubble}>
        <View style={checkInStyles.typingContent}>
          <View style={checkInStyles.typingDots}>
            <Animated.View 
              style={[
                checkInStyles.typingDot,
                { opacity: dot1Opacity }
              ]} 
            />
            <Animated.View 
              style={[
                checkInStyles.typingDot,
                { opacity: dot2Opacity }
              ]} 
            />
            <Animated.View 
              style={[
                checkInStyles.typingDot,
                { opacity: dot3Opacity }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}; 