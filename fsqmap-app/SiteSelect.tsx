import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { commonStyles } from './styles/commonStyles';

interface SiteSelectProps {
  onBack?: () => void;
}

export default function SiteSelect({ onBack }: SiteSelectProps) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.title}>
          Site Select
        </Text>
        <Text style={commonStyles.description}>
          This is the Site Select screen. Implementation coming soon.
        </Text>
        <TouchableOpacity
          style={commonStyles.backButton}
          onPress={onBack}
        >
          <Text style={commonStyles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}