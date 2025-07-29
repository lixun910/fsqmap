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
          Site Select
        </Text>
        <Text style={commonStyles.description}>
          This is the Site Select screen. Implementation coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}