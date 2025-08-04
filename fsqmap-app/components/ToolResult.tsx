import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { GeotaggingResult } from './GeotaggingResult';
import { PlacesResult } from './PlacesResult';
import { BuyHouseResult } from './BuyHouseResult';

interface ToolResultProps {
  toolCallId: string;
  toolName: string;
  toolData: any;
  onCandidateSelect?: (candidate: any) => void;
  isLoading?: boolean;
}

export function ToolResult({
  toolCallId,
  toolName,
  toolData,
  onCandidateSelect,
  isLoading = false,
}: ToolResultProps) {
  const renderDefaultResult = (data: any) => {
    return null;
    // return (
    //   <View
    //     style={{
    //       backgroundColor: '#f8f9fa',
    //       padding: 16,
    //       borderRadius: 8,
    //       marginVertical: 8,
    //     }}
    //   >
    //     <Text style={{ fontSize: 14, color: '#495057', marginBottom: 8 }}>
    //       Tool: {toolName}
    //     </Text>
    //   </View>
    // );
  };

  switch (toolName) {
    case 'geotagging':
      return (
        <GeotaggingResult
          data={toolData}
          onCandidateSelect={onCandidateSelect}
        />
      );

    case 'findPlace':
      return (
        <PlacesResult data={toolData} isLoading={isLoading} />
      );
    
    case 'buyHouse':
      return (
        <BuyHouseResult 
          data={toolData} 
          isLoading={isLoading}
          redfinUrl={toolData?.redfinUrl || toolData?.additionalData?.redfinUrl}
          redfinDescription={toolData?.redfinDescription || toolData?.additionalData?.redfinDescription || toolData?.llmResult?.redfinDescription}
        />
      );

    default:
      return renderDefaultResult(toolData);
  }
}
