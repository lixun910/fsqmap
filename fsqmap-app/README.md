# FSQMap App - React Native Frontend

This is the React Native frontend for the FSQMap chat application using the Vercel AI SDK.

## Features

- **AI SDK Integration**: Uses `useChat` hook from Vercel AI SDK
- **Location Awareness**: Integrates with Expo Location for GPS access
- **Real-time Chat**: Streaming chat responses
- **Cross-platform**: Works on iOS and Android
- **TypeScript**: Full type safety

## Message Format

The app now uses the AI SDK message format:

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

### Message Properties

- **id**: Unique identifier for the message
- **role**: Message role - 'user' for user messages, 'assistant' for AI responses, 'system' for system messages
- **content**: The actual message text

### Extended UI Message

For UI components that need additional properties:

```typescript
interface UIMessage extends Message {
  timestamp?: Date;
  isStreaming?: boolean;
}
```

## Available Hooks

### useVercelChatSimple
Simple implementation using the AI SDK's `useChat` hook:

```typescript
import { useVercelChatSimple } from './hooks/useVercelChatSimple';

const {
  messages,
  inputText,
  setInputText,
  isLoading,
  sendMessage,
} = useVercelChatSimple();
```

### useVercelChat
Advanced implementation with location support:

```typescript
import { useVercelChat } from './hooks/useVercelChat';

const {
  messages,
  inputText,
  setInputText,
  isLoading,
  sendMessage,
} = useVercelChat(getCurrentLocation);
```

## Components

### ChatMessage
Displays individual chat messages using the AI SDK format:

```typescript
import { ChatMessage } from './components/ChatMessage';

<ChatMessage message={message} />
```

### ChatInput
Input component for sending messages:

```typescript
import { ChatInput } from './components/ChatInput';

<ChatInput
  inputText={inputText}
  onInputChange={setInputText}
  onSend={sendMessage}
  disabled={isLoading}
/>
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## API Configuration

The app connects to the backend API. Update the configuration in `config/api.ts`:

```typescript
export const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:3000',
  },
  production: {
    baseUrl: 'https://your-backend-domain.com',
  },
};
```

## Migration from Old Message Format

If you're migrating from the old message format:

**Old Format:**
```typescript
interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isStreaming?: boolean;
}
```

**New AI SDK Format:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}
```

**Migration Steps:**
1. Replace `message.text` with `message.content`
2. Replace `message.isUser` with `message.role === 'user'`
3. Remove `message.timestamp` (add to UIMessage if needed)
4. Remove `message.isStreaming` (add to UIMessage if needed)

## Example Usage

See `examples/AISDKMessageExample.tsx` for a complete example of using the AI SDK message format. 