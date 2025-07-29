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
});