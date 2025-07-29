import React, { useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import {
  View,
  TextInput,
  ScrollView,
  Text,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useLocation } from './hooks/useLocation';
import ToolResult from './components/ToolResult';

export default function App() {
  const {
    location,
    isLoading: locationLoading,
    errorMsg: locationError,
    getCurrentLocation,
  } = useLocation();

  // preserve the tool data between renders
  const toolAdditionalData = useRef<Record<string, unknown>>({});

  const {
    messages,
    error,
    handleInputChange,
    input,
    handleSubmit,
    append,
    setInput,
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
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

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

  if (error) return <Text>{error.message}</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          height: '95%',
          display: 'flex',
          flexDirection: 'column',
          paddingHorizontal: 8,
        }}
      >
        

        <ScrollView style={{ flex: 1 }}>
          {messages.map((m) => (
            <View key={m.id} style={{ marginVertical: 8 }}>
              <View>
                <Text style={{ fontWeight: 700 }}>{m.role}</Text>

                {m.parts.map((p, index) => {
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
                        toolData={toolAdditionalData.current[p.toolInvocation.toolCallId]}
                      />
                    );
                  }
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={{ marginTop: 8 }}>
          <TextInput
            style={{ backgroundColor: 'white', padding: 8 }}
            placeholder="Say something..."
            value={input}
            onChangeText={(text) =>
              handleInputChange({ target: { value: text } } as any)
            }
            onSubmitEditing={handleSubmitWithLocation}
            autoFocus={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
