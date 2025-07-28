'use client';

import { useChat } from '@ai-sdk/react';
import { useRef } from 'react';

export default function ChatPage() {
  // preserve the tool data between renders
  const toolAdditionalData = useRef<Record<string, unknown>>({});

  const {
    messages,
    input,
    handleInputChange: originalHandleInputChange,
    isLoading,
    setInput,
    append,
  } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      console.log('toolCall', toolCall);
    },
    onFinish: (message) => {
      // save the message.annotations from server-side tools for rendering tools
      message.annotations?.forEach((annotation) => {
        if (typeof annotation === 'object' && annotation !== null) {
          // annotation is a record of toolCallId and data from server-side tools
          // save the data for tool rendering
          if ('toolCallId' in annotation && 'data' in annotation) {
            const { toolCallId, data } = annotation as {
              toolCallId: string;
              data: unknown;
            };
            if (toolAdditionalData.current[toolCallId] === undefined) {
              toolAdditionalData.current[toolCallId] = data;
            }
          }
          console.log('toolAdditionalData', toolAdditionalData.current);
        }
      });
    },
  });

  // Custom handleSubmit that appends location data to the input
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Create location data
    const locationData = {
      latitude: 33.244317670169394,
      longitude: -111.86651104079768,
      accuracy: 10,
      altitude: null,
      heading: null,
      speed: null,
      timestamp: Date.now(),
    };

    // Append location data to the input
    const inputWithLocation = `${input}\n\nLocation: ${JSON.stringify(
      locationData
    )}`;

    console.log('Original input value:', input);
    console.log('Input with location data:', inputWithLocation);

    // Use the append method to directly submit the message with location data
    append({
      role: 'user',
      content: inputWithLocation,
    });

    // Clear the input
    setInput('');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">FSQMap Chat</h1>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white ml-auto max-w-xs'
                : 'bg-gray-200 text-gray-800 mr-auto max-w-xs'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-200 text-gray-800 p-3 rounded-lg mr-auto max-w-xs">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={originalHandleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
