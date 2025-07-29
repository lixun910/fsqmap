import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { NavigationBar } from './components/NavigationBar';
import { commonStyles } from './styles/commonStyles';

interface BuyHouseProps {
  onBack?: () => void;
}

export default function BuyHouse({ onBack }: BuyHouseProps) {
  return (
    <SafeAreaView style={commonStyles.container}>
      <NavigationBar title="Buy House" onBack={onBack} />
      <View style={commonStyles.centeredContainer}>
        <Text style={commonStyles.title}>
          Buy House
        </Text>
        <Text style={commonStyles.description}>
          This is the Buy House screen. Implementation coming soon.
        </Text>
      </View>
    </SafeAreaView>
  );
}