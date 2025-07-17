import React from 'react';
import { View, Text } from 'react-native';
import { Message, UIMessage } from '../types/Message';
import { getMessageContent } from '../utils/messageUtils';
import { chatStyles } from '../styles/chatStyles';

interface ChatMessageProps {
  message: Message | UIMessage;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const timestamp = new Date(); // You can add timestamp to the message if needed

  const messageContent = getMessageContent(message);

  return (
    <View
      style={[
        chatStyles.messageContainer,
        isUser
          ? chatStyles.userMessageContainer
          : chatStyles.botMessageContainer,
      ]}
    >
      <View
        style={[
          chatStyles.messageBubble,
          isUser ? chatStyles.userMessageBubble : chatStyles.botMessageBubble,
        ]}
      >
        <Text
          style={[
            chatStyles.messageText,
            isUser ? chatStyles.userMessageText : chatStyles.botMessageText,
          ]}
        >
          {String(messageContent)}
        </Text>
        <Text
          style={[
            chatStyles.timestamp,
            isUser ? chatStyles.userTimestamp : chatStyles.botTimestamp,
          ]}
        >
          {timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
};
