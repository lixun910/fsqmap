import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Message } from '../types/Message';
import { ChatMessage } from '../components/ChatMessage';

// Example of AI SDK message format
const exampleMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
  },
  {
    id: '2',
    role: 'user',
    content: 'What\'s the weather like?',
  },
  {
    id: '3',
    role: 'assistant',
    content: 'I don\'t have access to real-time weather data, but I can help you with other questions!',
  },
];

export const AISDKMessageExample: React.FC = () => {
  const renderMessage = ({ item }: { item: Message }) => (
    <ChatMessage message={item} />
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
        AI SDK Message Format Example
      </Text>
      <FlatList
        data={exampleMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={{ flex: 1 }}
      />
    </View>
  );
}; 