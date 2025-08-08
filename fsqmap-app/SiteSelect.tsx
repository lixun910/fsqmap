import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { NavigationBar } from './components/NavigationBar';
import { commonStyles } from './styles/commonStyles';

interface SiteSelectProps {
  onBack?: () => void;
}

export default function SiteSelect({ onBack }: SiteSelectProps) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <NavigationBar title="Site Select" onBack={onBack} />
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.title}>
          Looking for bussines site selection?
        </Text>
        <Text style={commonStyles.description}>
          I can help you get the information for the business at your location.
          Demographics, traffics, and more.
        </Text>
      </View>
    </SafeAreaView>
  );
}
