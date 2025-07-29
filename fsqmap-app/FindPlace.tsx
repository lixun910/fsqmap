import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { commonStyles } from './styles/commonStyles';

interface FindPlaceProps {
  onBack?: () => void;
}

export default function FindPlace({ onBack }: FindPlaceProps) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.title}>
          Find Place
        </Text>
        <Text style={commonStyles.description}>
          This is the Find Place screen. Implementation coming soon.
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