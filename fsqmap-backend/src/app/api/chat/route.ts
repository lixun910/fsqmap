import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText, Tool } from 'ai';
import { z } from 'zod';
import {
  convertToVercelAiTool,
  ToolOutputManager,
  ConversationCache,
} from '@openassistant/utils';
import { placeSearch } from '@openassistant/places';
import { FSQMAP_SYSTEM_MESSAGE } from './systemMessages';

// Create a conversation cache instance with custom configuration
const conversationCache = new ConversationCache({
  maxConversations: 100,
  ttlMs: 1000 * 60 * 60 * 2, // 2 hours
  cleanupProbability: 0.1, // 10%
  enableLogging: true, // Enable logging for debugging
});

function createTools(
  toolOutputManager: ToolOutputManager
): Record<string, Tool> {
  // @ts-expect-error - placeSearch is a valid tool
  const placeSearchTool = convertToVercelAiTool(
    {
      ...placeSearch,
      context: {
        getFsqToken: () => process.env.FSQ_TOKEN || '',
      },
      onToolCompleted: toolOutputManager.createOnToolCompletedCallback(),
    },
    { isExecutable: true }
  );

  return {
    placeSearch: placeSearchTool,
  };
}

export async function POST(req: Request) {
  try {
    console.log('Chat API called');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const { id: requestId, messages } = await req.json();
    console.log('Received messages:', messages);

    // Get conversation-scoped ToolOutputManager
    const toolOutputManager = await conversationCache.getToolOutputManager(
      requestId
    );

    // Create all tools using the tools utility
    const tools = createTools(toolOutputManager);

    // Get location data from headers
    const locationHeader = req.headers.get('x-location');
    let locationData = null;

    if (locationHeader) {
      try {
        locationData = JSON.parse(locationHeader);
        console.log('Parsed location from header:', locationData);
        // append location to last message
        messages[
          messages.length - 1
        ].content += `\n\nThe user's current location is:
latitude: ${locationData.latitude}
longitude: ${locationData.longitude}
accuracy: ${locationData.accuracy}
altitude: ${locationData.altitude}
heading: ${locationData.heading}
speed: ${locationData.speed}
timestamp: ${locationData.timestamp}
`;
      } catch (e) {
        console.log('Failed to parse location header:', e);
      }
    }

    console.log('Messages:', messages);

    return createDataStreamResponse({
      execute: (dataStream) => {
        try {
          const result = streamText({
            model: openai('gpt-4o'),
            system: FSQMAP_SYSTEM_MESSAGE,
            messages,
            // maxTokens: 2000, // Increased from 50w longer responses
            maxSteps: 10,
            tools,
            async onFinish() {
              // Only write tool data to client if tools were actually called in THIS request
              const hasToolOutputsInSession =
                await toolOutputManager.hasToolOutputsInCurrentSession();
              if (hasToolOutputsInSession) {
                const lastToolData =
                  await toolOutputManager.getLastToolOutputFromCurrentSession();
                if (lastToolData) {
                  console.log('write toolData back to client', lastToolData);
                  // @ts-expect-error - toolAdditionalData is a record of unknown values
                  dataStream.writeMessageAnnotation(lastToolData);
                }
              }

              // End the session when request is complete
              await toolOutputManager.endSession();
            },
          });

          result.mergeIntoDataStream(dataStream);
        } catch (error) {
          // Ensure session is ended even on error
          toolOutputManager.endSession().catch(console.error);
          throw error;
        }
      },
      onError: (error) => {
        // Error messages are masked by default for security reasons.
        // If you want to expose the error message to the client, you can do so here:
        return error instanceof Error ? error.message : String(error);
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }));
  }
}
