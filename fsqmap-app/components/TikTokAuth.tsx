import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useTikTok } from '../hooks/useTikTok';
import { TIKTOK_PRIVACY_SETTINGS } from '../config/tiktok-api';

interface TikTokAuthProps {
  onAuthenticated?: () => void;
}

export const TikTokAuth: React.FC<TikTokAuthProps> = ({ onAuthenticated }) => {
  const {
    isAuthenticated,
    userInfo,
    isLoading,
    authenticate,
    logout,
    getAuthorizationUrl,
  } = useTikTok();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      
      // In a real app, you would open a WebView or browser for OAuth
      // For now, we'll simulate the authentication flow
      Alert.alert(
        'TikTok Authentication',
        'In a real app, this would open TikTok\'s OAuth page. For demo purposes, we\'ll simulate authentication.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setIsAuthenticating(false),
          },
          {
            text: 'Simulate Auth',
            onPress: async () => {
              try {
                // Simulate authentication with a mock auth code
                await authenticate('mock_auth_code_123');
                onAuthenticated?.();
                Alert.alert('Success', 'Successfully authenticated with TikTok!');
              } catch (error) {
                Alert.alert('Error', 'Failed to authenticate with TikTok');
              } finally {
                setIsAuthenticating(false);
              }
            },
          },
        ]
      );
    } catch (error) {
      setIsAuthenticating(false);
      Alert.alert('Error', 'Failed to start authentication');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Success', 'Successfully logged out from TikTok');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout from TikTok');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF0050" />
        <Text style={styles.loadingText}>Loading TikTok authentication...</Text>
      </View>
    );
  }

  if (isAuthenticated && userInfo) {
    return (
      <View style={styles.container}>
        <View style={styles.userInfoContainer}>
          <Image
            source={{ uri: userInfo.avatar_url_100 }}
            style={styles.avatar}
            defaultSource={require('../assets/logos/foursquare-logo.svg')}
          />
          <View style={styles.userDetails}>
            <Text style={styles.displayName}>{userInfo.display_name}</Text>
            <Text style={styles.bio}>{userInfo.bio_description}</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.stat}>
                {userInfo.follower_count?.toLocaleString()} followers
              </Text>
              <Text style={styles.stat}>
                {userInfo.following_count?.toLocaleString()} following
              </Text>
              <Text style={styles.stat}>
                {userInfo.likes_count?.toLocaleString()} likes
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.authenticatedActions}>
          <Text style={styles.statusText}>✅ Connected to TikTok</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Disconnect TikTok</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Connect to TikTok</Text>
        <Text style={styles.description}>
          Share your check-ins and experiences directly to TikTok
        </Text>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featureTitle}>Features:</Text>
          <Text style={styles.feature}>• Upload photos and videos</Text>
          <Text style={styles.feature}>• Auto-generate captions</Text>
          <Text style={styles.feature}>• Share location tags</Text>
          <Text style={styles.feature}>• Privacy controls</Text>
        </View>

        <TouchableOpacity
          style={[styles.authButton, isAuthenticating && styles.authButtonDisabled]}
          onPress={handleAuthenticate}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.authButtonText}>Connect TikTok Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userDetails: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  stat: {
    fontSize: 12,
    color: '#999',
  },
  authenticatedActions: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  authContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 25,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  feature: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 10,
  },
  authButton: {
    backgroundColor: '#FF0050',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  authButtonDisabled: {
    backgroundColor: '#ccc',
  },
  authButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 