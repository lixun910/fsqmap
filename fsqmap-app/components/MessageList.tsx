import React from 'react';
import { View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { ToolResult } from './ToolResult';
import { TypingIndicator } from './TypingIndicator';
import { CheckInButton } from './CheckInButton';
import { Message } from '../types/Message';
import { checkInStyles } from '../styles/checkInStyles';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  stripLocationInfo: (content: string) => string;
  toolAdditionalData: Record<string, unknown>;
  hideFirstMessage?: boolean;
  onCheckInPress?: (toolData?: any) => void;
}

export function MessageList({
  messages,
  isLoading,
  stripLocationInfo,
  toolAdditionalData,
  hideFirstMessage = false,
  onCheckInPress,
}: MessageListProps) {
  // State to track selected candidates for each tool invocation
  const [selectedCandidates, setSelectedCandidates] = React.useState<Record<string, any>>({});

  // Filter out the first message if hideFirstMessage is true
  const displayMessages =
    hideFirstMessage && messages.length > 0 ? messages.slice(1) : messages;

  // Handle candidate selection for a specific tool
  const handleCandidateSelect = (toolCallId: string, candidate: any) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [toolCallId]: candidate
    }));
  };

  return (
    <>
      {displayMessages.map((m) => {
        // Check if the message contains a geotagging tool invocation
        const geotaggingToolInvocation = m.parts?.find(
          (p) =>
            p.type === 'tool-invocation' &&
            p.toolInvocation.toolName === 'geotagging'
        ) as any;

        // Only show CheckInButton if geotagging tool data is available and complete
        const showCheckInButton =
          geotaggingToolInvocation &&
          toolAdditionalData[
            geotaggingToolInvocation.toolInvocation.toolCallId
          ] &&
          (
            toolAdditionalData[
              geotaggingToolInvocation.toolInvocation.toolCallId
            ] as any
          )?.datasetName;

        return (
          <View
            key={m.id}
            style={[
              checkInStyles.messageContainer,
              m.role === 'user' && checkInStyles.userMessageContainer,
            ]}
          >
            <View
              style={
                m.role === 'user' ? checkInStyles.userMessageContent : undefined
              }
            >
              {m.parts?.map((p, index) => {
                if (p.type === 'text') {
                  // Strip location info from user messages for display
                  const displayContent =
                    m.role === 'user' ? stripLocationInfo(p.text) : p.text;
                  return <Markdown key={index}>{displayContent}</Markdown>;
                } else if (p.type === 'reasoning') {
                  return <Markdown key={index}>{p.reasoning}</Markdown>;
                } else if (p.type === 'tool-invocation') {
                  const toolData = toolAdditionalData[p.toolInvocation.toolCallId];
                  
                  return (
                    <ToolResult
                      key={index}
                      toolCallId={p.toolInvocation.toolCallId}
                      toolName={p.toolInvocation.toolName}
                      toolData={toolData}
                      isLoading={!toolData} // Show loading if no tool data
                      onCandidateSelect={(candidate) => 
                        handleCandidateSelect(p.toolInvocation.toolCallId, candidate)
                      }
                    />
                  );
                }
              })}
              {showCheckInButton && (
                <CheckInButton
                  onPress={() => {
                    const toolCallId = geotaggingToolInvocation.toolInvocation.toolCallId;
                    const selectedCandidate = selectedCandidates[toolCallId];
                    
                    if (selectedCandidate) {
                      // Pass the selected candidate directly
                      onCheckInPress?.(selectedCandidate);
                    } else {
                      // Fallback to first candidate
                      const toolData =
                        toolAdditionalData[toolCallId];
                      if (
                        toolData &&
                        typeof toolData === 'object' &&
                        'datasetName' in toolData
                      ) {
                        const datasetName = toolData.datasetName as string;
                        const candidates = (toolData as Record<string, any>)[datasetName];
                        onCheckInPress?.(candidates[0]);
                      }
                    }
                  }}
                />
              )}
            </View>
          </View>
        );
      })}

      {isLoading && <TypingIndicator />}
    </>
  );
}
