import { openai } from '@ai-sdk/openai';
import { createDataStreamResponse, streamText } from 'ai';
import { ConversationCache } from '@openassistant/utils';
import { FSQMAP_SYSTEM_MESSAGE } from './systemMessages';
import { createTools } from '../../lib/tools';

// Create a conversation cache instance with custom configuration
const conversationCache = new ConversationCache({
  maxConversations: 100,
  ttlMs: 1000 * 60 * 60 * 2, // 2 hours
  cleanupProbability: 0.1, // 10%
  enableLogging: true, // Enable logging for debugging
});

export async function POST(req: Request) {
  try {
    console.log('Chat API called');

    const { id: requestId, messages } = await req.json();
    console.log('Request ID:', requestId);

    // Get conversation-scoped ToolOutputManager
    const toolOutputManager = await conversationCache.getToolOutputManager(
      requestId
    );

    // Start the session for this request
    await toolOutputManager.startSession();
    console.log('Session started for requestId:', requestId);

    // Create all tools using the tools utility
    const tools = createTools(toolOutputManager);

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
            // add debug logging to check which tool was called
            onChunk: (event) => {
              const { chunk } = event;
              if (chunk.type === 'tool-call') {
                console.log('✅ Tool called:', chunk.toolName);
              }
            },
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
              console.log('Session ended for requestId:', requestId);
            },
          });

          result.mergeIntoDataStream(dataStream);
        } catch (error) {
          // Ensure session is ended even on error
          console.error('Error in streamText:', error);
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
