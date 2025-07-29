import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatStyles } from '../styles/chatStyles';

interface ChatInputProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onSend: () => void | Promise<void>;
  disabled?: boolean;
}

export function ChatInput({
  inputText,
  onInputChange,
  onSend,
  disabled = false,
}: ChatInputProps) {
  const isSendDisabled = inputText.trim().length === 0 || disabled;

  return (
    <View style={chatStyles.inputContainer}>
      <TextInput
        style={chatStyles.input}
        placeholder="Type a message..."
        value={inputText}
        onChangeText={onInputChange}
        onSubmitEditing={onSend}
        returnKeyType="send"
        multiline
        maxLength={500}
      />
      <TouchableOpacity 
        style={[chatStyles.sendButton, isSendDisabled && chatStyles.sendButtonDisabled]} 
        onPress={() => onSend()}
        disabled={isSendDisabled}
      >
        <Ionicons name="send" size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}; 