import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  SafeAreaView,
} from 'react-native';
import { ChatInput } from './ChatInput';
import { NavigationBar } from './NavigationBar';
import { MessageList } from './MessageList';
import { Message } from '../types/Message';
import { commonStyles } from '../styles/commonStyles';

interface BuyHouseUIProps {
  // Location state
  location: any;
  locationLoading: boolean;
  locationError: string | null;

  // Chat state
  messages: Message[];
  error: Error | null;
  input: string;
  isLoading: boolean;

  // Actions
  handleInputChange: (text: string) => void;
  handleSubmitWithLocation: () => void;

  // Utility functions
  stripLocationInfo: (content: string) => string;
  toolAdditionalData: Record<string, unknown>;

  // Navigation
  onBack?: () => void;
}

export function BuyHouseUI({
  location,
  locationLoading,
  locationError,
  messages,
  error,
  input,
  isLoading,
  handleInputChange,
  handleSubmitWithLocation,
  stripLocationInfo,
  toolAdditionalData,
  onBack,
}: BuyHouseUIProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Auto-scroll to bottom when new messages are added (unless user manually scrolled)
  useEffect(() => {
    if (
      !userScrolled &&
      scrollViewRef.current &&
      contentHeight > scrollViewHeight
    ) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, userScrolled, contentHeight, scrollViewHeight]);

  // Reset user scroll flag when messages are cleared or significantly changed
  useEffect(() => {
    setUserScrolled(false);
  }, [messages.length]);

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isAtBottom =
      contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;

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
      <SafeAreaView style={commonStyles.container}>
        <NavigationBar title="Buy House" onBack={onBack} />
        <View style={commonStyles.centeredContainer}>
          <Text style={{ color: 'red', padding: 16 }}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <NavigationBar title="Buy House" onBack={onBack} />

      <View style={commonStyles.mainContainer}>
        <ScrollView
          ref={scrollViewRef}
          style={commonStyles.scrollView}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          scrollEventThrottle={16}
        >
          {messages.length <= 2 && (
            <View style={{ padding: 16, backgroundColor: '#f8f9fa' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 16, color: '#333' }}>
                Looking to buy a house?
              </Text>
              <Text style={{ fontSize: 14, color: '#666', lineHeight: 20 }}>
                I can help you find properties, compare prices, and get information about neighborhoods. 
                Just tell me what you're looking for!
              </Text>
            </View>
          )}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            stripLocationInfo={stripLocationInfo}
            toolAdditionalData={toolAdditionalData}
            hideFirstMessage={true}
          />
        </ScrollView>

        <View style={commonStyles.inputContainer}>
          <ChatInput
            inputText={input}
            onInputChange={handleInputChange}
            onSend={handleSubmitWithLocation}
          />
        </View>
      </View>
    </SafeAreaView>
  );
} 