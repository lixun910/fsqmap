import React from 'react';
import { View, Text } from 'react-native';
import { chatStyles } from '../styles/chatStyles';

export function TypingIndicator() {
  return (
    <View style={chatStyles.typingIndicator}>
      <View style={chatStyles.typingBubble}>
        <Text style={chatStyles.typingText}>Thinking...</Text>
      </View>
    </View>
  );
}; 