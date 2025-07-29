import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';

interface SiteSelectProps {
  onBack?: () => void;
}

export default function SiteSelect({ onBack }: SiteSelectProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Site Select
        </Text>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 30 }}>
          This is the Site Select screen. Implementation coming soon.
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
          onPress={onBack}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}