import { useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { useLocation } from './useLocation';

export const useCheckIn = () => {
  const {
    location,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();

  // preserve the tool data between renders
  const toolAdditionalData = useRef<Record<string, unknown>>({});
  const hasAutoSent = useRef(false);

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
    api: 'http://localhost:3000/api/chat',
    onError: (error) => console.error(error, 'ERROR'),
    onFinish: (message) => {
      // save the message.annotations from server-side tools for rendering tools
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
            }
          }
          console.log('toolAdditionalData', toolAdditionalData.current);
        }
      });
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

  // Auto-send "Hi" when component loads and messages are empty
  useEffect(() => {
    // Only auto-send if we haven't sent yet and conditions are met
    if (messages.length === 0 && !isLoading && !locationLoading && !hasAutoSent.current) {
      hasAutoSent.current = true;
      setInput('Hi');
      
      // Try sending immediately first
      let finalValue = 'Hi';

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
        finalValue = 'Hi' + locationInfo;
      }

      // Use the append method to send the message with location
      append({
        role: 'user',
        content: finalValue,
      });

      // clear the input
      setInput('Check in');
    }
  }, [messages.length, isLoading, locationLoading, location, append]);

  // Helper function to strip location information from message content for display
  const stripLocationInfo = (content: string): string => {
    // Remove location information that matches the pattern [Location: ...]
    return content.replace(/\s*\[Location:[^\]]*\]\s*/, '');
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
      finalValue = input + locationInfo;
    }

    // Use the append method to send the message with location
    append({
      role: 'user',
      content: finalValue,
    });

    // Clear the input
    setInput('');
  };

  // Wrapper for handleInputChange to match the expected signature
  const handleInputChangeWrapper = (text: string) => {
    handleInputChange({ target: { value: text } } as any);
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
    
    // Utility functions
    stripLocationInfo,
    toolAdditionalData: toolAdditionalData.current,
  };
};