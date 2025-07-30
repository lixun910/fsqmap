# TikTok Integration for Foursquare Check-in App

This document explains how to set up and use the TikTok content posting API integration in the Foursquare check-in app.

## Overview

The TikTok integration allows users to:
- Connect their TikTok account via OAuth
- Upload videos directly to TikTok from the check-in form
- Auto-generate captions with venue information and hashtags
- Control privacy settings for posted content
- Track upload progress and publishing status

## Setup Instructions

### 1. TikTok Developer Account

1. Go to [TikTok for Developers](https://developers.tiktok.com/)
2. Create a developer account
3. Create a new app
4. Configure OAuth settings:
   - Redirect URI: `your-app-scheme://tiktok-auth`
   - Scopes: `user.info.basic`, `video.list`, `video.publish`, `video.upload`

### 2. Environment Variables

Add your TikTok app credentials to your environment:

```bash
# .env file
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_REDIRECT_URI=your_redirect_uri_here
```

### 3. Dependencies

The following dependencies are required:

```json
{
  "@react-native-async-storage/async-storage": "^2.1.0",
  "expo-file-system": "^18.1.11",
  "expo-image-picker": "~16.1.4"
}
```

## Components

### TikTokAuth Component

Handles TikTok OAuth authentication and displays user information.

**Features:**
- OAuth flow for TikTok account connection
- User profile display (avatar, name, bio, stats)
- Authentication state management
- Secure token storage

**Usage:**
```tsx
<TikTokAuth onAuthenticated={() => console.log('Connected!')} />
```

### TikTokContentPost Component

Provides the interface for uploading videos to TikTok.

**Features:**
- Video selection from library or camera recording
- Caption editing with auto-generation
- Privacy settings (public, private, friends)
- Content controls (comments, duet, stitch)
- Upload progress tracking
- TikTok-optimized video formatting (9:16 aspect ratio)

**Usage:**
```tsx
<TikTokContentPost
  venueName="Restaurant Name"
  venueLocation="123 Main St"
  onContentPosted={(result) => console.log('Posted:', result)}
/>
```

## API Service

### TikTokAPIService Class

Handles all TikTok API interactions:

- **Authentication**: OAuth flow, token management
- **Video Upload**: Multi-step upload process
- **Content Publishing**: Post videos with metadata
- **User Info**: Fetch profile information

### Key Methods

```typescript
// Initialize authentication
getAuthorizationUrl(): string

// Exchange auth code for tokens
exchangeCodeForToken(authCode: string): Promise<TikTokAuthResponse>

// Upload and publish video
uploadAndPublishVideo(videoUri: string, contentData: TikTokContentData): Promise<TikTokVideoPublishResponse>

// Get user information
getUserInfo(): Promise<TikTokUserInfoResponse>
```

## Custom Hook

### useTikTok Hook

Manages TikTok authentication and upload state:

```typescript
const {
  isAuthenticated,
  userInfo,
  isUploading,
  uploadProgress,
  currentStep,
  authenticate,
  logout,
  uploadAndPublishVideo,
} = useTikTok();
```

## Integration in CheckInForm

The TikTok integration replaces the old media upload functionality:

1. **Authentication Section**: Users connect their TikTok account
2. **Content Creation**: Users select videos and write captions
3. **Privacy Controls**: Users set content visibility and interaction settings
4. **Upload Process**: Videos are uploaded with progress tracking
5. **Success Feedback**: Users receive confirmation of successful posting

## Video Requirements

- **Format**: MP4
- **Aspect Ratio**: 9:16 (portrait)
- **Duration**: Up to 60 seconds
- **Quality**: Optimized for mobile viewing
- **Size**: Follows TikTok's file size limits

## Privacy Settings

- **Public**: Visible to everyone
- **Private**: Only visible to the user
- **Friends**: Visible to mutual followers

## Content Controls

- **Comments**: Enable/disable user comments
- **Duet**: Allow/disable duet creation
- **Stitch**: Allow/disable stitch creation

## Error Handling

The integration includes comprehensive error handling for:

- Network connectivity issues
- Authentication failures
- File upload errors
- API rate limiting
- Invalid file formats
- Permission denials

## Security Considerations

- OAuth tokens are stored securely using AsyncStorage
- API credentials are managed through environment variables
- User consent is required for all TikTok permissions
- Token refresh is handled automatically

## Testing

For development and testing:

1. Use the simulated authentication flow
2. Test with sample videos
3. Verify upload progress tracking
4. Test error scenarios
5. Validate privacy settings

## Production Deployment

Before deploying to production:

1. Configure proper TikTok app credentials
2. Set up secure redirect URIs
3. Test OAuth flow end-to-end
4. Verify video upload functionality
5. Monitor API rate limits
6. Implement proper error logging

## Troubleshooting

### Common Issues

1. **Authentication Fails**: Check client key/secret and redirect URI
2. **Upload Fails**: Verify video format and size requirements
3. **Permission Denied**: Ensure proper scopes are requested
4. **Network Errors**: Check internet connectivity and API endpoints

### Debug Mode

Enable debug logging by setting:

```typescript
console.log('TikTok API Debug:', true);
```

## Future Enhancements

Potential improvements:

- Batch video uploads
- Scheduled posting
- Analytics integration
- Content templates
- Advanced editing features
- Cross-platform sharing 