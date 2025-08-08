# FSQMap Backend - Chat API

This is the Next.js backend for the FSQMap chat system using Vercel AI SDK.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory and add the required keys:
```
OPENAI_API_KEY=your_openai_api_key_here
FSQ_TOKEN=your_foursquare_api_token_here
MAPBOX_TOKEN=your_mapbox_access_token_here
SERPER_API_KEY=your_serper_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### POST /api/chat
Handles chat messages with streaming responses.

**Request Body:**
```json
{
  "messages": [
    { "role": "user", "content": "Hello" }
  ],
  "location": {
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}
```

**Response:** Streaming text response

## Features

- Streaming chat responses using Vercel AI SDK
- Location-aware context for location-based queries
- OpenAI GPT-3.5-turbo integration
- Real-time message streaming
