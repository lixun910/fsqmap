import * as FileSystem from 'expo-file-system';
import {
  TIKTOK_API_CONFIG,
  TIKTOK_SCOPES,
  TIKTOK_PRIVACY_SETTINGS,
  TikTokAuthResponse,
  TikTokVideoInitResponse,
  TikTokVideoPublishResponse,
  TikTokUserInfoResponse,
  TikTokContentData,
  TikTokVideoUploadData,
} from '../config/tiktok-api';

// TikTok API Service Class
export class TikTokAPIService {
  private clientKey: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private openId: string | null = null;

  constructor(clientKey: string, clientSecret: string, redirectUri: string) {
    this.clientKey = clientKey;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  // Get authorization URL for OAuth flow
  getAuthorizationUrl(): string {
    const scopes = [
      TIKTOK_SCOPES.USER_INFO_BASIC,
      TIKTOK_SCOPES.VIDEO_LIST,
      TIKTOK_SCOPES.VIDEO_PUBLISH,
      TIKTOK_SCOPES.VIDEO_UPLOAD,
    ].join(',');

    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state: this.generateState(),
    });

    return `${TIKTOK_API_CONFIG.baseUrl}${TIKTOK_API_CONFIG.auth.authorize}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(authCode: string): Promise<TikTokAuthResponse> {
    try {
      const response = await fetch(`${TIKTOK_API_CONFIG.baseUrl}${TIKTOK_API_CONFIG.auth.accessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri,
        }),
      });

      const data = await response.json();
      
      if (data.data) {
        this.accessToken = data.data.access_token;
        this.openId = data.data.open_id;
      }

      return data;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<TikTokAuthResponse> {
    try {
      const response = await fetch(`${TIKTOK_API_CONFIG.baseUrl}${TIKTOK_API_CONFIG.auth.refreshToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cache-Control': 'no-cache',
        },
        body: new URLSearchParams({
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      const data = await response.json();
      
      if (data.data) {
        this.accessToken = data.data.access_token;
        this.openId = data.data.open_id;
      }

      return data;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw error;
    }
  }

  // Get user information
  async getUserInfo(): Promise<TikTokUserInfoResponse> {
    if (!this.accessToken || !this.openId) {
      throw new Error('Access token and open_id are required');
    }

    try {
      const response = await fetch(`${TIKTOK_API_CONFIG.baseUrl}${TIKTOK_API_CONFIG.user.info}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  // Initialize video upload
  async initVideoUpload(): Promise<TikTokVideoInitResponse> {
    if (!this.accessToken || !this.openId) {
      throw new Error('Access token and open_id are required');
    }

    try {
      const response = await fetch(`${TIKTOK_API_CONFIG.baseUrl}${TIKTOK_API_CONFIG.content.create}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: this.accessToken,
          open_id: this.openId,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error initializing video upload:', error);
      throw error;
    }
  }

  // Upload video file
  async uploadVideo(uploadUrl: string, videoUri: string): Promise<boolean> {
    try {
      // Read the video file
      const videoInfo = await FileSystem.getInfoAsync(videoUri);
      if (!videoInfo.exists) {
        throw new Error('Video file does not exist');
      }

      // Create form data for upload
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  }

  // Complete video upload
  async completeVideoUpload(uploadUrl: string): Promise<boolean> {
    try {
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error completing video upload:', error);
      throw error;
    }
  }

  // Publish video to TikTok
  async publishVideo(contentData: TikTokContentData): Promise<TikTokVideoPublishResponse> {
    if (!this.accessToken || !this.openId) {
      throw new Error('Access token and open_id are required');
    }

    try {
      const response = await fetch(`${TIKTOK_API_CONFIG.baseUrl}${TIKTOK_API_CONFIG.content.publish}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contentData,
          access_token: this.accessToken,
          open_id: this.openId,
        }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error publishing video:', error);
      throw error;
    }
  }

  // Complete video upload and publish workflow
  async uploadAndPublishVideo(
    videoUri: string,
    contentData: TikTokContentData
  ): Promise<TikTokVideoPublishResponse> {
    try {
      // Step 1: Initialize video upload
      const initResponse = await this.initVideoUpload();
      if (initResponse.error) {
        throw new Error(`Failed to initialize upload: ${initResponse.error.message}`);
      }

      const uploadUrl = initResponse.data.upload_url;

      // Step 2: Upload video file
      const uploadSuccess = await this.uploadVideo(uploadUrl, videoUri);
      if (!uploadSuccess) {
        throw new Error('Failed to upload video file');
      }

      // Step 3: Complete video upload
      const completeSuccess = await this.completeVideoUpload(uploadUrl);
      if (!completeSuccess) {
        throw new Error('Failed to complete video upload');
      }

      // Step 4: Publish video
      const publishResponse = await this.publishVideo(contentData);
      if (publishResponse.error) {
        throw new Error(`Failed to publish video: ${publishResponse.error.message}`);
      }

      return publishResponse;
    } catch (error) {
      console.error('Error in upload and publish workflow:', error);
      throw error;
    }
  }

  // Set access token and open_id (for when tokens are stored externally)
  setCredentials(accessToken: string, openId: string) {
    this.accessToken = accessToken;
    this.openId = openId;
  }

  // Get current credentials
  getCredentials() {
    return {
      accessToken: this.accessToken,
      openId: this.openId,
    };
  }

  // Clear credentials
  clearCredentials() {
    this.accessToken = null;
    this.openId = null;
  }

  // Generate random state for OAuth
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

// Create and export a default instance
// Note: You'll need to configure these values with your actual TikTok app credentials
export const tiktokAPI = new TikTokAPIService(
  process.env.TIKTOK_CLIENT_KEY || 'your_client_key_here',
  process.env.TIKTOK_CLIENT_SECRET || 'your_client_secret_here',
  process.env.TIKTOK_REDIRECT_URI || 'your_redirect_uri_here'
); 