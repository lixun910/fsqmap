# Hooks Optimization

## Overview

The hooks have been optimized by merging `useChatWithLocation` and `useCheckIn` into a single, more flexible `useLocationChat` hook.

## Changes Made

### Before
- `useChatWithLocation`: Location-aware chat with configurable auto-send message
- `useCheckIn`: Hardcoded "Hi" message with "Check in" placeholder (unused)

### After
- `useLocationChat`: Unified hook with configurable options for all use cases

## Benefits

1. **Reduced Code Duplication**: Eliminated ~150 lines of duplicate code
2. **Better Configuration**: Flexible options object instead of positional parameters
3. **Improved Maintainability**: Single source of truth for chat functionality
4. **Enhanced Features**: Added new utility functions like `sendMessage()` and `formatLocationInfo()`

## Usage Examples

### Basic Auto-Send
```typescript
const chat = useLocationChat({ autoSendMessage: 'Hi' });
```

### Custom Configuration
```typescript
const chat = useLocationChat({
  autoSendMessage: 'Help me find a house',
  placeholder: 'Ask about houses...',
  api: 'https://my-api.com/chat'
});
```

### Manual Message Sending
```typescript
const chat = useLocationChat();
chat.sendMessage('Hello world');
```

## Available Options

- `autoSendMessage?: string` - Message to send automatically on mount
- `placeholder?: string` - Input field placeholder text
- `api?: string` - Chat API endpoint (defaults to localhost:3000)
- `onError?: (error: Error) => void` - Custom error handler

## Return Values

The hook returns an object with:
- Location state: `location`, `locationLoading`, `locationError`
- Chat state: `messages`, `error`, `input`, `isLoading`
- Actions: `handleInputChange`, `handleSubmitWithLocation`, `setInput`, `sendMessage`
- Utilities: `stripLocationInfo`, `formatLocationInfo`, `toolAdditionalData`

## Migration Guide

### From useChatWithLocation
```typescript
// Before
const chat = useChatWithLocation('Hi');

// After
const chat = useLocationChat({ autoSendMessage: 'Hi' });
```

### From useCheckIn
```typescript
// Before
const chat = useCheckIn();

// After
const chat = useLocationChat({ 
  autoSendMessage: 'Hi',
  placeholder: 'Check in'
});
``` 