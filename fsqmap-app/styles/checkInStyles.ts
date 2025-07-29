import { StyleSheet } from 'react-native';

export const checkInStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 8,
  },
  scrollView: {
    flex: 1,
    marginBottom: 80,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  userMessageContent: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  messageRole: {
    fontWeight: '700',
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingBottom: 10,
    backgroundColor: 'white',
  },
  typingIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  typingBubble: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    maxWidth: '80%',
  },
  typingText: {
    fontSize: 16,
    color: '#333',
  },
  typingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#666',
  },
});