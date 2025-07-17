import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function OPTIONS(req: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-location',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('Chat API called');
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));

    const { messages, location } = await req.json();
    console.log('Received messages:', messages);
    console.log('Received location:', location);

    // Also check for location data in headers (for useChat compatibility)
    const locationHeader = req.headers.get('x-location');
    let locationData = location;

    if (locationHeader) {
      try {
        locationData = JSON.parse(locationHeader);
        console.log('Parsed location from header:', locationData);
      } catch (e) {
        console.log('Failed to parse location header:', e);
      }
    }

    // Create a context-aware system message
    let systemMessage =
      'You are a helpful AI assistant for a location-based app called FSQMap. You help users with location-related queries and general assistance.';

    if (locationData) {
      systemMessage += ` The user's current location is: ${locationData.latitude}, ${locationData.longitude}. Use this context when relevant to provide location-specific assistance.`;
    }

    console.log('System message:', systemMessage);

    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: [{ role: 'system', content: systemMessage }, ...messages],
      temperature: 0.7,
      maxTokens: 2000, // Increased from 50w longer responses
    });

    console.log('Streaming response created');
    const response = result.toDataStreamResponse({
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'none',
      },
    });

    return response;
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }));
  }
}
