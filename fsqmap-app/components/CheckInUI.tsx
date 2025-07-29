import React from 'react';
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
  if (error) {
    return (
      <SafeAreaView style={checkInStyles.container}>
        <View style={checkInStyles.mainContainer}>
          <Text style={{ color: 'red', padding: 16 }}>{error.message}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={checkInStyles.container}>
      {/* Back Button */}
      {onBack && (
        <TouchableOpacity
          style={checkInStyles.backButton}
          onPress={onBack}
        >
          <Text style={checkInStyles.backButtonText}>
            ← Back
          </Text>
        </TouchableOpacity>
      )}

      <View style={checkInStyles.mainContainer}>
        <ScrollView style={checkInStyles.scrollView}>
          {messages.map((m) => (
            <View key={m.id} style={checkInStyles.messageContainer}>
              <View>
                <Text style={checkInStyles.messageRole}>{m.role}</Text>

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