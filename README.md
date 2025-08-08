# FSQMap - Location-Based Chat Application

A React Native mobile app with a Next.js backend that provides location-aware chat functionality using Vercel AI SDK and OpenAI.

## Project Structure

```
fsqmap/
├── fsqmap-app/          # React Native Expo frontend
├── fsqmap-backend/      # Next.js backend with Vercel AI SDK
├── package.json         # Root package.json for workspace management
└── README.md           # This file
```

## Features

- **Real-time Chat**: Streaming chat responses using Vercel AI SDK
- **Location Awareness**: Automatically includes user location in chat context
- **Cross-platform**: React Native app works on iOS and Android
- **Modern UI**: Clean, responsive chat interface
- **TypeScript**: Full type safety across frontend and backend

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- OpenAI API key
- Xcode and iOS Simulator (iPhone 15)
  - Install Xcode from the App Store and launch it once to finish setup (accept license).
  - In Xcode, go to Settings → Platforms (older versions: Preferences → Components) and download the latest iOS 17.x Simulator.
  - Open the Simulator app and choose Hardware → Device → iPhone 15, or press `i` in the Expo terminal to launch the iOS simulator automatically.

## Setup Instructions

### 1. Install Dependencies

```bash
# Install all dependencies for both projects
npm run install:all
```

### 2. Configure OpenAI API Key

Create a `.env.local` file in the `fsqmap-backend` directory:

```bash
cd fsqmap-backend
echo "OPENAI_API_KEY=your_openai_api_key_here" > .env.local
```

Replace `your_openai_api_key_here` with your actual OpenAI API key.

### 3. Start the Backend

```bash
# Start the Next.js backend server
npm run dev:backend
```

The backend will be available at `http://localhost:3000`

### 4. Start the Frontend

In a new terminal:

```bash
# Start the React Native Expo app
npm run dev:frontend
```

This will start the Expo development server. You can then:
- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your phone

## Development

### Backend (Next.js)

The backend provides a chat API endpoint at `/api/chat` that:

- Accepts POST requests with messages and location data
- Uses Vercel AI SDK for streaming responses
- Integrates with OpenAI GPT-3.5-turbo
- Provides location-aware context to the AI

**API Endpoint:**
```
POST /api/chat
Content-Type: application/json

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

### Frontend (React Native)

The frontend is a React Native Expo app that:

- Uses the `useVercelChat` hook for chat functionality
- Integrates with Expo Location for GPS access
- Provides a modern chat UI with streaming responses
- Handles location permissions automatically

**Key Components:**
- `ChatHeader`: App header with title
- `ChatMessage`: Individual message display
- `ChatInput`: Message input with send button
- `TypingIndicator`: Loading indicator during AI responses

## Available Scripts

### Root Level
- `npm run dev:backend` - Start Next.js backend
- `npm run dev:frontend` - Start React Native frontend
- `npm run install:all` - Install dependencies for all projects
- `npm run build:backend` - Build Next.js backend for production
- `npm run start:backend` - Start production backend

### Backend (fsqmap-backend/)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

### Frontend (fsqmap-app/)
- `npm start` - Start Expo development server
- `npm run android` - Start Android emulator
- `npm run ios` - Start iOS simulator
- `npm run web` - Start web version

## Environment Variables

### Backend (.env.local)
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Troubleshooting

### Common Issues

1. **Backend not connecting**: Make sure the backend is running on `http://localhost:3000`
2. **Location not working**: Ensure location permissions are granted in the app
3. **OpenAI API errors**: Verify your API key is correct and has sufficient credits
4. **Expo connection issues**: Try restarting the Expo development server

### Development Tips

- Use the Expo Go app for quick testing on physical devices
- The backend includes a test page at `http://localhost:3000` to verify the API
- Check the browser console and Expo logs for debugging information

## Technologies Used

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Next.js 14, Vercel AI SDK, OpenAI API
- **Styling**: React Native StyleSheet
- **Location**: Expo Location
- **State Management**: React Hooks

## License

This project is for educational purposes. Please ensure you comply with OpenAI's usage policies when using their API. 