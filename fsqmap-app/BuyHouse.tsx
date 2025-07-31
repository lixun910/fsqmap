import React from 'react';
import { useLocationChat } from './hooks/useChat';
import { BuyHouseUI } from './components/BuyHouseUI';

interface BuyHouseProps {
  onBack?: () => void;
}

export default function BuyHouse({ onBack }: BuyHouseProps) {
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
  } = useLocationChat({ autoSendMessage: 'Help me find a house to buy' });

  return (
    <BuyHouseUI
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