import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatStyles } from '../styles/chatStyles';

interface ChatHeaderProps {
  title?: string;
  subtitle?: string;
  onMorePress?: () => void;
}

export function ChatHeader({
  title = 'Chat Assistant',
  subtitle = 'Online',
  onMorePress,
}: ChatHeaderProps) {
  return (
    <View style={chatStyles.header}>
      <View style={chatStyles.headerContent}>
        <View style={chatStyles.avatar}>
          <Ionicons name="person" size={24} color="white" />
        </View>
        <View style={chatStyles.headerText}>
          <Text style={chatStyles.title}>{title}</Text>
          <Text style={chatStyles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity style={chatStyles.moreButton} onPress={onMorePress}>
        <Ionicons name="ellipsis-vertical" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}; 