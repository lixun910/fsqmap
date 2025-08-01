import React from 'react';
import { View, Text } from 'react-native';
import { GeotaggingResult } from './GeotaggingResult';
import { PlacesResult } from './PlacesResult';

interface ToolResultProps {
  toolCallId: string;
  toolName: string;
  toolData: any;
  onCandidateSelect?: (candidate: any) => void;
}

export function ToolResult({
  toolCallId,
  toolName,
  toolData,
  onCandidateSelect,
}: ToolResultProps) {

  const renderDefaultResult = (data: any) => {
    return (
      <View
        style={{
          backgroundColor: '#f8f9fa',
          padding: 16,
          borderRadius: 8,
          marginVertical: 8,
        }}
      >
        <Text style={{ fontSize: 14, color: '#495057', marginBottom: 8 }}>
          Tool: {toolName}
        </Text>
        <Text
          style={{ fontSize: 12, color: '#6c757d', fontFamily: 'monospace' }}
        >
          {JSON.stringify(data, null, 2)}
        </Text>
      </View>
    );
  };

  switch (toolName) {
    case 'geotagging':
      return (
        <GeotaggingResult
          data={toolData}
          onCandidateSelect={onCandidateSelect}
        />
      );

    case 'placeSearch':
      return (
        <PlacesResult data={toolData} />
      );

    default:
      return renderDefaultResult(toolData);
  }
}
