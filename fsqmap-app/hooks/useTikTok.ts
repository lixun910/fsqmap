import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { tiktokAPI } from '../services/tiktok-api';
import { TikTokContentData, TikTokVideoPublishResponse } from '../config/tiktok-api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TikTokAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  openId: string | null;
  userInfo: any | null;
  isLoading: boolean;
}

interface TikTokUploadState {
  isUploading: boolean;
  uploadProgress: number;
  currentStep: string;
}

export const useTikTok = () => {
  const [authState, setAuthState] = useState<TikTokAuthState>({
    isAuthenticated: false,
    accessToken: null,
    openId: null,
    userInfo: null,
    isLoading: true,
  });

  const [uploadState, setUploadState] = useState<TikTokUploadState>({
    isUploading: false,
    uploadProgress: 0,
    currentStep: '',
  });

  // Load stored credentials on mount
  useEffect(() => {
    loadStoredCredentials();
  }, []);

  const loadStoredCredentials = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('tiktok_access_token');
      const storedOpenId = await AsyncStorage.getItem('tiktok_open_id');
      const storedUserInfo = await AsyncStorage.getItem('tiktok_user_info');

      if (storedToken && storedOpenId) {
        tiktokAPI.setCredentials(storedToken, storedOpenId);
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          accessToken: storedToken,
          openId: storedOpenId,
          userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : null,
          isLoading: false,
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('Error loading stored credentials:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const storeCredentials = async (accessToken: string, openId: string, userInfo?: any) => {
    try {
      await AsyncStorage.setItem('tiktok_access_token', accessToken);
      await AsyncStorage.setItem('tiktok_open_id', openId);
      if (userInfo) {
        await AsyncStorage.setItem('tiktok_user_info', JSON.stringify(userInfo));
      }
    } catch (error) {
      console.error('Error storing credentials:', error);
    }
  };

  const clearStoredCredentials = async () => {
    try {
      await AsyncStorage.removeItem('tiktok_access_token');
      await AsyncStorage.removeItem('tiktok_open_id');
      await AsyncStorage.removeItem('tiktok_user_info');
    } catch (error) {
      console.error('Error clearing stored credentials:', error);
    }
  };

  const authenticate = async (authCode: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));

      const authResponse = await tiktokAPI.exchangeCodeForToken(authCode);
      
      if (authResponse.error) {
        throw new Error(authResponse.error.message);
      }

      const { access_token, open_id } = authResponse.data;
      
      // Get user info
      const userInfoResponse = await tiktokAPI.getUserInfo();
      const userInfo = userInfoResponse.data?.user || null;

      // Store credentials
      await storeCredentials(access_token, open_id, userInfo);

      setAuthState({
        isAuthenticated: true,
        accessToken: access_token,
        openId: open_id,
        userInfo,
        isLoading: false,
      });

      return { success: true, userInfo };
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearStoredCredentials();
      tiktokAPI.clearCredentials();
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        openId: null,
        userInfo: null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const uploadAndPublishVideo = async (
    videoUri: string,
    contentData: TikTokContentData
  ): Promise<TikTokVideoPublishResponse> => {
    try {
      setUploadState({
        isUploading: true,
        uploadProgress: 0,
        currentStep: 'Initializing upload...',
      });

      // Step 1: Initialize upload (10%)
      setUploadState(prev => ({
        ...prev,
        uploadProgress: 10,
        currentStep: 'Initializing upload...',
      }));

      const initResponse = await tiktokAPI.initVideoUpload();
      if (initResponse.error) {
        throw new Error(`Failed to initialize upload: ${initResponse.error.message}`);
      }

      // Step 2: Upload video (30%)
      setUploadState(prev => ({
        ...prev,
        uploadProgress: 30,
        currentStep: 'Uploading video...',
      }));

      const uploadSuccess = await tiktokAPI.uploadVideo(initResponse.data.upload_url, videoUri);
      if (!uploadSuccess) {
        throw new Error('Failed to upload video file');
      }

      // Step 3: Complete upload (60%)
      setUploadState(prev => ({
        ...prev,
        uploadProgress: 60,
        currentStep: 'Completing upload...',
      }));

      const completeSuccess = await tiktokAPI.completeVideoUpload(initResponse.data.upload_url);
      if (!completeSuccess) {
        throw new Error('Failed to complete video upload');
      }

      // Step 4: Publish video (90%)
      setUploadState(prev => ({
        ...prev,
        uploadProgress: 90,
        currentStep: 'Publishing to TikTok...',
      }));

      const publishResponse = await tiktokAPI.publishVideo(contentData);
      if (publishResponse.error) {
        throw new Error(`Failed to publish video: ${publishResponse.error.message}`);
      }

      // Step 5: Complete (100%)
      setUploadState(prev => ({
        ...prev,
        uploadProgress: 100,
        currentStep: 'Published successfully!',
      }));

      // Reset upload state after a delay
      setTimeout(() => {
        setUploadState({
          isUploading: false,
          uploadProgress: 0,
          currentStep: '',
        });
      }, 2000);

      return publishResponse;
    } catch (error) {
      setUploadState({
        isUploading: false,
        uploadProgress: 0,
        currentStep: '',
      });
      throw error;
    }
  };

  const getAuthorizationUrl = () => {
    return tiktokAPI.getAuthorizationUrl();
  };

  return {
    // Auth state
    isAuthenticated: authState.isAuthenticated,
    accessToken: authState.accessToken,
    openId: authState.openId,
    userInfo: authState.userInfo,
    isLoading: authState.isLoading,

    // Upload state
    isUploading: uploadState.isUploading,
    uploadProgress: uploadState.uploadProgress,
    currentStep: uploadState.currentStep,

    // Methods
    authenticate,
    logout,
    uploadAndPublishVideo,
    getAuthorizationUrl,
  };
}; 