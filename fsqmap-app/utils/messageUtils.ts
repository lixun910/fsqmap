import { Message, UIMessage } from 'ai';

/**
 * Convert a regular Message to UIMessage format
 */
export const convertToUIMessage = (message: Message): UIMessage => {
  return {
    ...message,
    parts: [
      {
        type: 'text',
        text: message.content,
      },
    ],
  };
};

/**
 * Convert a UIMessage back to regular Message format
 */
export const convertToMessage = (uiMessage: UIMessage): Message => {
  const textParts = uiMessage.parts
    .filter(part => part.type === 'text')
    .map(part => (part as { text: string }).text);
  
  return {
    id: uiMessage.id,
    role: uiMessage.role,
    content: textParts.join(''),
    createdAt: uiMessage.createdAt,
  };
};

/**
 * Extract text content from either Message or UIMessage
 */
export const getMessageContent = (message: Message | UIMessage): string => {
  if ('parts' in message && message.parts) {
    // UIMessage format - extract text from parts
    return message.parts
      .filter(part => part.type === 'text')
      .map(part => (part as { text: string }).text)
      .join('') || '';
  } else {
    // Regular Message format - use content directly
    return message.content || '';
  }
}; 