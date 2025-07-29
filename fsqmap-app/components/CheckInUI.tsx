import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ToolResult } from './ToolResult';
import { ChatInput } from './ChatInput';
import { NavigationBar } from './NavigationBar';
import { Message } from '../types/Message';
import { checkInStyles } from '../styles/checkInStyles';

interface CheckInUIProps {
  // Location state
  location: any;
  locationLoading: boolean;
  locationError: string | null;
  
  // Chat state
  messages: Message[];
  error: Error | null;
  input: string;
  
  // Actions
  handleInputChange: (text: string) => void;
  handleSubmitWithLocation: () => void;
  
  // Utility functions
  stripLocationInfo: (content: string) => string;
  toolAdditionalData: Record<string, unknown>;
  
  // Navigation
  onBack?: () => void;
}

export function CheckInUI({
  location,
  locationLoading,
  locationError,
  messages,
  error,
  input,
  handleInputChange,
  handleSubmitWithLocation,
  stripLocationInfo,
  toolAdditionalData,
  onBack,
}: CheckInUIProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Auto-scroll to bottom when new messages are added (unless user manually scrolled)
  useEffect(() => {
    if (!userScrolled && scrollViewRef.current && contentHeight > scrollViewHeight) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, userScrolled, contentHeight, scrollViewHeight]);

  // Reset user scroll flag when messages are cleared or significantly changed
  useEffect(() => {
    setUserScrolled(false);
  }, [messages.length]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
    
    // If user scrolls away from bottom, mark as user scrolled
    if (!isAtBottom) {
      setUserScrolled(true);
    } else {
      // If user scrolls back to bottom, allow auto-scroll again
      setUserScrolled(false);
    }
  };

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
  };

  const handleLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };

  if (error) {
    return (
      <SafeAreaView style={checkInStyles.container}>
        <NavigationBar title="Check In" onBack={onBack} />
        <View style={checkInStyles.mainContainer}>
          <Text style={{ color: 'red', padding: 16 }}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={checkInStyles.container}>
      <NavigationBar title="Check In" onBack={onBack} />

      <View style={checkInStyles.mainContainer}>
        <ScrollView 
          ref={scrollViewRef}
          style={checkInStyles.scrollView}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          scrollEventThrottle={16}
        >
          {messages.map((m) => (
            <View 
              key={m.id} 
              style={[
                checkInStyles.messageContainer,
                m.role === 'user' && checkInStyles.userMessageContainer
              ]}
            >
              <View style={m.role === 'user' ? checkInStyles.userMessageContent : undefined}>
                {m.parts?.map((p, index) => {
                  if (p.type === 'text') {
                    // Strip location info from user messages for display
                    const displayContent =
                      m.role === 'user' ? stripLocationInfo(p.text) : p.text;
                    return <Markdown key={index}>{displayContent}</Markdown>;
                  } else if (p.type === 'reasoning') {
                    return <Markdown key={index}>{p.reasoning}</Markdown>;
                  } else if (p.type === 'tool-invocation') {
                    return (
                      <ToolResult
                        key={index}
                        toolCallId={p.toolInvocation.toolCallId}
                        toolName={p.toolInvocation.toolName}
                        toolData={toolAdditionalData[p.toolInvocation.toolCallId]}
                      />
                    );
                  }
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={checkInStyles.inputContainer}>
          <ChatInput
            inputText={input}
            onInputChange={handleInputChange}
            onSend={handleSubmitWithLocation}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};