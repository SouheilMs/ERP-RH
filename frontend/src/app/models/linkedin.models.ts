export interface LinkedInAuthRequest {
  organizationId: string;
  organizationName: string;
  redirectUri?: string;
}

export interface LinkedInAuthResponse {
  authUrl: string;
  state: string;
  message: string;
  success: boolean;
}

export interface LinkedInTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  scope: string;
  expiresAt: Date;
  organizationUrn: string;
  message: string;
  success: boolean;
}

export interface LinkedInPostResponse {
  id: string;
  activity: string;
  lifecycleState: string;
  errorMessage: string;
  success: boolean;
  createdAt: Date;
  message: string;
}

export interface LinkedInIntegrationStatus {
  connected: boolean;
  status: string;
  lastSync: Date;
  expiresAt: Date;
  organizationName: string;
  statistics: {
    [key: string]: any;
  };
  message: string;
}

export interface LinkedInPost {
  id: string;
  linkedinPostId: string;
  jobOfferId: string;
  organizationId: string;
  content: string;
  status: string;
  publishedAt: Date;
  statistics: {
    likes?: number;
    comments?: number;
    shares?: number;
    impressions?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LinkedInIntegration {
  id: string;
  organizationId: string;
  organizationName: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'ERROR' | 'DISABLED' | 'SYNCING';
  isActive: boolean;
  expiresAt: Date;
  lastSync: Date;
  createdAt: Date;
  updatedAt: Date;
}