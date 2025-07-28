import React from 'react';
import { useChat } from '@ai-sdk/react';
import { fetch as expoFetch } from 'expo/fetch';
import { View, TextInput, ScrollView, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useLocation } from './hooks/useLocation';

export default function App() {
  const { location, isLoading: locationLoading, errorMsg: locationError, getCurrentLocation } = useLocation();
  
  const { messages, error, handleInputChange, input, handleSubmit } = useChat({
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    api: 'http://localhost:3000/api/chat',
    onError: (error) => console.error(error, 'ERROR'),
    headers: {
      'x-location': location ? JSON.stringify(location) : '',
    },
  });

  // Get location when component mounts
  React.useEffect(() => {
    getCurrentLocation();
  }, []);

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
        {/* Location status indicator */}
        <View style={{ paddingVertical: 8, paddingHorizontal: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            {locationLoading ? (
              <Text style={{ fontSize: 12, color: '#666' }}>📍 Getting location...</Text>
            ) : locationError ? (
              <Text style={{ fontSize: 12, color: '#ff6b6b' }}>❌ Location error: {locationError}</Text>
            ) : location ? (
              <Text style={{ fontSize: 12, color: '#51cf66' }}>
                📍 Location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            ) : (
              <Text style={{ fontSize: 12, color: '#666' }}>📍 Location not available</Text>
            )}
          </View>
          <TouchableOpacity onPress={getCurrentLocation}>
            <Text style={{ fontSize: 12, color: '#007AFF', paddingHorizontal: 8 }}>
              🔄 Refresh
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }}>
          {messages.map((m) => (
            <View key={m.id} style={{ marginVertical: 8 }}>
              <View>
                <Text style={{ fontWeight: 700 }}>{m.role}</Text>

                {m.parts.map((p, index) => {
                  if (p.type === 'text') {
                    return <Markdown key={index}>{p.text}</Markdown>;
                  } else if (p.type === 'reasoning') {
                    return <Markdown key={index}>{p.reasoning}</Markdown>;
                  } else if (p.type === 'tool-invocation') {
                    return <Text key={index}>{JSON.stringify(p.toolInvocation, null, 2)}</Text>;
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
            onChange={(e) =>
              handleInputChange({
                ...e,
                target: {
                  ...e.target,
                  value: e.nativeEvent.text,
                },
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }
            onSubmitEditing={(e) => {
              handleSubmit(e);
              e.preventDefault();
            }}
            autoFocus={true}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
