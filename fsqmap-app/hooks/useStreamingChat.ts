import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Message } from '../types/Message';
import { LocationData } from './useLocation';

export const useStreamingChat = (getLocation?: () => Promise<LocationData | null>) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! How can I help you today?',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Animation refs
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const dot1Opacity = useRef(new Animated.Value(0.4)).current;
  const dot2Opacity = useRef(new Animated.Value(0.6)).current;
  const dot3Opacity = useRef(new Animated.Value(0.8)).current;

  // Cursor blinking animation
  useEffect(() => {
    if (isStreaming) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(cursorOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [isStreaming, cursorOpacity]);

  // Typing dots animation
  useEffect(() => {
    if (isTyping) {
      const dotAnimation = Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Opacity, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1Opacity, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2Opacity, {
              toValue: 0.4,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3Opacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      dotAnimation.start();
      return () => dotAnimation.stop();
    }
  }, [isTyping, dot1Opacity, dot2Opacity, dot3Opacity]);

  const streamText = (fullText: string, messageId: string) => {
    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: fullText.slice(0, currentIndex) }
              : msg
          )
        );
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 50); // Adjust speed here (lower = faster)
  };

  const sendMessage = async () => {
    if (inputText.trim().length === 0 || isStreaming || isTyping) {
      return;
    }

    let messageText = inputText.trim();
    let locationData: LocationData | null = null;

    // Get location if available
    if (getLocation) {
      try {
        locationData = await getLocation();
        if (locationData) {
          messageText += `\n📍 Location: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}`;
        }
      } catch (error) {
        console.log('Failed to get location:', error);
      }
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages([...messages, newMessage]);
    setInputText('');

    // Simulate bot response with streaming
    setTimeout(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        const botResponseId = (Date.now() + 1).toString();
        const fullBotResponse = "Thanks for your message! I'm processing your request and will provide you with a detailed response shortly. This is a simulated streaming response to demonstrate the typing effect.";
        
        // Add streaming message
        const streamingMessage: Message = {
          id: botResponseId,
          role: 'assistant',
          content: '',
        };
        
        setMessages(prev => [...prev, streamingMessage]);
        setIsStreaming(true);
        setIsTyping(false);
        
        // Start streaming the text
        streamText(fullBotResponse, botResponseId);
      }, 1500); // Typing indicator delay
    }, 1000);
  };

  return {
    messages,
    inputText,
    setInputText,
    isStreaming,
    isTyping,
    cursorOpacity,
    dot1Opacity,
    dot2Opacity,
    dot3Opacity,
    sendMessage,
  };
}; 