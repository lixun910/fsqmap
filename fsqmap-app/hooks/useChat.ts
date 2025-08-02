import { useRef, useEffect, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { useLocation } from './useLocation';

interface UseChatOptions {
  /** Optional message to automatically send when the component mounts */
  autoSendMessage?: string;
  /** Placeholder text for the input field */
  placeholder?: string;
  /** API endpoint for the chat service */
  api?: string;
  /** Custom error handler */
  onError?: (error: Error) => void;
}

/**
 * Unified chat hook that combines location-aware messaging with AI chat functionality.
 * 
 * This hook automatically handles:
 * - Location detection and formatting
 * - Auto-sending initial messages
 * - Tool data preservation
 * - Input management with placeholders
 * 
 * @param options - Configuration options for the chat hook
 * @returns Object containing chat state, location data, and utility functions
 * 
 * @example
 * // Basic usage with auto-send
 * const chat = useLocationChat({ autoSendMessage: 'Hi' });
 * 
 * @example
 * // Custom configuration
 * const chat = useLocationChat({
 *   autoSendMessage: 'Help me find a house',
 *   placeholder: 'Ask about houses...',
 *   api: 'https://my-api.com/chat'
 * });
 * 
 * @example
 * // Manual message sending
 * const chat = useLocationChat();
 * chat.sendMessage('Hello world');
 */
export const useLocationChat = (options: UseChatOptions = {}) => {
  const {
    autoSendMessage,
    placeholder = '',
    api = 'http://localhost:3000/api/chat',
    onError = (error) => console.error(error, 'ERROR'),
  } = options;

  const {
    location,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();

  // preserve the tool data between renders
  const toolAdditionalData = useRef<Record<string, unknown>>({});
  const hasAutoSent = useRef(false);
  const [toolDataVersion, setToolDataVersion] = useState(0);

  // Create a stable reference to toolAdditionalData that only changes when new data is added
  const stableToolAdditionalData = useMemo(() => toolAdditionalData.current, [toolDataVersion]);

  const {
    messages,
    error,
    handleInputChange,
    input,
    handleSubmit,
    append,
    setInput,
    isLoading,
  } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api,
    onError,
    onFinish: (message) => {
      // save the message.annotations from server-side tools for rendering tools
      let hasNewData = false;
      message.annotations?.forEach((annotation) => {
        if (typeof annotation === 'object' && annotation !== null) {
          // annotation is a record of toolCallId and data from server-side tools
          // save the data for tool rendering
          if ('toolCallId' in annotation && 'data' in annotation) {
            const { toolCallId, data } = annotation as {
              toolCallId: string;
              data: unknown;
            };
            if (toolAdditionalData.current[toolCallId] === undefined) {
              toolAdditionalData.current[toolCallId] = data;
              hasNewData = true;
            }
            console.log('useChat: toolAdditionalData updated', {
              toolCallId,
              data,
              allData: toolAdditionalData.current
            });
          }
        }
      });
      
      // Only trigger re-render if new tool data was added
      if (hasNewData) {
        console.log('useChat: Triggering re-render due to new tool data');
        setToolDataVersion(prev => prev + 1);
      }
    },
  });

  // Get location when component mounts
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Reset auto-send flag when messages are cleared
  useEffect(() => {
    if (messages.length === 0) {
      hasAutoSent.current = false;
    }
  }, [messages.length]);

  // Auto-send message when component loads and messages are empty
  useEffect(() => {
    // Only auto-send if we haven't sent yet and conditions are met
    if (messages.length === 0 && !isLoading && !locationLoading && !hasAutoSent.current && autoSendMessage) {
      hasAutoSent.current = true;
      setInput(placeholder);
      
      // Try sending immediately first
      let finalValue = autoSendMessage;

      // Append location information if available
      if (location) {
        let locationInfo = ` [Location: ${location.latitude}, ${location.longitude}`;

        // Add altitude if available
        if (location.altitude !== undefined) {
          locationInfo += `, Altitude: ${location.altitude}`;
        }

        // Add accuracy if available
        if (location.accuracy !== undefined) {
          locationInfo += `, Accuracy: ${location.accuracy}`;
        }

        locationInfo += ']';
        finalValue = autoSendMessage + locationInfo;
      }

      // Use the append method to send the message with location
      append({
        role: 'user',
        content: finalValue,
      });

      // clear the input
      setInput(placeholder);
    }
  }, [messages.length, isLoading, locationLoading, location, append, autoSendMessage, placeholder]);

  // Helper function to strip location information from message content for display
  const stripLocationInfo = (content: string): string => {
    // Remove location information that matches the pattern [Location: ...]
    return content.replace(/\s*\[Location:[^\]]*\]\s*/, '');
  };

  // Helper function to format location information
  const formatLocationInfo = (): string => {
    if (!location) return '';
    
    let locationInfo = ` [Location: ${location.latitude}, ${location.longitude}`;

    // Add altitude if available
    if (location.altitude !== undefined) {
      locationInfo += `, Altitude: ${location.altitude}`;
    }

    // Add accuracy if available
    if (location.accuracy !== undefined) {
      locationInfo += `, Accuracy: ${location.accuracy}`;
    }

    locationInfo += ']';
    return locationInfo;
  };

  // Custom handleSubmit that appends location to the message before sending
  const handleSubmitWithLocation = () => {
    // Only proceed if there's input text
    if (!input || !input.trim()) {
      return;
    }

    let finalValue = input;

    // Append location information if available
    if (location && input && input.trim()) {
      finalValue = input + formatLocationInfo();
    }

    // Use the append method to send the message with location
    append({
      role: 'user',
      content: finalValue,
    });

    // Clear the input
    setInput(placeholder);
  };

  // Wrapper for handleInputChange to match the expected signature
  const handleInputChangeWrapper = (text: string) => {
    handleInputChange({ target: { value: text } } as any);
  };

  // Function to manually send a message with location
  const sendMessage = (message: string) => {
    const finalValue = message + formatLocationInfo();
    append({
      role: 'user',
      content: finalValue,
    });
  };

  return {
    // Location state
    location,
    locationLoading,
    locationError,
    
    // Chat state
    messages,
    error: error || null,
    input,
    isLoading,
    
    // Actions
    handleInputChange: handleInputChangeWrapper,
    handleSubmitWithLocation,
    setInput,
    sendMessage,
    
    // Utility functions
    stripLocationInfo,
    formatLocationInfo,
    toolAdditionalData: stableToolAdditionalData,
  };
}; 