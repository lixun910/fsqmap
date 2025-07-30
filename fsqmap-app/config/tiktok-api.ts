// TikTok API Configuration
export const TIKTOK_API_CONFIG = {
  // TikTok API endpoints
  baseUrl: 'https://open.tiktokapis.com',
  version: 'v2',
  
  // Authentication endpoints
  auth: {
    authorize: '/oauth/authorize/',
    accessToken: '/oauth/access_token/',
    refreshToken: '/oauth/refresh_token/',
    revokeToken: '/oauth/revoke/',
  },
  
  // Content posting endpoints
  content: {
    create: '/video/init/',
    upload: '/video/part/upload/',
    complete: '/video/part/complete/',
    publish: '/video/publish/',
    query: '/video/query/',
  },
  
  // User info endpoints
  user: {
    info: '/user/info/',
    videos: '/video/list/',
  },
};

// TikTok API scopes
export const TIKTOK_SCOPES = {
  USER_INFO_BASIC: 'user.info.basic',
  VIDEO_LIST: 'video.list',
  VIDEO_PUBLISH: 'video.publish',
  VIDEO_UPLOAD: 'video.upload',
} as const;

// TikTok content types
export const TIKTOK_CONTENT_TYPES = {
  VIDEO: 'video',
  IMAGE: 'image',
} as const;

// TikTok video privacy settings
export const TIKTOK_PRIVACY_SETTINGS = {
  PUBLIC: 'AUTH_CODE',
  PRIVATE: 'SELF_ONLY',
  FRIENDS: 'MUTUAL_FOLLOW',
} as const;

// TikTok API error codes
export const TIKTOK_ERROR_CODES = {
  INVALID_TOKEN: 'access_token_invalid',
  TOKEN_EXPIRED: 'access_token_expired',
  INSUFFICIENT_SCOPE: 'insufficient_scope',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  FILE_TOO_LARGE: 'file_too_large',
  INVALID_FILE_FORMAT: 'invalid_file_format',
} as const;

// TikTok API response types
export interface TikTokAuthResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    open_id: string;
    scope: string;
    token_type: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokVideoInitResponse {
  data: {
    upload_url: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokVideoPublishResponse {
  data: {
    publish_id: string;
    share_id: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokUserInfoResponse {
  data: {
    user: {
      open_id: string;
      union_id: string;
      avatar_url: string;
      avatar_url_100: string;
      avatar_url_200: string;
      display_name: string;
      bio_description: string;
      profile_deep_link: string;
      is_verified: boolean;
      follower_count: number;
      following_count: number;
      likes_count: number;
    };
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

// TikTok content posting interface
export interface TikTokContentData {
  title?: string;
  description?: string;
  privacy_level?: keyof typeof TIKTOK_PRIVACY_SETTINGS;
  disable_duet?: boolean;
  disable_comment?: boolean;
  disable_stitch?: boolean;
  video_cover_timestamp_ms?: number;
  access_token: string;
  open_id: string;
}

// TikTok video upload interface
export interface TikTokVideoUploadData {
  video: {
    uri: string;
    type: string;
    name: string;
  };
  content: TikTokContentData;
} 