import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { commonStyles } from './styles/commonStyles';

interface BuyHouseProps {
  onBack?: () => void;
}

export default function BuyHouse({ onBack }: BuyHouseProps) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.title}>
          Buy House
        </Text>
        <Text style={commonStyles.description}>
          This is the Buy House screen. Implementation coming soon.
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