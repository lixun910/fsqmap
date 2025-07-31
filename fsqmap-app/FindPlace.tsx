import React from 'react';
import { useLocationChat } from './hooks/useChat';
import { FindPlaceUI } from './components/FindPlaceUI';

interface FindPlaceProps {
  onBack?: () => void;
}

export default function FindPlace({ onBack }: FindPlaceProps) {
  const {
    location,
    locationLoading,
    locationError,
    messages,
    error,
    input,
    isLoading,
    handleInputChange,
    handleSubmitWithLocation,
    stripLocationInfo,
    toolAdditionalData,
  } = useLocationChat({ autoSendMessage: 'Hi' });

  return (
    <FindPlaceUI
      location={location}
      locationLoading={locationLoading}
      locationError={locationError}
      messages={messages}
      error={error}
      input={input}
      isLoading={isLoading}
      handleInputChange={handleInputChange}
      handleSubmitWithLocation={handleSubmitWithLocation}
      stripLocationInfo={stripLocationInfo}
      toolAdditionalData={toolAdditionalData}
      onBack={onBack}
    />
  );
}