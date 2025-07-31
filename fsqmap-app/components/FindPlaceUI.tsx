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
import { PlacesOptions } from './PlacesOptions';
import { Message } from '../types/Message';
import { commonStyles } from '../styles/commonStyles';

interface FindPlaceUIProps {
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

export function FindPlaceUI({
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
}: FindPlaceUIProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const handlePlaceSelect = (category: string, subcategory?: string) => {
    const searchTerm = subcategory ? `${subcategory} ${category}` : category;
    handleInputChange(`Hi`);
  };

  const handleTextToInput = (text: string) => {
    handleInputChange(text);
  };

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
        <NavigationBar title="Find Place" onBack={onBack} />
        <View style={commonStyles.centeredContainer}>
          <Text style={{ color: 'red', padding: 16 }}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      <NavigationBar title="Find Place" onBack={onBack} />

      <View style={commonStyles.mainContainer}>
        {/* PlacesOptions always visible at the top */}
        <PlacesOptions 
          onPlaceSelect={handlePlaceSelect} 
          onTextToInput={handleTextToInput}
        />

        <ScrollView
          ref={scrollViewRef}
          style={commonStyles.scrollView}
          onScroll={handleScroll}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          scrollEventThrottle={16}
        >
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