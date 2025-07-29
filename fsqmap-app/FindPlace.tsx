import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { NavigationBar } from './components/NavigationBar';
import { commonStyles } from './styles/commonStyles';

interface FindPlaceProps {
  onBack?: () => void;
}

export default function FindPlace({ onBack }: FindPlaceProps) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <NavigationBar title="Find Place" onBack={onBack} />
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.title}>
          Find Place
        </Text>
        <Text style={commonStyles.description}>
          This is the Find Place screen. Implementation coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}