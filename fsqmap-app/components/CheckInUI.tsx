import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { ChatInput } from './ChatInput';
import { NavigationBar } from './NavigationBar';
import { TypingIndicator } from './TypingIndicator';
import { MessageList } from './MessageList';
import { NearbyContent } from './NearbyContent';
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
  isLoading: boolean;

  // Actions
  handleInputChange: (text: string) => void;
  handleSubmitWithLocation: () => void;

  // Utility functions
  stripLocationInfo: (content: string) => string;
  toolAdditionalData: Record<string, unknown>;

  // Navigation
  onBack?: () => void;
  onNavigateToForm?: (toolData?: any) => void;
}

export function CheckInUI({
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
  onNavigateToForm,
}: CheckInUIProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [userScrolled, setUserScrolled] = useState(false);
  const [scrollViewHeight, setScrollViewHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  // Mock data for nearby deals and shorts
  const mockDeals = [
    {
      id: '1',
      title: "50% Off Pizza at Domino's",
      description: 'Large pizza with any toppings',
      originalPrice: '$24.99',
      discountedPrice: '$12.49',
      imageUrl:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
      discount: '50% OFF',
    },
    {
      id: '2',
      title: 'Free Coffee at Starbucks',
      description: 'Any grande drink with purchase',
      originalPrice: '$5.99',
      discountedPrice: 'FREE',
      imageUrl:
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop',
      discount: '100% OFF',
    },
    {
      id: '3',
      title: 'Movie Tickets 2-for-1',
      description: 'Valid at AMC theaters',
      originalPrice: '$28.00',
      discountedPrice: '$14.00',
      imageUrl:
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop',
      discount: '50% OFF',
    },
  ];

  const mockShorts = [
    {
      id: '1',
      title: 'Amazing Street Food Tour',
      thumbnail:
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=600&fit=crop',
      duration: '0:45',
      views: '2.1M',
      channel: 'Food Explorer',
    },
    {
      id: '2',
      title: 'Hidden Gems in Your City',
      thumbnail:
        'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=600&fit=crop',
      duration: '1:12',
      views: '890K',
      channel: 'Local Guide',
    },
    {
      id: '3',
      title: 'Quick Workout Routine',
      thumbnail:
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop',
      duration: '0:58',
      views: '1.5M',
      channel: 'Fitness Pro',
    },
  ];

  const handleDealPress = (deal: any) => {
    // Handle deal press - could open deal details or apply the deal
    console.log('Deal pressed:', deal.title);
  };

  const handleShortPress = (short: any) => {
    // Handle short press - could play the video
    console.log('Short pressed:', short.title);
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
          {messages.length <= 2 && (
            <NearbyContent
              deals={mockDeals}
              shorts={mockShorts}
              onDealPress={handleDealPress}
              onShortPress={handleShortPress}
            />
          )}
          <MessageList
            messages={messages}
            isLoading={isLoading}
            stripLocationInfo={stripLocationInfo}
            toolAdditionalData={toolAdditionalData}
            hideFirstMessage={true}
            onCheckInPress={onNavigateToForm}
          />
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
}
