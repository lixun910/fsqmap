import React from 'react';
import { useCheckIn } from './hooks/useCheckIn';
import { CheckInUI } from './components/CheckInUI';

interface CheckInProps {
  onBack?: () => void;
  onNavigateToForm?: (toolData?: any) => void;
}

export default function CheckIn({ onBack, onNavigateToForm }: CheckInProps) {
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
  } = useCheckIn();

  return (
    <CheckInUI
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
      onNavigateToForm={onNavigateToForm}
    />
  );
}